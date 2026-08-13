const nextJest = require('next/jest');

// Le indicamos a Jest dónde está la raíz de Next.js para que cargue .env y el compilador
const createJestConfig = nextJest({
  dir: './',
});

// Configuración personalizada de Jest
const customJestConfig = {
  testEnvironment: 'jest-environment-node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
};

module.exports = createJestConfig(customJestConfig);