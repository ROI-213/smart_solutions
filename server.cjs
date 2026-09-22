// Hostinger hPanel Node.js entry point wrapper
// Hostinger sets process.env.PORT automatically
const port = process.env.PORT || process.env.NITRO_PORT || 3000;
process.env.PORT = String(port);
process.env.NITRO_PORT = String(port);

import("./.output/server/index.mjs")
  .then(() => {
    console.log(`[Smart Solutions] Server running on port ${port}`);
  })
  .catch((err) => {
    console.error("[Smart Solutions] Fatal startup error:", err);
    process.exit(1);
  });
