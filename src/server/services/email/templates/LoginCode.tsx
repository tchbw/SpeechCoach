import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

import { env } from "@/env";

type LoginCodeProps = {
  inviteLink?: string;
};

export const LoginCode = ({ inviteLink }: LoginCodeProps) => {
  const previewText = `Login to ${env.NEXT_PUBLIC_APP_NAME}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${env.NEXT_PUBLIC_APP_URL}/static/logo.png`}
                width="40"
                height="37"
                alt="Vercel"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Login to <strong>{env.NEXT_PUBLIC_APP_NAME}</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              Please click this below to login to{` `}
              <strong>{env.NEXT_PUBLIC_APP_NAME}</strong>.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink}
              >
                Login
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{` `}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            {/*<Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />*/}
            {/*<Text className="text-[12px] leading-[24px] text-[#666666]">*/}
            {/*  This invitation was intended for{" "}*/}
            {/*  <span className="text-black">{username}</span>. This invite was*/}
            {/*  sent from <span className="text-black">{inviteFromIp}</span>{" "}*/}
            {/*  located in{" "}*/}
            {/*  <span className="text-black">{inviteFromLocation}</span>. If you*/}
            {/*  were not expecting this invitation, you can ignore this email. If*/}
            {/*  you are concerned about your account's safety, please reply to*/}
            {/*  this email to get in touch with us.*/}
            {/*</Text>*/}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default LoginCode;
