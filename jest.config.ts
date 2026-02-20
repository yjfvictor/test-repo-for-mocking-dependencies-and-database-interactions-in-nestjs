/**
 * @file jest.config.ts
 * @brief Jest configuration for unit and integration tests.
 * @details Configures test environment, module path mapping, and coverage. All test files
 *          use TypeScript via ts-jest. Root directory is project root; testRegex matches
 *          spec files (e.g. *.spec.ts).
 * @author Victor Yeh
 * @date 2026-02-20
 * @copyright MIT License
 */

import type { Config } from 'jest';

/**
 * @var config
 * @brief Jest configuration object.
 * @type Config
 * @details moduleFileExtensions and transform ensure .ts files are transpiled; testRegex
 *          limits tests to spec files; collectCoverageFrom excludes node_modules and specs.
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
