/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import(`./src/env.js`);

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  pageExtensions: [`tsx`, `page.ts`],
  experimental: {
    swcPlugins: [[`next-superjson-plugin`, {}]],
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: [`en`],
    defaultLocale: `en`,
  },
  transpilePackages: [`geist`],
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default config;
