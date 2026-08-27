import BiologyCard from '../components/ui/BiologyCard';
import biologyData from '../data/biology.json';

export default function BiologyKit() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12" id="biology-kit">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-bold text-zinc-50">Class 12 Biology</h2>
        <p className="text-zinc-400 mt-2">The Complete 25 Blue-Chip Survival Kit</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {biologyData.map((concept) => (
          <BiologyCard key={concept.id} {...concept} />
        ))}
      </div>
    </div>
  );
}