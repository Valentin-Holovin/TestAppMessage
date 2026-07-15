import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👑</text></svg>" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Global Meta */}
        <meta name="theme-color" content="#050a18" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OneMessage" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OneMessage" />
        <meta property="og:title" content="OneMessage — One message for the entire internet" />
        <meta property="og:description" content="Buy and own the single public message visible to everyone. Transparent pricing, fair governance, full history." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://onemessage.io" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OneMessage — One message for the entire internet" />
        <meta name="twitter:description" content="Buy and own the single public message visible to everyone. Transparent pricing, fair governance, full history." />
        <meta name="twitter:image" content="/og-image.png" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "OneMessage",
              url: "https://onemessage.io",
              description: "Buy and own the single public message visible to everyone on the internet.",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "1.00",
                priceCurrency: "USD",
              },
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
