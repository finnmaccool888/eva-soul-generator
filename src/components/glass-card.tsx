export default function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white/10 p-4 sm:p-6 md:p-8 rounded-[16px] border border-white/10 backdrop-blur-xs">
      {children}
    </div>
  );
}
