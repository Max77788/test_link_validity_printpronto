// server.js
import express from "express";
import cors from "cors";

const app = express();

// CORS (loosen as needed)
app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.get("/check_link", async (req, res) => {
  const link = req.query.link;
  if (!link)
    return res
      .status(400)
      .json({ is_link_valid: false, error: "link query param required" });

  // 5s timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(link, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    const html = await resp.text();
      console.log(html.slice(0, 100)); // raw HTML (can be large)
      
      console.log("\n\n\n" + resp.url)

      // const isOk = resp.status >= 200 && resp.status < 400 && html.length > 0;
      
      const isOk = resp.url.includes("html");

    res.json({ is_link_valid: isOk });
  } catch (err) {
    res.json({ is_link_valid: false });
  } finally {
    clearTimeout(timer);
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});