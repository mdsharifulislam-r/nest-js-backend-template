import { ICreateAccount, IResetPassword } from "../types/emailTemplate";

const PRIMARY = "#009A54";
const LOGO =
  "https://res.cloudinary.com/dkbcx9amc/image/upload/q_auto/f_auto/v1775448661/Layer_1_vggb5q.png";

const baseTemplate = (content: string) => `
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f8;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" border="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:30px 20px;border-bottom:1px solid #eee;">
              <img src="${LOGO}" alt="LinkFast eSIM" style="height:40px;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px 25px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:20px;color:#999;font-size:12px;border-top:1px solid #eee;">
              © ${new Date().getFullYear()} LinkFast eSIM. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
`;

const otpBox = (otp: string) => `
<div style="
  background:${PRIMARY};
  color:#fff;
  font-size:28px;
  letter-spacing:4px;
  padding:14px 24px;
  border-radius:8px;
  display:inline-block;
  margin:20px 0;
  font-weight:bold;
">
${otp}
</div>
`;

const createAccount = (values: ICreateAccount) => {
  const content = `
    <h2 style="margin:0 0 10px;color:#111;">
      Verify your LinkFast eSIM account
    </h2>

    <p style="color:#555;font-size:15px;line-height:1.6;">
      Hi ${values.name},
      <br/><br/>
      Welcome to <b>LinkFast eSIM</b>. Use the verification code below to activate your account.
    </p>

    <div style="text-align:center;">
      ${otpBox(String(values.otp))}
    </div>

    <p style="color:#666;font-size:14px;">
      This code is valid for <b>3 minutes</b>.
    </p>

    <p style="color:#999;font-size:13px;margin-top:20px;">
      If you didn’t request this email, you can safely ignore it.
    </p>
  `;

  return {
    to: values.email,
    subject: "Verify your LinkFast eSIM account",
    html: baseTemplate(content),
  };
};

const resetPassword = (values: IResetPassword) => {
  const content = `
    <h2 style="margin:0 0 10px;color:#111;">
      Reset your password
    </h2>

    <p style="color:#555;font-size:15px;line-height:1.6;">
      We received a request to reset your LinkFast eSIM password.
      Use the code below to continue.
    </p>

    <div style="text-align:center;">
      ${otpBox(String(values.otp))}
    </div>

    <p style="color:#666;font-size:14px;">
      This code is valid for <b>3 minutes</b>.
    </p>

    <p style="color:#999;font-size:13px;margin-top:20px;">
      If you didn't request this password reset, you can safely ignore this email.
      Someone else may have entered your email address by mistake.
    </p>
  `;

  return {
    to: values.email,
    subject: "Reset your LinkFast eSIM password",
    html: baseTemplate(content),
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};