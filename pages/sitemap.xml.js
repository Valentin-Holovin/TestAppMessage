export default function Sitemap() {}

Sitemap.getInitialProps = async ({ res }) => {
  const baseUrl = "https://onemessage.io";

  const pages = [
    { url: baseUrl, changefreq: "daily", priority: "1.0" },
    { url: `${baseUrl}/leaderboard`, changefreq: "daily", priority: "0.8" },
    { url: `${baseUrl}/history`, changefreq: "daily", priority: "0.8" },
    { url: `${baseUrl}/about`, changefreq: "monthly", priority: "0.6" },
    { url: `${baseUrl}/terms`, changefreq: "monthly", priority: "0.4" },
    { url: `${baseUrl}/privacy`, changefreq: "monthly", priority: "0.4" },
    { url: `${baseUrl}/login`, changefreq: "monthly", priority: "0.5" },
    { url: `${baseUrl}/register`, changefreq: "monthly", priority: "0.5" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();
};
