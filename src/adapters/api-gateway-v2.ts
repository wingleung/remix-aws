import type {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from 'aws-lambda'
import type {
  Response as NodeResponse,
} from '@remix-run/node'

import {
  Headers as NodeHeaders,
  readableStreamToString,
  Request as NodeRequest
} from '@remix-run/node'

import { isBinaryType } from '../binaryTypes'
import { RemixAdapter } from '../server'

function createRemixRequest(event: APIGatewayProxyEventV2): NodeRequest {
  const host = event.headers['x-forwarded-host'] || event.headers.host
  const search = event.rawQueryString.length ? `?${event.rawQueryString}` : ''
  const scheme = event.headers['x-forwarded-proto'] || 'http'

  const url = new URL(event.rawPath + search, `${scheme}://${host}`)
  const isFormData = event.headers['content-type']?.includes(
    'multipart/form-data'
  )

  return new NodeRequest(url.href, {
    method: event.requestContext.http.method,
    headers: createRemixHeaders(event.headers, event.cookies),
    body:
      event.body && event.isBase64Encoded
        ? isFormData
          ? Buffer.from(event.body, 'base64')
          : Buffer.from(event.body, 'base64').toString()
        : event.body,
  })
}

function createRemixHeaders(
  requestHeaders: APIGatewayProxyEventHeaders,
  requestCookies?: string[]
): NodeHeaders {
  const headers = new NodeHeaders()

  for (const [header, value] of Object.entries(requestHeaders)) {
    if (value) {
      headers.append(header, value)
    }
  }

  if (requestCookies) {
    headers.append('Cookie', requestCookies.join('; '))
  }

  return headers
}

async function sendRemixResponse(
  nodeResponse: NodeResponse
): Promise<APIGatewayProxyStructuredResultV2> {
  const cookies: string[] = []

  // AWS API Gateway will send back set-cookies outside of response headers.
  for (const [key, values] of Object.entries(nodeResponse.headers.raw())) {
    if (key.toLowerCase() === 'set-cookie') {
      for (const value of values) {
        cookies.push(value)
      }
    }
  }

  if (cookies.length) {
    nodeResponse.headers.delete('Set-Cookie')
  }

  const contentType = nodeResponse.headers.get('Content-Type')
  const isBase64Encoded = isBinaryType(contentType)
  let body: string | undefined

  if (nodeResponse.body) {
    if (isBase64Encoded) {
      body = await readableStreamToString(nodeResponse.body, 'base64')
    } else {
      body = await nodeResponse.text()
    }
  }

  return {
    statusCode: nodeResponse.status,
    headers: Object.fromEntries(nodeResponse.headers.entries()),
    cookies,
    body,
    isBase64Encoded,
  }
}

export type ApiGatewayV2Adapter = RemixAdapter<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2>

export const apiGatewayV2Adapter: ApiGatewayV2Adapter = {
  createRemixRequest,
  sendRemixResponse
}
