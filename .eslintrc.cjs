// eslint-disable-next-line @typescript-eslint/no-var-requires
const { builtinModules } = require(`module`);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rulesDirPlugin = require(`eslint-plugin-rulesdir`);
rulesDirPlugin.RULES_DIR = `./eslint-rules`;

const TEMPORAL_ALLOWED_NODE_BUILTINS = new Set([`assert`]);

// The goal is to set up conditional import restrictions based on the directory a file is in.
// This allows us to prevent importing models outside of services, for example.
// See https://stackoverflow.com/a/64554631

const restrictOtherDateLibraries = [
  {
    group: [`date-fns`],
    message: `Use dayjs from "@/init/dayjs" instead of date-fns`,
  },
  {
    group: [`moment`],
    message: `Use dayjs from "@/init/dayjs" instead of moment`,
  },
  {
    group: [`dayjs`, `!@/init/dayjs`],
    message: `Use dayjs from "@/init/dayjs" instead`,
    allowTypeImports: true,
  },
  {
    group: [`dayjs/plugin/*`],
    message: `All dayjs plugins should be defined in "@/init/dayjs"`,
  },
];

/** We should use our utility functions instead so we can easily swap out providers */
const restrictPrismaRules = [
  {
    group: [`@prisma/client`],
    importNames: [`PrismaClient`],
    message: `Please use PrismaClient from /server/init/db instead.`,
  },
];

const restrictSuperjson = [
  {
    group: [`superjson`, `!**/*/superjson`],
    message: `Use the superjson init file instead of importing directly from superjson.`,
    allowTypeImports: true,
  },
];

/** @type {Array<{group?: string[], name?: string | string[], message: string, allowTypeImports?: boolean, importNames?: string[]}>} */
const restrictedEverywhere = [
  ...restrictOtherDateLibraries,
  ...restrictPrismaRules,
  ...restrictSuperjson,
];

// Overrides here
// const serviceRestrictionOverrides = [...restrictedEverywhere];
// const modelRestrictionOverrides = [...restrictedEverywhere];

// applies to all files not explicitly overridden
const baseRestrictions = [...restrictedEverywhere];

/** @type {import("eslint").Linter.Config} */
const config = {
  plugins: [
    `@typescript-eslint`,
    `simple-import-sort`,
    `no-only-tests`,
    `rulesdir`,
    `promise`,
  ],
  extends: [
    `next/core-web-vitals`,
    `plugin:@typescript-eslint/recommended`,
    `prettier`,
  ],
  parser: `@typescript-eslint/parser`,
  parserOptions: {
    project: `./tsconfig.json`,
  },
  ignorePatterns: [`node_modules/*`, `.history`, `*.svg`],

  overrides: [
    {
      files: [`*.ts`, `*.tsx`],
      extends: [
        `plugin:@typescript-eslint/recommended-requiring-type-checking`,
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          `error`,
          {
            argsIgnorePattern: `^_`,
            varsIgnorePattern: `^_`,
          },
        ],
        "@typescript-eslint/no-misused-promises": [
          `error`,
          {
            checksVoidReturn: {
              attributes: false,
            },
          },
        ],
      },
    },
    {
      files: [`./src/server/**/*.tsx`],
      rules: {
        "react/jsx-key": `off`,
      },
    },
    {
      files: [`*.d.ts`],
      rules: {
        quotes: `off`,
      },
    },
    {
      files: [`src/workflows.ts`, `src/workflows-*.ts`, `src/workflows/*.ts`],
      rules: {
        "no-restricted-imports": [
          `error`,
          ...builtinModules
            .filter((m) => !TEMPORAL_ALLOWED_NODE_BUILTINS.has(m))
            .flatMap((m) => [m, `node:${m}`]),
        ],
      },
    },
    {
      files: [`src/scripts/**/*.ts`, `src/scripts/**/*.js`],
      rules: {
        "no-console": `off`,
      },
    },
  ],
  rules: {
    "rulesdir/proper-api-route-handling": [
      `error`,
      { targetPath: `src/pages/api` },
    ],
    "rulesdir/proper-lodash-import": `error`,
    "@typescript-eslint/switch-exhaustiveness-check": `error`,
    "@typescript-eslint/consistent-type-imports": [
      `warn`,
      { prefer: `type-imports`, fixStyle: `separate-type-imports` },
    ],
    camelcase: [`error`, { properties: `never` }],
    "simple-import-sort/imports": `error`,
    "simple-import-sort/exports": `error`,
    "no-undef": `error`,
    "no-restricted-syntax": [
      `error`,
      {
        selector: `CallExpression[callee.name='assert'][arguments.length!=2]`,
        message: `assert must always include a message to help with debugging.`,
      },
    ],
    "no-only-tests/no-only-tests": `error`,
    "no-return-assign": `error`,
    "no-unused-expressions": [`error`, { allowTernary: true }],
    "no-useless-concat": `error`,
    "no-useless-return": `error`,
    "no-constant-condition": `warn`,
    "object-shorthand": `off`,
    "prefer-template": `warn`,
    quotes: [`error`, `backtick`],
    "no-warning-comments": [
      `error`,
      {
        terms: [`@nomerge`],
        location: `anywhere`,
      },
    ],
    "promise/prefer-await-to-then": `error`,
    "promise/prefer-await-to-callbacks": `error`,
    "no-restricted-imports": `off`,
    "@typescript-eslint/no-restricted-imports": [
      `error`,
      {
        patterns: [...baseRestrictions],
      },
    ],
    "@typescript-eslint/consistent-type-definitions": [`error`, `type`],
    "no-trailing-spaces": `error`,
    "eol-last": `error`,
    "no-console": `error`,
  },
};

module.exports = config;
