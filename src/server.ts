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
  ServerBuild,
} from '@remix-run/node'

import {
  createRequestHandler as createRemixRequestHandler
} from '@remix-run/node'

import { createRemixAdapter } from './adapters'

export enum AWSProxy {
  APIGatewayV1 = 'APIGatewayV1',
  APIGatewayV2 = 'APIGatewayV2',
  ALB = 'ALB',
  FunctionURL = 'FunctionURL'
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
  awsProxy = AWSProxy.APIGatewayV2
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
  awsProxy?: AWSProxy;
}): RequestHandler {
  const handleRequest = createRemixRequestHandler(build, mode)

  return async (event: APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent /*, context*/) => {
    const awsAdapter = createRemixAdapter(awsProxy)
    const request = awsAdapter.createRemixRequest(event as APIGatewayProxyEvent & APIGatewayProxyEventV2 & ALBEvent)
    const loadContext = getLoadContext?.(event)

    const response = (await handleRequest(request, loadContext)) as Response

    return awsAdapter.sendRemixResponse(response)
  }
}
