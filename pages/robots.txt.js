export default function Robots() {}

Robots.getInitialProps = async ({ res }) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /profile/

Sitemap: https://onemessage.io/sitemap.xml`;

  res.setHeader("Content-Type", "text/plain");
  res.write(robots);
  res.end();
};
