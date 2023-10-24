import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyResult
} from 'aws-lambda'
import type {
  Response as NodeResponse,
} from '@remix-run/node'

import {
  Headers as NodeHeaders,
  readableStreamToString,
  Request as NodeRequest
} from '@remix-run/node'
import { URLSearchParams } from 'url'

import { isBinaryType } from '../binaryTypes'
import { RemixAdapter } from '../server'

function createRemixRequest(event: APIGatewayProxyEvent): NodeRequest {
  const host = event.headers['x-forwarded-host'] || event.headers.Host
  const scheme = event.headers['x-forwarded-proto'] || 'http'

  const rawQueryString = new URLSearchParams(event.queryStringParameters as Record<string, string>).toString()
  const search = rawQueryString.length > 0 ? `?${rawQueryString}` : ''
  const url = new URL(event.path + search, `${scheme}://${host}`)

  const isFormData = event.headers['content-type']?.includes(
    'multipart/form-data'
  )

  return new NodeRequest(url.href, {
    method: event.requestContext.httpMethod,
    headers: createRemixHeaders(event.headers),
    body:
      event.body && event.isBase64Encoded
        ? isFormData
          ? Buffer.from(event.body, 'base64')
          : Buffer.from(event.body, 'base64').toString()
        : event.body || undefined,
  })
}

function createRemixHeaders(
  requestHeaders: APIGatewayProxyEventHeaders
): NodeHeaders {
  const headers = new NodeHeaders()

  for (const [header, value] of Object.entries(requestHeaders)) {
    if (value) {
      headers.append(header, value)
    }
  }

  return headers
}

async function sendRemixResponse(
  nodeResponse: NodeResponse
): Promise<APIGatewayProxyResult> {
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
    body: body || '',
    isBase64Encoded,
  }
}

export type ApiGatewayV1Adapter = RemixAdapter<APIGatewayProxyEvent, APIGatewayProxyResult>

export const apiGatewayV1Adapter: ApiGatewayV1Adapter = {
  createRemixRequest,
  sendRemixResponse
}
