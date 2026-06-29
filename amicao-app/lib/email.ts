import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(destinatario: string, assunto: string, corpo: string) {
  return resend.emails.send({
    from: 'Amicão <onboarding@resend.dev>',
    to: destinatario,
    subject: assunto,
    html: corpo,
  })
}
