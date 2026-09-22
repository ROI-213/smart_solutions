import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function smtpApiPlugin(): Plugin {
  return {
    name: "smtp-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://localhost").pathname : "";
        if (url === "/api/send-email-otp" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const { sendOtpEmail, otpStore } = await import("./src/lib/smtp-service.ts");
              const data = JSON.parse(body || "{}");
              const email = String(data.email || "").trim().toLowerCase();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Enter a valid email address." }));
                return;
              }
              const code = String(Math.floor(100000 + Math.random() * 900000));
              otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
              console.log(`[SMTP-API] Sending OTP email to ${email}...`);
              await sendOtpEmail(email, code);
              console.log(`[SMTP-API] OTP email sent successfully to ${email}`);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, code, message: "OTP sent successfully" }));
            } catch (err: any) {
              console.error("[SMTP-API] Error sending email:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: err?.message || "Failed to send email" }));
            }
          });
          return;
        }

        if (url === "/api/verify-email-otp" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const { otpStore } = await import("./src/lib/smtp-service.ts");
              const data = JSON.parse(body || "{}");
              const email = String(data.email || "").trim().toLowerCase();
              const code = String(data.code || "").trim();
              const record = otpStore.get(email);
              if (!record) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "No OTP requested for this email. Please request a new code." }));
                return;
              }
              if (Date.now() > record.expiresAt) {
                otpStore.delete(email);
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "OTP expired. Please request a new one." }));
                return;
              }
              if (record.code !== code) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Incorrect OTP. Please try again." }));
                return;
              }
              otpStore.delete(email);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: err?.message || "Verification failed" }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [smtpApiPlugin()],
  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.VERCEL ? undefined : "node-server"),
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
