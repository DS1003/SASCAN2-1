import nodemailer from "nodemailer";


export const sendResetPasswordEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // Utilise SSL (true) pour le port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Orange Digital Center - Sonatel Academy" <${process.env.SMTP_USER}>`, // Alias avec email réel
    to: email,
    subject: "Votre code de réinitialisation de mot de passe",
    text: `Votre code de réinitialisation : ${token}`,
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
      <p><b>Code de réinitialisation :</b> <span style="font-size: 18px; color: blue;">${token}</span></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
      <p>Cordialement,<br><b>Orange Digital Center - Sonatel Academy</b></p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

