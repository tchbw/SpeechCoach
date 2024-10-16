import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Alert } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { env } from "@/env";
import { logger } from "@/init/logger";
import { RequireUnauthenticated } from "@/pages/util";
import { api } from "@/utils/api";
import { Routes } from "@/utils/router/routes";

type LoginPageProps = {
  redirectUrl?: string;
  initialEmail?: string;
  initialErrorMsg?: string;
};

const LoginPage: NextPage<LoginPageProps> = ({
  redirectUrl,
  initialEmail,
  initialErrorMsg,
}) => {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail ?? ``);
  const [password, setPassword] = useState(``);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(initialErrorMsg);
  const loginWithPasswordMutation =
    api.authentication.loginWithPassword.useMutation();

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordIsValid = password.trim().length > 0;

  useEffect(() => {
    if (loggedIn) {
      // Wait 3 seconds before redirecting
      const timer = setTimeout(() => {
        void router.push(redirectUrl ?? Routes.postLogin()); // Redirect to the desired page
      }, 2000);

      // Cleanup timeout on component unmount
      return () => clearTimeout(timer);
    }
  }, [loggedIn, redirectUrl, router]);

  return (
    <>
      <Head>
        <title>Login | {env.NEXT_PUBLIC_APP_NAME}</title>
        {/*<meta*/}
        {/*  name="description"*/}
        {/*  content="The AI-First Banking Solution For Founders"*/}
        {/*/>*/}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-center  px-8 py-16 lg:py-28">
        <Card className="w-full max-w-sm">
          <CardHeader className="lg:pb-4">
            <CardTitle>Login to {env.NEXT_PUBLIC_APP_NAME}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 lg:pt-0">
            {loggedIn ? (
              <div className="mt-4 text-center">
                Login to {env.NEXT_PUBLIC_APP_NAME} successful. Redirecting...
              </div>
            ) : (
              <div className="mx-auto mt-5 w-full space-y-4">
                {errorMsg && <Alert>{errorMsg}</Alert>}

                <div className="mt-5">
                  <Label htmlFor="email">Email address</Label>
                  <input
                    key="email"
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loginWithPasswordMutation.status === `pending`}
                    value={email}
                    className="rounded-xs mt-1.5 flex h-10 w-full border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-slate-500 focus-visible:ring-0 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(ev) => {
                      setEmail(ev.target.value);
                    }}
                  />
                  <input
                    key="password"
                    placeholder="Password"
                    type="password"
                    required
                    disabled={loginWithPasswordMutation.status === `pending`}
                    value={password}
                    className="rounded-xs mt-1.5 flex h-10 w-full border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-slate-500 focus-visible:ring-0 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(ev) => {
                      setPassword(ev.target.value);
                    }}
                  />

                  <Button
                    className="mt-3 w-full"
                    type="submit"
                    disabled={
                      !emailIsValid ||
                      !passwordIsValid ||
                      loginWithPasswordMutation.status === `pending`
                    }
                    onClick={async () => {
                      try {
                        const { valid, error } =
                          await loginWithPasswordMutation.mutateAsync({
                            email,
                            password,
                          });
                        if (!valid) {
                          setErrorMsg(error);
                          return;
                        }
                        logger.info({ valid, error }, `logged in`);
                        setLoggedIn(true);
                      } catch (err) {
                        setErrorMsg((err as Error).message);
                      }
                    }}
                  >
                    Log in
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;

export const getServerSideProps = RequireUnauthenticated(({ ctx }) => {
  // const { redirectUrl, email, error } = schema.parse(ctx.query);
  const { redirectUrl, email, error } = Routes.login.parseSearch(ctx.query);

  return {
    props: {
      redirectUrl,
      initialEmail: email,
      initialErrorMsg: error,
    },
  };
});

// This is the login with magic link code which we will probably bring back in some form later:
// import { type NextPage } from "next";
// import Head from "next/head";
// import { useState } from "react";

// import { Alert } from "@/client/components/ui/alert";
// import { Button } from "@/client/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/client/components/ui/card";
// import { Label } from "@/client/components/ui/label";
// import { env } from "@/env";
// import { RequireUnauthenticated } from "@/pages/util";
// import { api } from "@/utils/api";
// import { Routes } from "@/utils/router/routes";

// type LoginPageProps = {
//   redirectUrl?: string;
//   initialEmail?: string;
//   initialErrorMsg?: string;
// };

// const LoginPage: NextPage<LoginPageProps> = ({
//   redirectUrl,
//   initialEmail,
//   initialErrorMsg,
// }) => {
//   const [email, setEmail] = useState(initialEmail ?? ``);
//   const [emailSent, setEmailSent] = useState(false);
//   const [errorMsg, setErrorMsg] = useState(initialErrorMsg);
//   const emailLoginCodeMutation =
//     api.authentication.emailLoginCode.useMutation();

//   const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   return (
//     <>
//       <Head>
//         <title>Login | {env.NEXT_PUBLIC_APP_NAME}</title>
//         {/*<meta*/}
//         {/*  name="description"*/}
//         {/*  content="The AI-First Banking Solution For Founders"*/}
//         {/*/>*/}
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <div className="flex justify-center  px-8 py-16 lg:py-28">
//         <Card className="w-full max-w-sm">
//           <CardHeader className="lg:pb-4">
//             <CardTitle>Login to {env.NEXT_PUBLIC_APP_NAME}</CardTitle>
//           </CardHeader>
//           <CardContent className="pt-0 lg:pt-0">
//             {emailSent ? (
//               <div className="mt-4 text-center">
//                 An email was sent to {email} with login link if it is associated
//                 to a {env.NEXT_PUBLIC_APP_NAME} account.
//               </div>
//             ) : (
//               <div className="mx-auto mt-5 w-full space-y-4">
//                 {errorMsg && <Alert>{errorMsg}</Alert>}

//                 <div className="mt-5">
//                   <Label htmlFor="email">Email address</Label>
//                   <input
//                     key="email"
//                     placeholder="Email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     disabled={emailLoginCodeMutation.status === `pending`}
//                     value={email}
//                     className="rounded-xs mt-1.5 flex h-10 w-full border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-slate-500 focus-visible:ring-0 focus-visible:ring-transparent disabled:cursor-not-allowed disabled:opacity-50"
//                     onChange={(ev) => {
//                       setEmail(ev.target.value);
//                     }}
//                   />

//                   <Button
//                     className="mt-3 w-full"
//                     type="submit"
//                     disabled={
//                       !emailIsValid ||
//                       emailLoginCodeMutation.status === `pending`
//                     }
//                     onClick={async () => {
//                       try {
//                         await emailLoginCodeMutation.mutateAsync({
//                           email,
//                           redirectUrl,
//                         });
//                         setEmailSent(true);
//                       } catch (err) {
//                         setErrorMsg((err as Error).message);
//                       }
//                     }}
//                   >
//                     Log in
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default LoginPage;

// export const getServerSideProps = RequireUnauthenticated(({ ctx }) => {
//   // const { redirectUrl, email, error } = schema.parse(ctx.query);
//   const { redirectUrl, email, error } = Routes.login.parse(ctx.query);

//   return {
//     props: {
//       redirectUrl,
//       initialEmail: email,
//       initialErrorMsg: error,
//     },
//   };
// });
