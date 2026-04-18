export default function TransportPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          🚌 Getting Around
        </h1>
        <p className="text-gray-600 max-w-2xl">
          How to navigate Waterloo Region without breaking the bank.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GRT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚌</span>
            <div>
              <h2 className="font-semibold text-lg">GRT (Grand River Transit)</h2>
              <p className="text-sm text-gray-500">Local bus system</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>U-Pass:</strong> Included in UW fees (~$100/term)</li>
            <li>• <strong>Regular fare:</strong> $3.50/ride</li>
            <li>• <strong>Monthly pass:</strong> ~$90/month</li>
            <li>• Routes 7, 8, 9, 12, 13 serve UW campus</li>
          </ul>
        </div>

        {/* ION LRT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚈</span>
            <div>
              <h2 className="font-semibold text-lg">ION Light Rail</h2>
              <p className="text-sm text-gray-500">Modern LRT system</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Connects Waterloo to Kitchener to Cambridge</li>
            <li>• Same fare as GRT bus</li>
            <li>• <strong>University of Waterloo</strong> station at campus</li>
            <li>• Runs every 8-10 minutes during peak</li>
          </ul>
        </div>

        {/* GO Transit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚆</span>
            <div>
              <h2 className="font-semibold text-lg">GO Transit</h2>
              <p className="text-sm text-gray-500">Regional to Toronto</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Bus to Toronto:</strong> ~$15-20 one way</li>
            <li>• Leaves from Charles St Terminal</li>
            <li>• ~2 hours to Union Station</li>
            <li>• Presto card for discounts</li>
          </ul>
        </div>

        {/* Biking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚲</span>
            <div>
              <h2 className="font-semibold text-lg">Biking</h2>
              <p className="text-sm text-gray-500">Bike-friendly city</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Iron Horse Trail runs through city</li>
            <li>• Many bike lanes on major roads</li>
            <li>• Used bikes: ~$100-200 on Kijiji/FB</li>
            <li>• Campus has lots of bike parking</li>
          </ul>
        </div>

        {/* Rideshare */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚗</span>
            <div>
              <h2 className="font-semibold text-lg">Rideshare</h2>
              <p className="text-sm text-gray-500">Uber & carpooling</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Uber/Lyft:</strong> Available in the region</li>
            <li>• <strong>Poparide:</strong> Carpooling to Toronto ~$15</li>
            <li>• Facebook groups for UW rideshares</li>
            <li>• Typical Uber to airport: ~$60-80</li>
          </ul>
        </div>

        {/* Walking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚶</span>
            <div>
              <h2 className="font-semibold text-lg">Walking</h2>
              <p className="text-sm text-gray-500">Compact campus area</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Campus to Plaza: 5-10 min walk</li>
            <li>• Campus to Uptown: 15-20 min walk</li>
            <li>• Most student housing is walkable</li>
            <li>• Free! 🆓</li>
          </ul>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
        <h3 className="font-semibold text-green-800 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Get a Presto card for seamless transit across GRT and GO</li>
          <li>• The U-Pass is mandatory and gives unlimited GRT access</li>
          <li>• ION + Bus transfers are free within 90 minutes</li>
          <li>• Consider a bike for the warmer months (May-October)</li>
        </ul>
      </div>
    </div>
  );
}
