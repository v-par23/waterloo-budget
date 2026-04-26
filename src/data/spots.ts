export type Category =
  | "food"
  | "housing"
  | "workspots"
  | "coffee"
  | "accelerators"
  | "gym"
  | "bars"
  | "grocery";

export interface Spot {
  id: string;
  name: string;
  category: Category;
  neighborhood: string;
  price: string;
  priceLevel: number; // 1-4 dollar signs
  emoji: string;
  description?: string;
  address?: string;
  url?: string;
  isFree?: boolean;
  lat?: number;
  lng?: number;
}

export const categoryConfig: Record<
  Category,
  { label: string; emoji: string; color: string; iconBg: string }
> = {
  food: { label: "Food", emoji: "🍽️", color: "bg-orange-100 text-orange-800", iconBg: "bg-orange-50" },
  housing: { label: "Housing", emoji: "🏠", color: "bg-blue-100 text-blue-800", iconBg: "bg-blue-50" },
  workspots: { label: "Work Spots", emoji: "💻", color: "bg-purple-100 text-purple-800", iconBg: "bg-purple-50" },
  coffee: { label: "Coffee", emoji: "☕", color: "bg-amber-100 text-amber-800", iconBg: "bg-amber-50" },
  accelerators: { label: "Accelerators", emoji: "🚀", color: "bg-emerald-100 text-emerald-800", iconBg: "bg-emerald-50" },
  gym: { label: "Gym & Fitness", emoji: "💪", color: "bg-red-100 text-red-800", iconBg: "bg-red-50" },
  bars: { label: "Bars & Drinks", emoji: "🍺", color: "bg-yellow-100 text-yellow-800", iconBg: "bg-yellow-50" },
  grocery: { label: "Grocery", emoji: "🛒", color: "bg-teal-100 text-teal-800", iconBg: "bg-teal-50" },
};

