import { RequireUser } from "@/pages/util";
import { clearSessionCookieNextJS } from "@/server/auth";
import { Routes } from "@/utils/router/routes";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default function empty() {}

export const getServerSideProps = RequireUser(
  async ({ ctx }) => {
    await clearSessionCookieNextJS(ctx.req, ctx.res);
    return {
      redirect: {
        permanent: false,
        destination: Routes.login(),
      },
    };
  },
  { isLogout: true }
);
