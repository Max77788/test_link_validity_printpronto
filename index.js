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

  // 2.5s timeoutt
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1000);

  try {
    const resp = await fetch(link, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    console.log("Link requested: " + link);

    const html = await resp.text();
      // console.log(html.slice(0, 100)); // raw HTML (can be large)
      
      console.log("\n\n\nFinal URL: " + resp.url)

      // const isOk = resp.status >= 200 && resp.status < 400 && html.length > 0;
      
      const isOk = resp.url.trim().endsWith(".html");

    console.log("Link is valid: " + isOk);
    
    const reply = isOk ? `${link} is valid!` : `${link} is NOT valid.`;
    
    console.log(reply);

    res.json({ reply });
  } catch (err) {
    res.json({ is_link_valid: false });
  } finally {
    clearTimeout(timer);
  }
});

app.post("/check_links", async (req, res) => {
  const links = req.body.links;

  if (!Array.isArray(links) || links.length === 0) {
    return res
      .status(400)
      .json({ error: "links array in request body is required" });
  }

  async function checkLink(link) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1000);

    try {
      const resp = await fetch(link, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });

      const html = await resp.text();
      const isOk = resp.url.trim().endsWith(".html");

      return { link, is_link_valid: isOk, final_url: resp.url };
    } catch (err) {
      return { link, is_link_valid: false, error: err.message };
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    const results = await Promise.all(links.map(checkLink));
    res.json({ results });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Unexpected server error", details: err.message });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});