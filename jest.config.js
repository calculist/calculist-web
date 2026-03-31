module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/spec/javascripts/**/*.test.{js,ts}'],
  transform: {
    '^.+\\.[jt]sx?$': 'esbuild-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // NPM package mocks
    '^jquery$': '<rootDir>/spec/javascripts/__mocks__/jquery',
    '^backbone$': '<rootDir>/spec/javascripts/__mocks__/backbone',
    '^katex$': '<rootDir>/spec/javascripts/__mocks__/katex',
    '^d3$': '<rootDir>/spec/javascripts/__mocks__/d3',
    '^clipboard$': '<rootDir>/spec/javascripts/__mocks__/clipboard',
    '^mark\\.js$': '<rootDir>/spec/javascripts/__mocks__/markjs',
    '^jsondiffpatch$': '<rootDir>/spec/javascripts/__mocks__/jsondiffpatch',
    '^papaparse$': '<rootDir>/spec/javascripts/__mocks__/papaparse',
    // Specific client service mocks
    '(.*)/client/services/eventHub$': '<rootDir>/spec/javascripts/__mocks__/clientServices/eventHub',
    '(.*)/client/services/transaction$': '<rootDir>/spec/javascripts/__mocks__/clientServices/transaction',
    '(.*)/client/services/urlFinder$': '<rootDir>/spec/javascripts/__mocks__/clientServices/urlFinder',
    // Catch-all client service mocks
    '(.*)/client/services/[^/]+$': '<rootDir>/spec/javascripts/__mocks__/genericMock',
    // Specific client UI mocks
    '(.*)/client/ui/zoomPage$': '<rootDir>/spec/javascripts/__mocks__/clientUi/zoomPage',
    // Catch-all client UI mocks
    '(.*)/client/ui/[^/]+$': '<rootDir>/spec/javascripts/__mocks__/genericMock',
    // Other client modules
    '(.*)/client/init$': '<rootDir>/spec/javascripts/__mocks__/genericMock',
    '(.*)/client/http$': '<rootDir>/spec/javascripts/__mocks__/genericMock',
  },
};
