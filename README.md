<div align="center">
  <h1>Remix AWS</h1>
  <p align="left">
    <a href="https://www.npmjs.com/package/remix-aws?activeTab=versions">
      <img src="https://badge.fury.io/js/remix-aws.svg" alt="npm version" style="max-width:100%;">
    </a>
    <a href="https://packagephobia.com/result?p=remix-aws">
      <img src="https://packagephobia.com/badge?p=remix-aws" alt="npm install size" style="max-width:100%;">
    </a>
    <a href="https://snyk.io/test/github/wingleung/remix-aws">
      <img src="https://snyk.io/test/github/wingleung/remix-aws/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/wingleung/remix-aws" style="max-width:100%;">
    </a>
  </p>
  <img alt="Remix logo" src="https://raw.githubusercontent.com/wingleung/remix-aws/main/docs/img/remix-logo.png"/>
  <p><strong>AWS adapters for Remix</strong></p>
</div>

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
import {AWSProxy, createRequestHandler} from 'remix-aws'

// Required in Remix v2
import { installGlobals } from '@remix-run/node'
installGlobals()

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
- `AWSProxy.FunctionURL`

## Notes

### split from @remix/architect

As mentioned in [#3173](https://github.com/remix-run/remix/pull/3173) the goal would be to provide an AWS adapter for
the community by the community.
In doing so the focus will be on AWS integrations and less on Architect. I do think it's added value to provide examples
for Architect, AWS SAM, AWS CDK, Serverless,...

**info:** [ALB types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/alb.d.ts#L29-L48)
vs [API gateway v1 types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L116-L145)

### To do

- add tests
- add examples
- add more documentation
