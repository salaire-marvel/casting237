import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  name: string
  email: string
  phone: string
  timeslot: string
  castingDate: string
  castingTitle: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, timeslot, castingDate, castingTitle }: EmailRequest = await req.json()

    // Envoi de l'email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Maison Marvelous Casting <onboarding@resend.dev>',
        to: [email],
        subject: `✅ Confirmation de réservation - ${castingTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .info-label { font-weight: bold; color: #667eea; }
                .footer { text-center; margin-top: 30px; color: #666; font-size: 14px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎬 Réservation Confirmée</h1>
                  <p>Maison Marvelous Casting</p>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${name}</strong>,</p>
                  
                  <p>Votre réservation pour l'audition de casting a bien été enregistrée ! 🎉</p>
                  
                  <div class="info-box">
                    <p><span class="info-label">📅 Date :</span> ${castingTitle}</p>
                    <p><span class="info-label">🕐 Créneau horaire :</span> ${timeslot}</p>
                    <p><span class="info-label">👤 Nom :</span> ${name}</p>
                    <p><span class="info-label">📧 Email :</span> ${email}</p>
                    <p><span class="info-label">📱 Téléphone :</span> ${phone}</p>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Important :</strong> Pour le respect de l'organisation et des autres candidats, merci de bien honorer ce créneau que vous avez réservé. En cas d'empêchement, veuillez nous prévenir au plus tôt.
                  </div>
                  
                  <p><strong>Conseils pour votre audition :</strong></p>
                  <ul>
                    <li>Arrivez 10 minutes en avance</li>
                    <li>Apportez une pièce d'identité</li>
                    <li>Préparez votre monologue/scène</li>
                    <li>Soyez vous-même et restez confiant(e) !</li>
                  </ul>
                  
                  <p>Nous avons hâte de vous rencontrer ! 🌟</p>
                  
                  <div class="footer">
                    <p>Maison Marvelous Casting</p>
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

