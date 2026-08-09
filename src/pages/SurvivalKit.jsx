import SnapCard from '../components/ui/SnapCard';

export default function SurvivalKit() {
  const concepts = [
    { id: 1, title: "Lens Maker's Formula", category: "Ray Optics", rank: 1, triggers: ["Derive Lens Maker's formula", "Two spherical surfaces"], bypass: "Draw biconvex lens. Write Eq 1 & Eq 2. Skip addition, write final boxed formula 1/f = (n21 - 1)[1/R1 - 1/R2]." },
    { id: 2, title: "Full Wave Rectifier", category: "Semiconductor", rank: 2, triggers: ["Full wave rectifier", "Input and output waveforms"], bypass: "Draw circuit & waveforms. Write: D1 conducts in +ve cycle, D2 in -ve cycle. Output is unidirectional." },
    { id: 3, title: "LCR Series Impedance", category: "Alternating Current", rank: 3, triggers: ["Series LCR circuit", "Impedance Z", "Phasor diagram"], bypass: "Draw right-angle triangle. Base=R, Height=(XL-XC), Hyp=Z. Write Pythagoras: Z = sqrt[R^2 + (XL-XC)^2]." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-bold text-zinc-50">Class 12 Physics</h2>
        <p className="text-zinc-400 mt-2">The Top 25 Blue-Chip Survival Kit</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <SnapCard key={concept.id} {...concept} />
        ))}
      </div>
    </div>
  );
}