import { render } from "@react-email/render";
import type { JSXElementConstructor, ReactElement } from "react";

import { env } from "@/env";
import { postmark } from "@/server/init/postmark";

class EmailService {
  async sendTransactionalEmail(params: {
    from?: string;
    to: string;
    subject: string;
    body: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  }) {
    const emailHtml = render(params.body);

    await postmark.sendEmail({
      From: params.from ?? env.SMTP_FROM,
      To: params.to,
      Subject: params.subject,
      HtmlBody: emailHtml,
    });
  }
}

const emailService = new EmailService();
export default emailService;
