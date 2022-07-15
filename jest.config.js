const ignorePatterns = [
  '\\/build\\/',
  '\\/coverage\\/',
  '\\/\\.vscode\\/',
  '\\/\\.tmp\\/',
  '\\/\\.cache\\/',
]

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  displayName: 'remix-aws',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ignorePatterns,
  watchPathIgnorePatterns: [...ignorePatterns, '\\/node_modules\\/'],
  testMatch: ['<rootDir>/**/*-test.[t]s?(x)'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  watchPlugins: [
    require.resolve('jest-watch-select-projects'),
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
}
