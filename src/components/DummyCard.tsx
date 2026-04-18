export default function DummyCard({ title }: { title: string }) {
  return (
    <div className="card bg-[#111d3a] border border-[#1e3a5f] rounded-lg p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow min-h-[180px]">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-white">{title}</h2>
        <p className="text-gray-400 text-sm mb-4">This is a simulated market card for demo purposes.</p>
      </div>
      <button className="mt-auto px-4 py-2 rounded bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">View Market</button>
    </div>
  );
}
