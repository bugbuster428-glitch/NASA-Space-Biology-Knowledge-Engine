import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/taskbook/highlights", async (req, res) => {
  try {
    const url = "https://taskbook.nasaprs.com/tbp/highlights.cfm";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let highlights = [];

    $("ul li").each((i, el) => {
      const linkEl = $(el).find("a");
      const title = linkEl.text().trim();
      const link = linkEl.attr("href");
      
      if (title && link) {
        const fullLink = link.startsWith("http") ? link : `https://taskbook.nasaprs.com/tbp/${link}`;
        const isPdf = link.toLowerCase().endsWith(".pdf");
        const year = title.match(/\((\w+\s+\d{4})\)/)?.[1] || title.match(/\d{4}/)?.[0] || "";
        
        highlights.push({
          title: title,
          summary: `NASA Space Biology and Physical Sciences research highlight ${year ? 'from ' + year : ''}. ${isPdf ? 'PDF document available for download.' : 'Click to view full details.'}`,
          link: fullLink,
          year: year,
          type: isPdf ? "PDF" : "Link"
        });
      }
    });

    console.log(`Scraped ${highlights.length} highlights from NASA`);
    res.json({ highlights });
  } catch (error) {
    console.error("Error fetching highlights:", error.message);
    res.status(500).json({ error: "Failed to fetch highlights from NASA" });
  }
});

app.get("/api/taskbook/research", async (req, res) => {
  try {
    const url = "https://taskbook.nasaprs.com/tbp/index.cfm?action=bib_search";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let results = [];

    $("table tbody tr").each((i, el) => {
      const title = $(el).find("td:nth-child(2)").text().trim();
      const author = $(el).find("td:nth-child(3)").text().trim();
      const year = $(el).find("td:nth-child(4)").text().trim();
      if (title) results.push({ title, author, year });
    });

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch research data" });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`✅ NASA TaskBook API running at http://localhost:${PORT}`));
