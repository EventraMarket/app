export default function DummyCard({ title }: { title: string }) {
  return (
    <div className="card bg-[var(--color-card)] border border-[var(--color-accent2)] rounded-[var(--radius-lg)] p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow min-h-[180px] aspect-[16/7] relative mic-effect">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-white">{title}</h2>
        <p className="text-gray-400 text-sm mb-4">This is a simulated market card for demo purposes.</p>
      </div>
      <button className="mt-auto px-4 py-2 rounded bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] text-black font-medium hover:from-[var(--color-accent2)] hover:to-[var(--color-accent)] transition-colors">View Market</button>
    </div>
  );
}
