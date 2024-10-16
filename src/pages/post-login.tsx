import { logger } from "@/init/logger";
import { RequireUser } from "@/pages/util";
import { UserService } from "@/server/services/user/service";
import { Routes } from "@/utils/router/routes";

export default function PostLogin() {
  return <></>;
}

export const getServerSideProps = RequireUser(async ({ user, authContext }) => {
  const companies = await UserService.withContext(authContext).getCompanies({
    userId: user.id,
  });

  const [company] = companies;
  if (company) {
    return {
      redirect: {
        destination: Routes.company.dashboard({ orgSlug: company.slug }),
        permanent: false,
      },
    };
  }

  logger.error(`No companies found for user`, { userId: user.id });
  // If no companies found, return a 500 error
  return {
    props: {},
    notFound: true,
  };
});
