import nodemailer from "nodemailer";

const emailSender = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

export async function sendPasswordResetEmail(email: string, token: string) {
    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailSender,
                pass: emailPassword,
            },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `Service de sécurité <${emailSender}>`,
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #a67bc3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Réinitialiser mon mot de passe
                </a>
            </div>
            <p>Si vous n'avez pas demandé la réinitialisation de votre mot de passe, veuillez ignorer cet email.</p>
            <p>Ce lien expirera dans 1 heure.</p>
            </div>
        `,
        };

        await transport.sendMail(mailOptions);

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
