export default function EventsPage() {
  const events = [
    {
      name: "Velocity Demo Day",
      frequency: "Quarterly",
      location: "Downtown Kitchener",
      description: "Startup showcase from Velocity incubator",
      free: true,
    },
    {
      name: "Communitech Tech Talks",
      frequency: "Weekly",
      location: "The Hub / Virtual",
      description: "Tech community talks and networking",
      free: true,
    },
    {
      name: "UW Hackathons",
      frequency: "Multiple per term",
      location: "UW Campus",
      description: "Hack the North, StarterHacks, and more",
      free: true,
    },
    {
      name: "Tech Leadership Conference",
      frequency: "Annual (March)",
      location: "UW Campus",
      description: "Canada's largest student-run conference",
      free: false,
    },
    {
      name: "Startup Open House",
      frequency: "Monthly",
      location: "Velocity Garage",
      description: "Meet local startups and founders",
      free: true,
    },
    {
      name: "KW Tech Meetups",
      frequency: "Various",
      location: "Various",
      description: "JS, Python, DevOps, AI meetup groups",
      free: true,
    },
    {
      name: "Waterloo Innovation Summit",
      frequency: "Annual",
      location: "Downtown Kitchener",
      description: "Regional tech and innovation conference",
      free: false,
    },
    {
      name: "Coffee & Code",
      frequency: "Weekly",
      location: "Various cafes",
      description: "Informal coding sessions",
      free: true,
    },
    {
      name: "Concept Pitch Competition",
      frequency: "Annual (Winter)",
      location: "UW Campus",
      description: "Student startup pitch competition",
      free: true,
    },
    {
      name: "GreenHouse Social Impact",
      frequency: "Monthly",
      location: "UW Campus",
      description: "Social entrepreneurship events",
      free: true,
    },
  ];

  const communityResources = [
    {
      name: "Waterloo Tech Slack",
      description: "Join the local tech community Slack workspace",
      link: "#",
    },
    {
      name: "UW Startups Discord",
      description: "Connect with student founders",
      link: "#",
    },
    {
      name: "r/uwaterloo",
      description: "Reddit community for UW students",
      link: "https://reddit.com/r/uwaterloo",
    },
    {
      name: "Meetup.com KW",
      description: "Find local tech and social meetups",
      link: "https://meetup.com",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📅 Events</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          Tech events, meetups, and networking opportunities in Waterloo Region.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{event.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {event.frequency} · {event.location}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">{event.description}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                  event.free
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.free ? "Free" : "Paid"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          🔗 Community Resources
        </h2>
        <div className="grid gap-3 sm:gap-3 sm:gap-4 md:grid-cols-2">
          {communityResources.map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow block"
            >
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{resource.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
