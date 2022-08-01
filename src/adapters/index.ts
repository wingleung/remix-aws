import type {
  ALBEvent,
  ALBResult,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda'
import type { ApiGatewayV1Adapter } from './api-gateway-v1'
import type { ApiGatewayV2Adapter } from './api-gateway-v2'
import type { ApplicationLoadBalancerAdapter } from './application-load-balancer'
import type {
  Request as NodeRequest,
  Response as NodeResponse,
} from '@remix-run/node'

import { AWSProxy } from '../server'

import { apiGatewayV1Adapter } from './api-gateway-v1'
import { apiGatewayV2Adapter } from './api-gateway-v2'
import { applicationLoadBalancerAdapter } from './application-load-balancer'

interface RemixAdapter<T, U> {
  createRemixRequest: (event: T) => NodeRequest
  sendRemixResponse: (nodeResponse: NodeResponse) => Promise<U>
}

const createRemixAdapter = (awsProxy: AWSProxy): ApiGatewayV1Adapter | ApiGatewayV2Adapter | ApplicationLoadBalancerAdapter => {
  switch (awsProxy) {
    case AWSProxy.APIGatewayV1:
      return apiGatewayV1Adapter
    case AWSProxy.APIGatewayV2:
      return apiGatewayV2Adapter
    case AWSProxy.ALB:
      return applicationLoadBalancerAdapter
  }
}

export {
  createRemixAdapter
}

export type {
  RemixAdapter
}