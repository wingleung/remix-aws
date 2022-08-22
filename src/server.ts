import type { Handler } from 'aws-lambda'
import type {
  AppLoadContext,
  Request as NodeRequest,
  Response as NodeResponse,
  ServerBuild,
} from '@remix-run/node'

import {
  createRequestHandler as createRemixRequestHandler
} from '@remix-run/node'

export interface RemixAdapter<T, U> {
  createRemixRequest: (event: T) => NodeRequest
  sendRemixResponse: (nodeResponse: NodeResponse) => Promise<U>
}
/**
 * A function that returns the value to use as `context` in route `loader` and
 * `action` functions.
 *
 * You can think of this as an escape hatch that allows you to pass
 * environment/platform-specific values through to your loader/action.
 */
export type GetLoadContextFunction = <T>(
  event: T
) => AppLoadContext;

/**
 * Returns a request handler for Architect that serves the response using
 * Remix.
 */
export function createRequestHandler<T, U>({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
  adapter,
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
  adapter: RemixAdapter<T, U>, 
}): Handler<T, U> {
  const handleRequest = createRemixRequestHandler(build, mode)

  return async (event: T /*, context*/): Promise<U> => {
    const request = adapter.createRemixRequest(event)
    const loadContext = getLoadContext?.(event)

    const response = (await handleRequest(request, loadContext)) as NodeResponse

    return adapter.sendRemixResponse(response)
  }
}
