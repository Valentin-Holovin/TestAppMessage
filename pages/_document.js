import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23101110'/><path d='M20 20h60v45H50L35 80V65H20z' fill='%23c4f563'/></svg>" />

        {/* Global Meta */}
        <meta name="theme-color" content="#101110" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OneMessage" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OneMessage" />
        <meta property="og:title" content="OneMessage — A place for your words" />
        <meta property="og:description" content="A shared pixel board for your words. Explore temporary and permanent placements, publish a message, and share its link." />
        <meta property="og:url" content="https://onemessage.io" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="OneMessage — A place for your words" />
        <meta name="twitter:description" content="A shared pixel board for your words. Explore temporary and permanent placements, publish a message, and share its link." />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "OneMessage",
              url: "https://onemessage.io",
              description: "Publish a message on a shared pixel board and share its link.",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
