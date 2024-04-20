import type { BuildOptions } from 'esbuild'
import type {
  Preset,
  VitePluginConfig
} from '@remix-run/dev'
import type { ResolvedVitePluginConfig } from '@remix-run/dev/dist/vite/plugin'

import * as esbuild from 'esbuild'
import {
  cpSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'fs'
import { join } from 'path'

import { AWSProxy } from './index'

type AwsRemixConfig = {
  awsProxy?: AWSProxy,
  build?: BuildOptions
}

const defaultConfig: AwsRemixConfig = {
  awsProxy: AWSProxy.APIGatewayV2,
  build: {
    logLevel: 'info',
    entryPoints: [
      'build/server.js'
    ],
    bundle: true,
    sourcemap: false,
    platform: 'node',
    outfile: 'build/server/index.js', // will replace remix server build file
    allowOverwrite: true,
    write: true,
  }
}

const copyDefaultServerHandler = (remixUserConfig: ResolvedVitePluginConfig, config: AwsRemixConfig) => {
  const buildDirectory = remixUserConfig.buildDirectory ?? 'build'
  const templateServerFile = join(__dirname, 'server.js')
  const destinationServerFile = join(buildDirectory, 'server.js')

  console.log('📋 Copying generic handler to:', buildDirectory)

  cpSync(templateServerFile, destinationServerFile)

  if (config.awsProxy) {
    let serverFileWithConfig = readFileSync(destinationServerFile, 'utf-8')

    serverFileWithConfig = serverFileWithConfig.replace(
      /awsProxy: .+/,
      `awsProxy: '${config.awsProxy}'`
    )

    writeFileSync(destinationServerFile, serverFileWithConfig, 'utf8')
  }
}

const cleanupHandler = (remixUserConfig: ResolvedVitePluginConfig) => {
  rmSync(
    join(remixUserConfig.buildDirectory ?? 'build', 'server.js')
  )
}

const buildEndHandler: (config: AwsRemixConfig) => VitePluginConfig['buildEnd'] =
  (config) =>
    async (
      {
        remixConfig
      }
    ) => {
      console.log('👷 Building for AWS...')

      const mergedConfig = {
        ...defaultConfig,
        ...config,
        build: {
          ...defaultConfig.build,
          ...config.build
        } as BuildOptions
      }

      const { build } = mergedConfig

      if (!config?.build?.entryPoints) {
        copyDefaultServerHandler(remixConfig, mergedConfig)
      }

      try {
        await esbuild.build(build as BuildOptions)

        console.log('✅ Build for AWS successful!')
      } catch (error) {
        console.error('🚫 Build for AWS failed:', error)

        process.exit(1)
      } finally {
        console.log('🧹 Cleaning up...')

        cleanupHandler(remixConfig)

        console.log('🧹 Cleaned up!')
      }
    }

export function awsPreset(config: AwsRemixConfig = {}): Preset {
  return {
    name: 'aws-preset',
    remixConfig: () => ({
      buildEnd: buildEndHandler(config),
    }),
  }
}
