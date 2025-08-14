import { SoulSeed } from "@/lib/mirror/types";

export default function SoulSeedCard({ seed }: { seed: SoulSeed }) {
  const top = Object.entries(seed.traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm opacity-70">Soul Seed</div>
      <div className="text-xl font-semibold">{seed.alias}</div>
      <div className="text-sm">Vibe: {seed.vibe}</div>
      <div className="mt-2 flex gap-4 text-sm">
        <span>Level {seed.level}</span>
        <span>Streak {seed.streakCount}d</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {top.map(([k, v]) => (
          <div key={k} className="rounded border p-2 text-center">
            <div>{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 