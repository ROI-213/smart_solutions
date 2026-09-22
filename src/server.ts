import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/send-email-otp" && request.method === "POST") {
        try {
          const { sendOtpEmail, otpStore } = await import("./lib/smtp-service");
          const body = (await request.json()) as { email?: string };
          const email = String(body?.email || "").trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return new Response(JSON.stringify({ ok: false, error: "Enter a valid email address." }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          const code = String(Math.floor(100000 + Math.random() * 900000));
          otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
          await sendOtpEmail(email, code);
          return new Response(JSON.stringify({ ok: true, code, message: "OTP sent successfully" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: err?.message || "Failed to send email" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      if (url.pathname === "/api/verify-email-otp" && request.method === "POST") {
        try {
          const { otpStore } = await import("./lib/smtp-service");
          const body = (await request.json()) as { email?: string; code?: string };
          const email = String(body?.email || "").trim().toLowerCase();
          const code = String(body?.code || "").trim();
          const record = otpStore.get(email);
          if (!record) {
            return new Response(JSON.stringify({ ok: false, error: "No OTP requested for this email. Please request a new code." }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return new Response(JSON.stringify({ ok: false, error: "OTP expired. Please request a new one." }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          if (record.code !== code) {
            return new Response(JSON.stringify({ ok: false, error: "Incorrect OTP. Please try again." }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
          otpStore.delete(email);
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ ok: false, error: err?.message || "Verification failed" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