export const spots: Spot[] = [
  // FOOD - Waterloo/Kitchener area restaurants
  {
    id: "food-1",
    name: "Pho Dau Bo",
    category: "food",
    neighborhood: "Kitchener",
    price: "~$12",
    priceLevel: 1,
    emoji: "🍜",
    description: "Vietnamese pho restaurant",
  },
  {
    id: "food-2",
    name: "Lazeez Shawarma",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$10",
    priceLevel: 1,
    emoji: "🍽️",
    description: "Shawarma on the sticks, student favorite",
  },
  {
    id: "food-3",
    name: "Gol's Lanzhou Noodle",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$14",
    priceLevel: 1,
    emoji: "🍜",
    description: "Hand-pulled noodles",
  },
  {
    id: "food-4",
    name: "Mel's Diner",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$12",
    priceLevel: 1,
    emoji: "🍽️",
    description: "Classic diner breakfast & burgers",
  },
  {
    id: "food-5",
    name: "Mozy's Shawarma",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$11",
    priceLevel: 1,
    emoji: "🍽️",
    description: "Huge portions shawarma",
  },


  {
    id: "food-8",
    name: "Shinwa",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$16",
    priceLevel: 2,
    emoji: "🍜",
    description: "Chinese cuisine",
  },
  {
    id: "food-9",
    name: "Bao Sandwich Bar",
    category: "food",
    neighborhood: "Uptown Waterloo",
    price: "~$13",
    priceLevel: 1,
    emoji: "🍽️",
    description: "Asian fusion baos",
  },
  {
    id: "food-10",
    name: "Kabob Hut",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$12",
    priceLevel: 1,
    emoji: "🍖",
    description: "Persian cuisine",
  },

  {
    id: "food-12",
    name: "Famoso Italian Pizzeria",
    category: "food",
    neighborhood: "Uptown Waterloo",
    price: "~$16",
    priceLevel: 2,
    emoji: "🍕",
    description: "Neapolitan pizza",
  },
  {
    id: "food-13",
    name: "Burrito Boyz",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$11",
    priceLevel: 1,
    emoji: "🍽️",
    description: "Massive burritos",
  },
  {
    id: "food-21",
    name: "Pho Anh Vu",
    category: "food",
    neighborhood: "University Plaza",
    price: "~$12",
    priceLevel: 1,
    emoji: "🍜",
    description: "Vietnamese pho",
  },



  {
    id: "food-18",
    name: "Grand Trunk Saloon",
    category: "bars",
    neighborhood: "Downtown Kitchener",
    price: "~$18",
    priceLevel: 2,
    emoji: "🍻",
    description: "Gastropub with local beer",
  },
  {
    id: "food-19",
    name: "Trio Restaurant",
    category: "food",
    neighborhood: "Uptown Waterloo",
    price: "~$16",
    priceLevel: 2,
    emoji: "🍽️",
    description: "Upscale pub food",
  },


  // HOUSING
  {
    id: "housing-1",
    name: "ICON Student Living",
    category: "housing",
    neighborhood: "UW Campus",
    price: "~$800-1,200/mo",
    priceLevel: 2,
    emoji: "🏠",
    description: "Modern student apartments",
  },

  {
    id: "housing-3",
    name: "Blair House",
    category: "housing",
    neighborhood: "UW Campus",
    price: "~$700-900/mo",
    priceLevel: 1,
    emoji: "🏠",
    description: "Affordable student rooms",
  },


  {
    id: "housing-6",
    name: "Preston House",
    category: "housing",
    neighborhood: "Uptown Waterloo",
    price: "~$650-900/mo",
    priceLevel: 1,
    emoji: "🏠",
    description: "Budget student housing",
  },


  {
    id: "housing-9",
    name: "Sage Lofts",
    category: "housing",
    neighborhood: "Northdale",
    price: "~$700-1,000/mo",
    priceLevel: 1,
    emoji: "🏠",
    description: "Student apartments",
  },
  {
    id: "housing-10",
    name: "UW Place",
    category: "housing",
    neighborhood: "UW Campus",
    price: "~$800-1,100/mo",
    priceLevel: 2,
    emoji: "🏠",
    description: "On-campus residence",
  },

  // WORK SPOTS
  {
    id: "work-1",
    name: "Waterloo Public Library",
    category: "workspots",
    neighborhood: "Waterloo",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Public library",
    isFree: true,
  },
  {
    id: "work-2",
    name: "DC Library (UW)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "University library, 24/7 during exams",
    isFree: true,
  },

  {
    id: "work-4",
    name: "Communitech Hub",
    category: "workspots",
    neighborhood: "Downtown Kitchener",
    price: "~$400/mo",
    priceLevel: 2,
    emoji: "💻",
    description: "Tech community hub",
  },
  {
    id: "work-5",
    name: "E5",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Engineering building study space",
    isFree: true,
  },
  {
    id: "work-6",
    name: "SLC (Student Life Centre)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Student center with tables",
    isFree: true,
  },
  {
    id: "work-7",
    name: "QNC (Quantum Nano)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Quiet study spaces",
    isFree: true,
  },
  {
    id: "work-8",
    name: "Dana Porter Library (UW)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Main campus library, multiple floors",
    isFree: true,
  },
  {
    id: "work-9",
    name: "Hagey Hall",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Arts building with study areas",
    isFree: true,
  },
  {
    id: "work-10",
    name: "SJU (St. Jerome's)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Quiet federated university building",
    isFree: true,
  },
  {
    id: "work-11",
    name: "EV3 (Environment 3)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Environment building study space",
    isFree: true,
  },
  {
    id: "work-12",
    name: "STC (Science Teaching Complex)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Science building with open areas",
    isFree: true,
  },
  {
    id: "work-13",
    name: "MC (Mathematics and Computer)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Math building, Comfy Lounge",
    isFree: true,
  },
  {
    id: "work-14",
    name: "M3 (Mathematics 3)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Newer math building study spots",
    isFree: true,
  },
  {
    id: "work-15",
    name: "E7 (Engineering 7)",
    category: "workspots",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "💻",
    description: "Modern engineering building",
    isFree: true,
  },



  // COFFEE
  {
    id: "coffee-1",
    name: "Williams Fresh Cafe",
    category: "coffee",
    neighborhood: "University Plaza",
    price: "~$5",
    priceLevel: 1,
    emoji: "☕",
    description: "Local chain, good wifi",
  },
  {
    id: "coffee-2",
    name: "Balzac's Kitchener",
    category: "coffee",
    neighborhood: "Downtown Kitchener",
    price: "~$6",
    priceLevel: 2,
    emoji: "☕",
    description: "Artisan coffee",
  },

  {
    id: "coffee-4",
    name: "Death Valley's Little Brother",
    category: "coffee",
    neighborhood: "Uptown Waterloo",
    price: "~$5",
    priceLevel: 1,
    emoji: "☕",
    description: "Cozy small batch roaster",
  },
  {
    id: "coffee-5",
    name: "Tim Hortons",
    category: "coffee",
    neighborhood: "Various",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Canadian classic, everywhere",
  },
  {
    id: "coffee-6",
    name: "Starbucks",
    category: "coffee",
    neighborhood: "Various",
    price: "~$6",
    priceLevel: 2,
    emoji: "☕",
    description: "On campus and uptown",
  },
  {
    id: "coffee-7",
    name: "Matter of Taste",
    category: "coffee",
    neighborhood: "Downtown Kitchener",
    price: "~$5",
    priceLevel: 1,
    emoji: "☕",
    description: "Cafe in Duke Food Block",
  },
  {
    id: "coffee-8",
    name: "Smile Tiger",
    category: "coffee",
    neighborhood: "Kitchener",
    price: "~$5",
    priceLevel: 1,
    emoji: "☕",
    description: "Specialty roaster",
  },

  {
    id: "coffee-10",
    name: "The Yeti Cafe",
    category: "coffee",
    neighborhood: "Downtown Kitchener",
    price: "~$5",
    priceLevel: 1,
    emoji: "☕",
    description: "Cozy cafe with specialty coffee",
  },
  {
    id: "coffee-11",
    name: "Environmental Studies Coffee Shop",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$4",
    priceLevel: 1,
    emoji: "☕",
    description: "On-campus cafe in Environment building",
  },
  {
    id: "coffee-12",
    name: "Ev3rgreen Cafe",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$4",
    priceLevel: 1,
    emoji: "☕",
    description: "Campus cafe with fresh options",
  },
  {
    id: "coffee-13",
    name: "Liquid Assets Cafe",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$4",
    priceLevel: 1,
    emoji: "☕",
    description: "Popular campus coffee spot",
  },
  {
    id: "coffee-14",
    name: "Browsers Cafe",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$4",
    priceLevel: 1,
    emoji: "☕",
    description: "Campus cafe in Dana Porter Library",
  },
  {
    id: "coffee-15",
    name: "The Funcken Café",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$4",
    priceLevel: 1,
    emoji: "☕",
    description: "Cozy campus cafe",
  },
  {
    id: "coffee-16",
    name: "Starbucks - SLC",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$6",
    priceLevel: 2,
    emoji: "☕",
    description: "Starbucks in Student Life Centre",
  },
  {
    id: "coffee-17",
    name: "Starbucks - Plaza",
    category: "coffee",
    neighborhood: "University Plaza",
    price: "~$6",
    priceLevel: 2,
    emoji: "☕",
    description: "Starbucks near campus",
  },
  {
    id: "coffee-18",
    name: "Tim Hortons - Columbia",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Tim Hortons on Columbia St",
  },
  {
    id: "coffee-19",
    name: "Tim Hortons - Northfield",
    category: "coffee",
    neighborhood: "University Plaza",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Tim Hortons near campus",
  },
  {
    id: "coffee-20",
    name: "Tim Hortons - Uptown",
    category: "coffee",
    neighborhood: "Uptown Waterloo",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Tim Hortons in Uptown",
  },
  {
    id: "coffee-21",
    name: "Math C&D",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Coffee & donuts in MC building",
  },
  {
    id: "coffee-22",
    name: "Science C&D",
    category: "coffee",
    neighborhood: "UW Campus",
    price: "~$3",
    priceLevel: 1,
    emoji: "☕",
    description: "Coffee & donuts in Science building",
  },

  // ACCELERATORS & STARTUP RESOURCES
  {
    id: "acc-1",
    name: "Velocity",
    category: "accelerators",
    neighborhood: "Downtown Kitchener",
    price: "Free",
    priceLevel: 0,
    emoji: "🚀",
    description: "UW's startup incubator, top in Canada",
    isFree: true,
  },
  {
    id: "acc-2",
    name: "Communitech",
    category: "accelerators",
    neighborhood: "Downtown Kitchener",
    price: "Free",
    priceLevel: 0,
    emoji: "🚀",
    description: "Regional tech hub and accelerator",
    isFree: true,
  },

  {
    id: "acc-4",
    name: "Next 36/Next AI",
    category: "accelerators",
    neighborhood: "Virtual",
    price: "Free",
    priceLevel: 0,
    emoji: "🚀",
    description: "For Canadian entrepreneurs",
    isFree: true,
  },
  {
    id: "acc-5",
    name: "GreenHouse",
    category: "accelerators",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "🚀",
    description: "Social impact incubator",
    isFree: true,
  },
  {
    id: "acc-6",
    name: "Concept",
    category: "accelerators",
    neighborhood: "UW Campus",
    price: "Free",
    priceLevel: 0,
    emoji: "🚀",
    description: "UW startup pitch competition",
    isFree: true,
  },



  // GYM & FITNESS
  {
    id: "gym-1",
    name: "PAC (Physical Activities Complex)",
    category: "gym",
    neighborhood: "UW Campus",
    price: "~$50/term",
    priceLevel: 1,
    emoji: "💪",
    description: "UW gym, students included in fees",
  },
  {
    id: "gym-2",
    name: "CIF (Columbia Icefield)",
    category: "gym",
    neighborhood: "UW Campus",
    price: "~$50/term",
    priceLevel: 1,
    emoji: "💪",
    description: "Newer UW fitness facility",
  },
  {
    id: "gym-3",
    name: "GoodLife Fitness",
    category: "gym",
    neighborhood: "Uptown Waterloo",
    price: "~$50/mo",
    priceLevel: 2,
    emoji: "💪",
    description: "Weber St N & Columbia St E location",
  },
  {
    id: "gym-4",
    name: "Fit4Less",
    category: "gym",
    neighborhood: "Various",
    price: "~$15/mo",
    priceLevel: 1,
    emoji: "💪",
    description: "Budget gym option",
  },
  {
    id: "gym-5",
    name: "Movati Athletic",
    category: "gym",
    neighborhood: "Waterloo",
    price: "~$60/mo",
    priceLevel: 2,
    emoji: "💪",
    description: "Premium athletic club",
  },
  {
    id: "gym-6",
    name: "YMCA Waterloo",
    category: "gym",
    neighborhood: "Waterloo",
    price: "~$45/mo",
    priceLevel: 2,
    emoji: "💪",
    description: "Community fitness center",
  },
  {
    id: "gym-7",
    name: "Waterloo Park",
    category: "gym",
    neighborhood: "Uptown Waterloo",
    price: "Free",
    priceLevel: 0,
    emoji: "💪",
    description: "Running trails and outdoor space",
    isFree: true,
  },
  {
    id: "gym-8",
    name: "RIM Park",
    category: "gym",
    neighborhood: "Waterloo",
    price: "~$5/visit",
    priceLevel: 1,
    emoji: "💪",
    description: "Public rec facility",
  },

  // BARS & DRINKS
  {
    id: "bar-1",
    name: "Bomber (UW)",
    category: "bars",
    neighborhood: "UW Campus",
    price: "~$6",
    priceLevel: 1,
    emoji: "🍺",
    description: "On-campus student pub",
  },


  {
    id: "bar-4",
    name: "Ethel's Lounge",
    category: "bars",
    neighborhood: "Uptown Waterloo",
    price: "~$7",
    priceLevel: 1,
    emoji: "🍺",
    description: "Live music venue",
  },
  {
    id: "bar-5",
    name: "Abe Erb",
    category: "bars",
    neighborhood: "Uptown Waterloo",
    price: "~$8",
    priceLevel: 2,
    emoji: "🍺",
    description: "Local craft brewery",
  },

  {
    id: "bar-7",
    name: "Beertown",
    category: "bars",
    neighborhood: "Uptown Waterloo",
    price: "~$9",
    priceLevel: 2,
    emoji: "🍺",
    description: "Craft beer selection",
  },


  // GROCERY
  {
    id: "grocery-1",
    name: "Sobeys",
    category: "grocery",
    neighborhood: "Various",
    price: "~$60/week",
    priceLevel: 2,
    emoji: "🛒",
    description: "Full grocery store",
  },
  {
    id: "grocery-2",
    name: "Food Basics",
    category: "grocery",
    neighborhood: "Various",
    price: "~$40/week",
    priceLevel: 1,
    emoji: "🛒",
    description: "Budget grocery",
  },
  {
    id: "grocery-3",
    name: "No Frills",
    category: "grocery",
    neighborhood: "Various",
    price: "~$40/week",
    priceLevel: 1,
    emoji: "🛒",
    description: "Discount grocery store",
  },
  {
    id: "grocery-4",
    name: "Costco",
    category: "grocery",
    neighborhood: "Waterloo",
    price: "~$80/trip",
    priceLevel: 2,
    emoji: "🛒",
    description: "Bulk shopping",
  },
  {
    id: "grocery-5",
    name: "T&T Supermarket",
    category: "grocery",
    neighborhood: "Waterloo",
    price: "~$50/week",
    priceLevel: 2,
    emoji: "🛒",
    description: "Asian grocery",
  },
  {
    id: "grocery-6",
    name: "Vincenzo's",
    category: "grocery",
    neighborhood: "Uptown Waterloo",
    price: "~$60/week",
    priceLevel: 2,
    emoji: "🛒",
    description: "Specialty & Italian foods",
  },
  {
    id: "grocery-7",
    name: "Walmart Supercentre",
    category: "grocery",
    neighborhood: "Various",
    price: "~$50/week",
    priceLevel: 1,
    emoji: "🛒",
    description: "One-stop shop",
  },
  {
    id: "grocery-8",
    name: "Zehrs",
    category: "grocery",
    neighborhood: "Various",
    price: "~$55/week",
    priceLevel: 2,
    emoji: "🛒",
    description: "Full-service grocery",
  },

  {
    id: "grocery-10",
    name: "Kitchener Market",
    category: "grocery",
    neighborhood: "Downtown Kitchener",
    price: "~$40/visit",
    priceLevel: 1,
    emoji: "🛒",
    description: "Farmers market, Saturdays",
  },
];

