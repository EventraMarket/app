import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        {/* HTML Meta Tags */}
        <title>eventramarket</title>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="description" content="" />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://eventramarket.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="eventramarket" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="https://eventramarket.xyz/eventra.jpg" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="eventramarket.xyz" />
        <meta property="twitter:url" content="https://eventramarket.xyz/" />
        <meta name="twitter:title" content="eventramarket" />
        <meta name="twitter:description" content="Eventra is the market for what happens next.Eventra lets you trade on the outcomes of real-world events: politics, crypto, sports, oil, precious metals, economics, technology, culture, business, science, weather, perpetuals..." />
        <meta name="twitter:image" content="https://eventramarket.xyz/eventra.jpg" />

        {/* Meta Tags Generated via https://www.opengraph.xyz */}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
