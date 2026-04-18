import { SpotsList } from "@/components/SpotsList";

export default function FreePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">🆓 Free Stuff</h1>
        <p className="text-gray-600 max-w-2xl">
          Free spots, resources, and things to do in Waterloo that won&apos;t cost you a penny.
        </p>
      </div>

      <div className="bg-green-50 rounded-xl p-6 border border-green-100 mb-6">
        <h3 className="font-semibold text-green-800 mb-3">💡 More Free Resources</h3>
        <ul className="text-sm text-green-700 space-y-2">
          <li>• <strong>UW Library Access:</strong> Free for students, extensive digital resources</li>
          <li>• <strong>Waterloo Park:</strong> Free trails, playground, and Victoria Park splash pad (summer)</li>
          <li>• <strong>PAC/CIF Gym:</strong> Included in student fees</li>
          <li>• <strong>Campus Events:</strong> Free talks, workshops, and socials</li>
          <li>• <strong>Free Software:</strong> GitHub Student Pack, JetBrains, Azure credits</li>
          <li>• <strong>Career Resources:</strong> CECA, resume reviews, mock interviews</li>
        </ul>
      </div>

      <SpotsList showFreeOnly />
    </div>
  );
}
