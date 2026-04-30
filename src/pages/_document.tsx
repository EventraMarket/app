import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <title>eventramarket</title>
        <meta name="description" content="" />
        <meta property="og:url" content="https://eventramarket.xyz/markets" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="eventramarket" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="https://eventramarket.xyz/eventra.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="eventramarket.xyz" />
        <meta property="twitter:url" content="https://eventramarket.xyz/markets" />
        <meta name="twitter:title" content="eventramarket" />
        <meta name="twitter:description" content="" />
        <meta name="twitter:image" content="https://eventramarket.xyz/eventra.jpg" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
