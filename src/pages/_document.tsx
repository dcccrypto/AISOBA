import { Html, Head, Main, NextScript } from 'next/document'
import { GA_TRACKING_ID } from '../lib/gtag'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href="https://sobaverse.art" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="SOBA Verse - AI-Generated SOBA Chimpanzee PFPs | Solana NFTs" />
        <meta name="description" content="Create unique AI-generated SOBA chimpanzee PFPs on Solana. Join the elite bastard community and mint your one-of-a-kind NFT with premium SOBA frames." />
        <meta name="keywords" content="SOBA, NFT, Solana, PFP, AI Generated, Chimpanzee, Digital Art, Crypto Art, Web3, SOBA Verse, Sol Bastard" />
        <meta name="author" content="SOBA Verse" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sobaverse.art/" />
        <meta property="og:title" content="SOBA Verse - AI-Generated SOBA Chimpanzee PFPs | Solana NFTs" />
        <meta property="og:description" content="Create unique AI-generated SOBA chimpanzee PFPs on Solana. Join the elite bastard community and mint your one-of-a-kind NFT with premium SOBA frames." />
        <meta property="og:image" content="https://sobaverse.art/og-image.jpg" />
        <meta property="og:site_name" content="SOBA Verse" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sobaverse.art/" />
        <meta property="twitter:title" content="SOBA Verse - AI-Generated SOBA Chimpanzee PFPs | Solana NFTs" />
        <meta property="twitter:description" content="Create unique AI-generated SOBA chimpanzee PFPs on Solana. Join the elite bastard community and mint your one-of-a-kind NFT with premium SOBA frames." />
        <meta property="twitter:image" content="https://sobaverse.art/og-image.jpg" />
        <meta name="twitter:creator" content="@SOBAVerse" />
        <meta name="twitter:site" content="@SOBAVerse" />

        {/* Additional SEO */}
        <meta name="application-name" content="SOBA Verse" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SOBA Verse" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />

        {/* Existing Google Analytics Script */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SOBA Verse",
              "description": "Create unique AI-generated SOBA chimpanzee PFPs on Solana blockchain",
              "url": "https://sobaverse.art",
              "applicationCategory": "NFT Generator",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SOBA"
              },
              "creator": {
                "@type": "Organization",
                "name": "SOBA Verse",
                "url": "https://sobaverse.art"
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 