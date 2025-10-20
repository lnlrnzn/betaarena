"use client";

import { Badge } from "@/components/ui/badge";

interface Trade {
  id: string;
  agent: string;
  agentColor: string;
  action: "long" | "short";
  token: string;
  price: string;
  quantity: string;
  notional: string;
  holdingTime: string;
  pnl: string;
  isPnlPositive: boolean;
  timestamp: string;
}

const mockTrades: Trade[] = [
  {
    id: "1",
    agent: "Gemini 2.5 Pro",
    agentColor: "#2196F3",
    action: "long",
    token: "$BNB",
    price: "$1,094.1 → $1,093.4",
    quantity: "$1.36",
    notional: "$34,311 → $34,289",
    holdingTime: "32M",
    pnl: "-$45.66",
    isPnlPositive: false,
    timestamp: "10/20, 8:28 PM",
  },
  {
    id: "2",
    agent: "Gemini 2.5 Pro",
    agentColor: "#2196F3",
    action: "short",
    token: "$BNB",
    price: "$1,111.3 → $1,094.7",
    quantity: "-4.65",
    notional: "$5,866 → $4,901",
    holdingTime: "5H 44M",
    pnl: "$74.10",
    isPnlPositive: true,
    timestamp: "10/20, 7:52 PM",
  },
  {
    id: "3",
    agent: "Qwen3 Max",
    agentColor: "#F44336",
    action: "long",
    token: "$ETH",
    price: "$3,964.9 → $3,930",
    quantity: "12.66",
    notional: "$50,196 → $49,754",
    holdingTime: "41M",
    pnl: "-$470.87",
    isPnlPositive: false,
    timestamp: "10/20, 6:46 PM",
  },
  {
    id: "4",
    agent: "Qwen3 Max",
    agentColor: "#F44336",
    action: "long",
    token: "$ETH",
    price: "$3,964.9 → $3,930",
    quantity: "0.93",
    notional: "$3,669 → $3,636",
    holdingTime: "40M",
    pnl: "-$34.42",
    isPnlPositive: false,
    timestamp: "10/20, 6:45 PM",
  },
  {
    id: "5",
    agent: "GPT 5",
    agentColor: "#4CAF50",
    action: "long",
    token: "$SOL",
    price: "$193.79 → $187.91",
    quantity: "20.69",
    notional: "$4,010 → $3,888",
    holdingTime: "9H 47M",
    pnl: "-$124.04",
    isPnlPositive: false,
    timestamp: "10/20, 6:32 PM",
  },
];

export function LiveTrades() {
  return (
    <div className="h-full border-l-2 border-border bg-background overflow-y-auto">
      <div className="sticky top-0 bg-background border-b-2 border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">COMPLETED TRADES</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground border-2 border-border">
              ALL
            </button>
            <button className="px-3 py-1 text-xs bg-background text-foreground border-2 border-border hover:bg-muted">
              72H
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">FILTER:</span>
          <select className="text-xs bg-background text-foreground border-2 border-border px-2 py-1">
            <option>ALL MODELS ▼</option>
          </select>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">Showing Last 90 Trades</p>
        {mockTrades.map((trade) => (
          <div
            key={trade.id}
            className="border-2 border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-2">
              <div
                className="w-1 h-full border-2 border-border mt-1"
                style={{ backgroundColor: trade.agentColor }}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {trade.agent}
                  </span>
                  <span className="text-xs text-muted-foreground">completed a</span>
                  <Badge
                    variant={trade.action === "long" ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {trade.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">trade on</span>
                  <span className="text-xs font-bold text-foreground">
                    {trade.token}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="text-foreground">{trade.price}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity: </span>
                    <span className="text-foreground">{trade.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Notional: </span>
                    <span className="text-foreground">{trade.notional}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Holding time: </span>
                    <span className="text-foreground">{trade.holdingTime}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">NET P&L: </span>
                  <span
                    className={`font-bold ${
                      trade.isPnlPositive ? "text-accent-foreground" : "text-destructive"
                    }`}
                  >
                    {trade.pnl}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {trade.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
