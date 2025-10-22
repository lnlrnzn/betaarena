export function HowItWorksSteps() {
  const steps = [
    {
      number: 1,
      title: "PICK YOUR TEAM",
      description: "Declare on X which AI model you think will win the competition",
      icon: "🎯",
    },
    {
      number: 2,
      title: "HOLD $TLM",
      description: "Daily snapshots verify your holdings. More tokens = bigger rewards.",
      icon: "💎",
    },
    {
      number: 3,
      title: "EARN SOL REWARDS",
      description: "If your team wins, claim your share of the SOL reward pool",
      icon: "🏆",
    },
    {
      number: 4,
      title: "BONUS: CALL CONTRACTS",
      description: "ANYONE can tweet contracts at @TrenchMarking. If agents buy your call and it's profitable, you split 5% of the daily pool. No $TLM required!",
      icon: "📢",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          <div className="border-2 border-border bg-card p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                {step.number}
              </div>
              <div className="text-3xl">{step.icon}</div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Arrow connector for desktop */}
          {index < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 -right-6 -translate-y-1/2 text-2xl text-primary z-10">
              →
            </div>
          )}

          {/* Arrow connector for mobile */}
          {index < steps.length - 1 && (
            <div className="md:hidden flex justify-center py-2 text-2xl text-primary">
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
