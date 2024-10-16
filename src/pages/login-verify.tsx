import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Alert } from "@/client/components/ui/alert";
import { Card, CardContent } from "@/client/components/ui/card";
import { env } from "@/env";
import { RequireUnauthenticated } from "@/pages/util";
import { api } from "@/utils/api";
import { Routes } from "@/utils/router/routes";

type LoginVerifyPageProps = {
  email: string;
  code: string;
  redirectUrl: string;
  initialErrorMsg?: string;
};

const LoginPage: NextPage<LoginVerifyPageProps> = ({
  email,
  code,
  redirectUrl,
  initialErrorMsg,
}) => {
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(initialErrorMsg);
  const verifyLoginCodeMutation =
    api.authentication.verifyLoginCode.useMutation();

  const router = useRouter();

  const verifyLoginCode = async () => {
    try {
      const { valid, error } = await verifyLoginCodeMutation.mutateAsync({
        email,
        code,
      });
      if (valid) {
        setRedirecting(true);
        await router.push(redirectUrl);
      } else {
        setErrorMsg(error);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  useEffect(() => {
    if (code) {
      void verifyLoginCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Logging in... | {env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-center  px-8 py-16 lg:py-28">
        <Card className="w-full max-w-sm">
          <CardContent className="flex h-full items-center justify-center pt-0 lg:pt-0">
            <div className="mt-7">
              {verifyLoginCodeMutation.status === `pending` ||
                (redirecting && (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <h1 className="text-3xl font-bold">Verifying...</h1>
                    <div className="h-[32px] w-[32px] animate-spin rounded-full border-b-2 border-t-2 border-foreground"></div>
                  </div>
                ))}
              {errorMsg && <Alert>{errorMsg}</Alert>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;

export const getServerSideProps = RequireUnauthenticated<LoginVerifyPageProps>(
  ({ ctx }) => {
    const schema = z.object({
      email: z.string(),
      code: z.string(),
      redirectUrl: z.string().optional(),
      error: z.string().optional(),
    });

    const parsed = schema.parse(ctx.query);
    const { email, code, error } = parsed;
    let { redirectUrl } = parsed;

    if (redirectUrl) {
      // turn the redirect url into a relative
      // path if it's an absolute url to our app
      redirectUrl = redirectUrl.replace(env.NEXT_PUBLIC_APP_URL, ``);
    } else {
      redirectUrl = Routes.appHome();
    }

    return {
      props: {
        email,
        code,
        redirectUrl,
        initialErrorMsg: error,
      },
    };
  }
);
