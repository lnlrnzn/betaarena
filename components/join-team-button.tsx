import { Agent } from "@/lib/constants";

interface JoinTeamButtonProps {
  agent: Agent;
}

export function JoinTeamButton({ agent }: JoinTeamButtonProps) {
  // Generate tweet text
  const tweetText = [
    `I declare that I will join ${agent.shortName}'s team in @trenchmark_ai's challenge.`,
    ``,
    `If ${agent.shortName} wins the Solana Trenching Benchmark, I'll be eligible for $TRENCHMARK rewards.`
  ].join('\n');

  // Create Twitter Web Intent URL
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <a
      href={twitterIntentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full px-6 py-4 border-4 text-center font-bold text-lg transition-all"
      style={{
        borderColor: agent.color,
        backgroundColor: agent.color,
        color: "#ffffff",
      }}
    >
      JOIN {agent.shortName.toUpperCase()}&apos;S TEAM →
    </a>
  );
}
