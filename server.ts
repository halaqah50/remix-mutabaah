import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Mutabaah Yaumiyah CM3105", timestamp: new Date().toISOString() });
  });

  // Google Sheet Proxy Endpoint
  app.post("/api/sheets/sync", async (req, res) => {
    try {
      const { config, entry } = req.body;
      
      if (!config || !config.webhookUrl) {
        // If no webhook URL is configured, return mock success so offline/local storage works seamlessly
        return res.json({
          status: "success",
          message: "Data disimpan di memori lokal. Hubungkan Webhook URL Google Sheet untuk sinkronisasi otomatis.",
          localOnly: true,
        });
      }

      // Forward payload to Google Apps Script Webhook
      const fetchResponse = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry }),
      });

      if (fetchResponse.ok) {
        const json = await fetchResponse.json().catch(() => ({ status: "success" }));
        return res.json({ status: "success", googleSheetResponse: json });
      } else {
        const textErr = await fetchResponse.text().catch(() => "Gagal menghubungi Google Apps Script Webhook");
        return res.status(400).json({ status: "error", message: textErr });
      }
    } catch (err: any) {
      console.error("Error in /api/sheets/sync:", err);
      return res.status(500).json({ status: "error", message: err.message || "Gagal sinkronisasi ke Google Sheet" });
    }
  });

  // Vite middleware for development or Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CM3105 App] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
