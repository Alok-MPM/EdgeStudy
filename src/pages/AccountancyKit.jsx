import AccountancyCard from '../components/ui/AccountancyCard';
import accountancyData from '../data/accountancy.json';

export default function AccountancyKit() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12" id="accountancy-kit">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-bold text-zinc-50">Class 12 Accountancy</h2>
        <p className="text-zinc-400 mt-2">The Complete 25 Blue-Chip Survival Kit</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountancyData.map((concept) => (
          <AccountancyCard key={concept.id} {...concept} />
        ))}
      </div>
    </div>
  );
}