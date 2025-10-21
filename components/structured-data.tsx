export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Beta Arena",
    "description": "AI Trading Competition on Solana - 7 AI models compete in real-time trading",
    "url": "https://betaarena.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://betaarena.vercel.app/models/{slug}",
      "query-input": "required name=slug"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
