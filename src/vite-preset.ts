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

const copyDefaultServerHandler = (
  remixUserConfig: ResolvedVitePluginConfig,
  config: AwsRemixConfig
) => {
  const buildDirectory = remixUserConfig.buildDirectory ?? 'build'
  const templateServerFile = join(__dirname, 'server.js')
  const destinationServerFile = join(buildDirectory, 'server.js')

  console.log('📋 Copying generic handler to:', buildDirectory)

  cpSync(templateServerFile, destinationServerFile)

  if (config.awsProxy) {
    let serverFileWithConfig = readFileSync(destinationServerFile, 'utf-8')

    serverFileWithConfig = serverFileWithConfig
      .replace(
        /awsProxy: .+/,
        `awsProxy: '${config.awsProxy}'`
      )
      .replace(
        './build/server/index.js',
        remixUserConfig.buildDirectory + '/server/' + remixUserConfig.serverBuildFile
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
        remixConfig,
        viteConfig
      }
    ) => {
      console.log('👷 Building for AWS...')

      const mergedConfig = {
        ...defaultConfig,
        ...config,
        build: {
          ...defaultConfig.build,
          format: remixConfig.serverModuleFormat,
          outfile: remixConfig.buildDirectory + '/server/' + remixConfig.serverBuildFile,
          publicPath: viteConfig.base,
          minify: Boolean(viteConfig.build.minify),
          sourcemap: viteConfig.build.sourcemap,
          target: viteConfig.build.target,

          // workaround dynamic require bug
          // https://github.com/evanw/esbuild/issues/1921#issuecomment-2302290651
          mainFields: ['module', 'main'],
          banner: {
            js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
          },

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
        if (!config?.build?.entryPoints) {
          console.log('🧹 Cleaning up...')

          cleanupHandler(remixConfig)

          console.log('🧹 Clean up completed!')
        }
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
