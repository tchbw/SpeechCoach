// This is useful for running scripts that need access to environment variables (outside of NextJS which has its own way of doing this)
// example usage: NODE_ENV=development npx tsx -r ./setup-env.cjs src/scripts/slack-socket.ts

/* eslint-disable @typescript-eslint/no-var-requires */
const dotenvFlow = require(`dotenv-flow`);

// load .env files
dotenvFlow.config({
  path: process.env.DOTENV_FLOW_PATH || `./`,
});
