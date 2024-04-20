import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'
// Required in Remix v2
import { AWSProxy, createRequestHandler } from 'remix-aws'
installGlobals()

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  awsProxy: AWSProxy.APIGatewayV1
})
