import { installGlobals } from '@remix-run/node'
import { AWSProxy, createRequestHandler } from 'remix-aws'

// Required in Remix v2
installGlobals()

let build = require('./build/server/index.js')

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  awsProxy: AWSProxy.APIGatewayV1
})
