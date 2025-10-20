"use client";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const tickerData: TickerItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: "$110,690.50", change: "+2.45%", isPositive: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,974.85", change: "+1.23%", isPositive: true },
  { symbol: "SOL", name: "Solana", price: "$188.16", change: "-0.87%", isPositive: false },
  { symbol: "BNB", name: "BNB", price: "$1,096.45", change: "+0.56%", isPositive: true },
  { symbol: "DOGE", name: "Dogecoin", price: "$0.1982", change: "+3.21%", isPositive: true },
  { symbol: "XRP", name: "XRP", price: "$2.48", change: "-1.05%", isPositive: false },
];

export function Ticker() {
  return (
    <div className="border-b-2 border-border bg-background overflow-hidden">
      <div className="flex items-center gap-8 px-6 py-2">
        {tickerData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="text-foreground font-bold">{item.symbol}</span>
            <span className="text-muted-foreground">{item.price}</span>
            <span className={item.isPositive ? "text-accent-foreground" : "text-destructive"}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
