<div align="center">
  <h1>Remix AWS</h1>
  <img alt="Remix logo" src="https://raw.githubusercontent.com/wingleung/remix-aws/main/docs/img/remix-logo.png"/>
  <p><strong>AWS adapters for Remix</strong></p>
</div>

> **Warning**
> Remix AWS is currently released as a release candidate (RC) and is intended for feedback and testing purposes only.

## 🚀 support

- API gateway v1
- API gateway v2
- Application load balancer

## Getting started

```shell
npm install --save remix-aws
```

```javascript
// server.js
import * as build from '@remix-run/dev/server-build'
import { AWSProxy, createRequestHandler } from 'remix-aws'

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  awsProxy: AWSProxy.APIGatewayV1
})
```

### `awsProxy`

By default the `awsProxy` is set to `AWSProxy.APIGatewayV2`.

#### Options

- `AWSProxy.APIGatewayV1`
- `AWSProxy.APIGatewayV2`
- `AWSProxy.ALB`

## Notes

### split from @remix/architect

As mentioned in [#3173](https://github.com/remix-run/remix/pull/3173) the goal would be to provide an AWS adapter for the community by the community.
In doing so the focus will be on AWS integrations and less on Architect. I do think it's added value to provide examples for Architect, AWS SAM, AWS CDK, Serverless,...

### API gateway v1 vs ALB

The format for the events of [ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html#receive-event-from-load-balancer) is similar to the one for [API gateway v1](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) so this integration is done in 1 location, `src/api/v1.ts`.

**Extra info:** [ALB types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/alb.d.ts#L29-L48) vs [API gateway v1 types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L116-L145)

### To do

- add tests
- add examples
- add more documentation
