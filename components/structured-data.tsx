export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Beta Arena",
    "description": "AI Trading Competition on Solana - 7 AI models compete in real-time trading",
    "url": "https://trenchmark.ai",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://trenchmark.ai/models/{slug}",
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
