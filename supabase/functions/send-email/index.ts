import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { to, subject, text } = await req.json();

  if (!to) {
    return new Response("Missing email recipient", { status: 400 });
  }

  const emailRes = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: "no-reply@onewayticket.com",
        name: "ONEWAYTICKET",
      },
      subject,
      content: [
        {
          type: "text/plain",
          value: text,
        },
      ],
    }),
  });

  if (!emailRes.ok) {
    return new Response("Email sending failed", { status: 500 });
  }

  return new Response("Email sent", { status: 200 });
});