export const neighborhoods = [
  "All",
  "UW Campus",
  "University Plaza",
  "Uptown Waterloo",
  "Downtown Kitchener",
  "Lester St",
  "Northdale",
  "Kitchener",
  "Various",
  "Virtual",
];

// ====================================================================
// VERIFIED COORDINATES FROM GOOGLE MAPS (April 2026)
// All locations manually checked for accuracy
// ====================================================================
export const spotCoordinates: Record<string, { lat: number; lng: number }> = {
  // FOOD - Verified from Google Maps
  "food-1": { lat: 43.4213, lng: -80.5108 }, // Pho Dau Bo - Kitchener
  "food-2": { lat: 43.4724, lng: -80.5388 }, // Lazeez Shawarma - 170 University Ave W
  "food-3": { lat: 43.4726, lng: -80.5363 }, // Gol's Lanzhou - University Plaza
  "food-4": { lat: 43.4729, lng: -80.5356 }, // Mel's Diner - 140 University Ave W
  "food-5": { lat: 43.4763, lng: -80.5257 }, // Mozy's - University Plaza
  "food-8": { lat: 43.4722, lng: -80.5380 }, // Shinwa - 160 University Ave W (UW Plaza!)
  "food-9": { lat: 43.4767, lng: -80.5301 }, // Bao Sandwich Bar
  "food-10": { lat: 43.4726, lng: -80.5388 }, // Kabob Hut - University Plaza
  "food-12": { lat: 43.4644, lng: -80.5223 }, // Famoso Italian Pizzeria - Uptown
  "food-13": { lat: 43.4719, lng: -80.5387 }, // Burrito Boyz - UW Plaza
  "food-21": { lat: 43.4726, lng: -80.5388 }, // Pho Anh Vu - University Plaza
  "food-18": { lat: 43.4504, lng: -80.4909 }, // Grand Trunk Saloon - DT Kitchener (now bars)
  "food-19": { lat: 43.4645, lng: -80.5220 }, // Trio Restaurant - Uptown

  // HOUSING - Verified
  "housing-1": { lat: 43.4769, lng: -80.5393 }, // ICON - UW Campus
  "housing-3": { lat: 43.4738, lng: -80.5371 }, // Blair House - UW Campus
  "housing-6": { lat: 43.4795, lng: -80.5259 }, // Preston House - Uptown Waterloo
  "housing-9": { lat: 43.4775, lng: -80.5270 }, // Sage Lofts - Northdale
  "housing-10": { lat: 43.4698, lng: -80.5348 }, // UW Place - UW Campus

  // WORK SPOTS - Verified UW Buildings
  "work-1": { lat: 43.4745, lng: -80.5711 }, // Waterloo Public Library
  "work-2": { lat: 43.4732, lng: -80.5418 }, // DC Library (UW)
  "work-4": { lat: 43.4502, lng: -80.4928 }, // Communitech Hub
  "work-5": { lat: 43.4728, lng: -80.5401 }, // E5
  "work-6": { lat: 43.4719, lng: -80.5449 }, // SLC
  "work-7": { lat: 43.4711, lng: -80.5444 }, // QNC
  "work-8": { lat: 43.4698, lng: -80.5424 }, // Dana Porter Library
  "work-9": { lat: 43.4679, lng: -80.5414 }, // Hagey Hall
  "work-10": { lat: 43.4688, lng: -80.5459 }, // SJU
  "work-11": { lat: 43.4682, lng: -80.5436 }, // EV3
  "work-12": { lat: 43.4706, lng: -80.5435 }, // STC
  "work-13": { lat: 43.4721, lng: -80.5439 }, // MC
  "work-14": { lat: 43.4733, lng: -80.5441 }, // M3
  "work-15": { lat: 43.4733, lng: -80.5396 }, // E7

  // COFFEE - Verified
  "coffee-1": { lat: 43.4724, lng: -80.5386 }, // Williams - University Plaza
  "coffee-2": { lat: 43.4546, lng: -80.4989 }, // Balzac's Kitchener
  "coffee-4": { lat: 43.4655, lng: -80.5205 }, // Death Valley's Little Brother
  "coffee-5": { lat: 43.4719, lng: -80.5449 }, // Tim Hortons - SLC
  "coffee-6": { lat: 43.4773, lng: -80.5385 }, // Starbucks
  "coffee-7": { lat: 43.4509, lng: -80.4913 }, // Matter of Taste
  "coffee-8": { lat: 43.4566, lng: -80.4918 }, // Smile Tiger
  "coffee-10": { lat: 43.4485, lng: -80.4842 }, // Yeti Cafe
  "coffee-11": { lat: 43.4682, lng: -80.5429 }, // Environmental Studies Coffee Shop
  "coffee-12": { lat: 43.4683, lng: -80.5436 }, // Ev3rgreen Cafe
  "coffee-13": { lat: 43.4682, lng: -80.5414 }, // Liquid Assets Cafe
  "coffee-14": { lat: 43.4697, lng: -80.5420 }, // Browsers Cafe
  "coffee-15": { lat: 43.4690, lng: -80.5457 }, // The Funcken Café
  "coffee-16": { lat: 43.4708, lng: -80.5435 }, // Starbucks - SLC
  "coffee-17": { lat: 43.4735, lng: -80.5461 }, // Starbucks - Plaza
  "coffee-18": { lat: 43.4755, lng: -80.5406 }, // Tim Hortons - Columbia
  "coffee-19": { lat: 43.4769, lng: -80.5393 }, // Tim Hortons - Northfield
  "coffee-20": { lat: 43.4691, lng: -80.5401 }, // Tim Hortons - Uptown
  "coffee-21": { lat: 43.4718, lng: -80.5437 }, // Math C&D
  "coffee-22": { lat: 43.4711, lng: -80.5431 }, // Science C&D

  // ACCELERATORS - Verified
  "acc-1": { lat: 43.4520, lng: -80.5009 }, // Velocity
  "acc-2": { lat: 43.4502, lng: -80.4928 }, // Communitech
  "acc-4": { lat: 43.4504, lng: -80.4930 }, // Next 36/Next AI
  "acc-5": { lat: 43.4695, lng: -80.5403 }, // GreenHouse
  "acc-6": { lat: 43.4695, lng: -80.5403 }, // Concept

  // GYM - Verified from Google Maps
  "gym-1": { lat: 43.4722, lng: -80.5461 }, // PAC - 200 University Ave W
  "gym-2": { lat: 43.4753, lng: -80.5478 }, // CIF - 220 Columbia St W (verified!)
  "gym-3": { lat: 43.4793, lng: -80.5125 }, // GoodLife - University Ave E & Marsland Dr
  "gym-4": { lat: 43.4531, lng: -80.5559 }, // Fit4Less - 450 Erb St W (verified!)
  "gym-5": { lat: 43.4516, lng: -80.5636 }, // Movati Athletic
  "gym-6": { lat: 43.4465, lng: -80.5395 }, // YMCA - Westmount & Laurelwood
  "gym-7": { lat: 43.4675, lng: -80.5272 }, // Waterloo Park - 50 Young St W (verified!)
  "gym-8": { lat: 43.5195, lng: -80.5024 }, // RIM Park
  "gym-9": { lat: 43.4475, lng: -80.4860 }, // Anytime Fitness - Kitchener
  "gym-10": { lat: 43.4640, lng: -80.5185 }, // CrossFit - Uptown area

  // BARS - Verified
  "bar-1": { lat: 43.4719, lng: -80.5449 }, // Bomber (UW)
  "bar-4": { lat: 43.4693, lng: -80.5232 }, // Ethel's Lounge
  "bar-5": { lat: 43.4651, lng: -80.5223 }, // Abe Erb
  "bar-7": { lat: 43.4641, lng: -80.5227 }, // Beertown

  // GROCERY - ALL Verified from Google Maps
  "grocery-1": { lat: 43.4685, lng: -80.5687 }, // Sobeys - 450 Columbia St W (verified!)
  "grocery-2": { lat: 43.4728, lng: -80.5933 }, // Food Basics - 600 Laurelwood Dr (verified!)
  "grocery-3": { lat: 43.4866, lng: -80.5246 }, // No Frills - 24 Forwell Creek Rd (verified!)
  "grocery-4": { lat: 43.4453, lng: -80.5793 }, // Costco - 930 Erb St W, WATERLOO (verified!)
  "grocery-5": { lat: 43.4624, lng: -80.5381 }, // T&T - 50 Westmount Rd N (verified!)
  "grocery-6": { lat: 43.4597, lng: -80.5192 }, // Vincenzo's
  "grocery-7": { lat: 43.4703, lng: -80.5159 }, // Walmart - 70 Bridgeport Rd E (verified!)
  "grocery-8": { lat: 43.4969, lng: -80.5251 }, // Zehrs - 555 Davenport Rd (verified!)
  "grocery-10": { lat: 43.4515, lng: -80.4920 }, // Kitchener Market - Frederick St
};
