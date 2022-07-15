import type {
  ALBEvent,
  ALBHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyHandler,
  APIGatewayProxyHandlerV2
} from 'aws-lambda'
import type {
  AppLoadContext,
  Response as NodeResponse,
  ServerBuild,
} from '@remix-run/node'

import {
  createRequestHandler as createRemixRequestHandler
} from '@remix-run/node'

import {
  createRemixRequest,
  sendRemixResponse
} from './api/v1'
import {
  createRemixRequest as createRemixRequestV2,
  sendRemixResponse as sendRemixResponseV2 } from './api/v2'

// TODO add support for ALB
export enum APIGatewayVersion {
  v1 = 'v1',
  v2 = 'v2',
}

/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */
export type GetLoadContextFunction = (
  event: APIGatewayProxyEventV2 | APIGatewayProxyEvent | ALBEvent
) => AppLoadContext;

export type RequestHandler = APIGatewayProxyHandlerV2 | APIGatewayProxyHandler | ALBHandler;

/**
 * Returns a request handler for Architect that serves the response using
 * Remix.
 */
export function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
  apiGatewayVersion = APIGatewayVersion.v2
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
  apiGatewayVersion?: APIGatewayVersion;
}): RequestHandler {
  const handleRequest = createRemixRequestHandler(build, mode)

  return async (event: APIGatewayProxyEvent | APIGatewayProxyEventV2 /*, context*/) => {
    const request = apiGatewayVersion === APIGatewayVersion.v1
      ? createRemixRequest(event as APIGatewayProxyEvent)
      : createRemixRequestV2(event as APIGatewayProxyEventV2)
    const loadContext = getLoadContext?.(event)

    const response = (await handleRequest(request, loadContext)) as NodeResponse

    return apiGatewayVersion === APIGatewayVersion.v1
      ? sendRemixResponse(response)
      : sendRemixResponseV2(response)
  }
}