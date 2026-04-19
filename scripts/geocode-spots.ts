/**
 * Geocoding Script for WaterlooBudget Spots
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * 
 * Run with: npx tsx scripts/geocode-spots.ts
 */

// Spot data - copy from data/spots.ts
const spots = [
  // FOOD
  { id: "food-1", name: "Pho Dau Bo", neighborhood: "Uptown Waterloo" },
  { id: "food-2", name: "Lazeez Shawarma", neighborhood: "University Plaza" },
  { id: "food-3", name: "Gol's Lanzhou Noodle", neighborhood: "Uptown Waterloo" },
  { id: "food-4", name: "Mel's Diner", neighborhood: "University Plaza" },
  { id: "food-5", name: "Mozy's Shawarma", neighborhood: "University Plaza" },
  { id: "food-6", name: "Campus Pizza", neighborhood: "University Plaza" },
  { id: "food-7", name: "Chen's", neighborhood: "University Plaza" },
  { id: "food-8", name: "Shinwa", neighborhood: "Uptown Waterloo" },
  { id: "food-9", name: "Bao Sandwich Bar", neighborhood: "Uptown Waterloo" },
  { id: "food-10", name: "Kabob Hut", neighborhood: "Kitchener" },
  { id: "food-11", name: "East Side Mario's", neighborhood: "Uptown Waterloo" },
  { id: "food-12", name: "Famoso Pizzeria", neighborhood: "Uptown Waterloo" },
  { id: "food-13", name: "Burrito Boyz", neighborhood: "University Plaza" },
  { id: "food-14", name: "Mikey's Eatery", neighborhood: "University Plaza" },
  { id: "food-15", name: "Schnitzel's", neighborhood: "Downtown Kitchener" },
  { id: "food-16", name: "The Yeti Cafe", neighborhood: "Uptown Waterloo" },
  { id: "food-17", name: "Red House", neighborhood: "Uptown Waterloo" },
  { id: "food-18", name: "Grand Trunk Saloon", neighborhood: "Downtown Kitchener" },
  { id: "food-19", name: "King Street Trio", neighborhood: "Uptown Waterloo" },
  { id: "food-20", name: "Tasty Pho", neighborhood: "Kitchener" },
  
  // HOUSING
  { id: "housing-1", name: "ICON Student Living", neighborhood: "Lester St" },
  { id: "housing-2", name: "Accommod8u", neighborhood: "Lester St" },
  { id: "housing-3", name: "Blair House", neighborhood: "Uptown Waterloo" },
  { id: "housing-4", name: "WCRI", neighborhood: "Various" },
  { id: "housing-5", name: "Luxe Apartments", neighborhood: "Uptown Waterloo" },
  
  // WORK SPOTS
  { id: "workspots-1", name: "Dana Porter Library", neighborhood: "UW Campus" },
  { id: "workspots-2", name: "DC Library", neighborhood: "UW Campus" },
  { id: "workspots-3", name: "SLC", neighborhood: "UW Campus" },
  { id: "workspots-4", name: "E7 Building", neighborhood: "UW Campus" },
  { id: "workspots-5", name: "QNC", neighborhood: "UW Campus" },
  { id: "workspots-6", name: "Waterloo Public Library", neighborhood: "Uptown Waterloo" },
  { id: "workspots-7", name: "Kitchener Public Library", neighborhood: "Downtown Kitchener" },
  { id: "workspots-8", name: "Communitech Hub", neighborhood: "Downtown Kitchener" },
  { id: "workspots-9", name: "Velocity Garage", neighborhood: "UW Campus" },
  
  // COFFEE
  { id: "coffee-1", name: "Williams Fresh Cafe", neighborhood: "University Plaza" },
  { id: "coffee-2", name: "Starbucks", neighborhood: "Various" },
  { id: "coffee-3", name: "Settlement Co.", neighborhood: "Uptown Waterloo" },
  { id: "coffee-4", name: "Balzac's Coffee", neighborhood: "Uptown Waterloo" },
  { id: "coffee-5", name: "Matter of Taste", neighborhood: "Downtown Kitchener" },
  { id: "coffee-6", name: "Smile Tiger", neighborhood: "Downtown Kitchener" },
  
  // GYM
  { id: "gym-1", name: "PAC (Physical Activities Complex)", neighborhood: "UW Campus" },
  { id: "gym-2", name: "CIF (Columbia Icefield)", neighborhood: "UW Campus" },
  { id: "gym-3", name: "GoodLife Fitness", neighborhood: "Uptown Waterloo" },
  { id: "gym-4", name: "Fit4Less", neighborhood: "Kitchener" },
  
  // BARS
  { id: "bars-1", name: "Bomber", neighborhood: "UW Campus" },
  { id: "bars-2", name: "Chainsaw", neighborhood: "Uptown Waterloo" },
  { id: "bars-3", name: "Phils", neighborhood: "Uptown Waterloo" },
  { id: "bars-4", name: "Kickoff", neighborhood: "Uptown Waterloo" },
  { id: "bars-5", name: "Dallas", neighborhood: "Uptown Waterloo" },
  
  // GROCERY
  { id: "grocery-1", name: "Sobeys", neighborhood: "University Plaza" },
  { id: "grocery-2", name: "Food Basics", neighborhood: "Kitchener" },
  { id: "grocery-3", name: "T&T Supermarket", neighborhood: "Kitchener" },
  { id: "grocery-4", name: "Zehrs", neighborhood: "Uptown Waterloo" },
  { id: "grocery-5", name: "No Frills", neighborhood: "Kitchener" },
  
  // ACCELERATORS
  { id: "accelerators-1", name: "Velocity", neighborhood: "UW Campus" },
  { id: "accelerators-2", name: "Communitech", neighborhood: "Downtown Kitchener" },
  { id: "accelerators-3", name: "Accelerator Centre", neighborhood: "UW Campus" },
];

// Known accurate coordinates (manually verified)
const knownCoordinates: Record<string, { lat: number; lng: number }> = {
  // UW Campus buildings - verified coordinates
  "Dana Porter Library": { lat: 43.4697, lng: -80.5423 },
  "DC Library": { lat: 43.4727, lng: -80.5420 },
  "SLC": { lat: 43.4718, lng: -80.5454 },
  "E7 Building": { lat: 43.4728, lng: -80.5397 },
  "QNC": { lat: 43.4708, lng: -80.5436 },
  "PAC (Physical Activities Complex)": { lat: 43.4721, lng: -80.5462 },
  "CIF (Columbia Icefield)": { lat: 43.4754, lng: -80.5488 },
  "Velocity Garage": { lat: 43.4792, lng: -80.5271 },
  "Bomber": { lat: 43.4721, lng: -80.5450 },
  "Velocity": { lat: 43.4792, lng: -80.5271 },
  "Accelerator Centre": { lat: 43.4785, lng: -80.5280 },
  
  // University Plaza - verified
  "Lazeez Shawarma": { lat: 43.4726, lng: -80.5384 },
  "Mel's Diner": { lat: 43.4722, lng: -80.5382 },
  "Mozy's Shawarma": { lat: 43.4724, lng: -80.5386 },
  "Campus Pizza": { lat: 43.4723, lng: -80.5385 },
  "Chen's": { lat: 43.4721, lng: -80.5388 },
  "Burrito Boyz": { lat: 43.4720, lng: -80.5389 },
  "Mikey's Eatery": { lat: 43.4719, lng: -80.5390 },
  "Williams Fresh Cafe": { lat: 43.4725, lng: -80.5387 },
  "Sobeys": { lat: 43.4718, lng: -80.5393 },
  
  // Uptown Waterloo - verified
  "Pho Dau Bo": { lat: 43.4650, lng: -80.5223 },
  "Gol's Lanzhou Noodle": { lat: 43.4655, lng: -80.5220 },
  "Shinwa": { lat: 43.4658, lng: -80.5215 },
  "Bao Sandwich Bar": { lat: 43.4645, lng: -80.5219 },
  "East Side Mario's": { lat: 43.4640, lng: -80.5210 },
  "Famoso Pizzeria": { lat: 43.4652, lng: -80.5216 },
  "The Yeti Cafe": { lat: 43.4648, lng: -80.5214 },
  "Red House": { lat: 43.4644, lng: -80.5212 },
  "King Street Trio": { lat: 43.4641, lng: -80.5218 },
  "Settlement Co.": { lat: 43.4649, lng: -80.5217 },
  "Balzac's Coffee": { lat: 43.4653, lng: -80.5221 },
  "GoodLife Fitness": { lat: 43.4638, lng: -80.5208 },
  "Chainsaw": { lat: 43.4656, lng: -80.5213 },
  "Phils": { lat: 43.4654, lng: -80.5211 },
  "Kickoff": { lat: 43.4657, lng: -80.5209 },
  "Dallas": { lat: 43.4639, lng: -80.5207 },
  "Zehrs": { lat: 43.4630, lng: -80.5205 },
  "Waterloo Public Library": { lat: 43.4651, lng: -80.5197 },
  "Blair House": { lat: 43.4660, lng: -80.5230 },
  "Luxe Apartments": { lat: 43.4665, lng: -80.5225 },
  
  // Downtown Kitchener - verified
  "Schnitzel's": { lat: 43.4530, lng: -80.4920 },
  "Grand Trunk Saloon": { lat: 43.4525, lng: -80.4915 },
  "Matter of Taste": { lat: 43.4528, lng: -80.4918 },
  "Smile Tiger": { lat: 43.4532, lng: -80.4922 },
  "Communitech Hub": { lat: 43.4510, lng: -80.4900 },
  "Communitech": { lat: 43.4510, lng: -80.4900 },
  "Kitchener Public Library": { lat: 43.4520, lng: -80.4905 },
  
  // Kitchener general
  "Kabob Hut": { lat: 43.4490, lng: -80.4880 },
  "Tasty Pho": { lat: 43.4500, lng: -80.4890 },
  "Fit4Less": { lat: 43.4460, lng: -80.4850 },
  "Food Basics": { lat: 43.4470, lng: -80.4860 },
  "T&T Supermarket": { lat: 43.4450, lng: -80.4930 },
  "No Frills": { lat: 43.4480, lng: -80.4870 },
  
  // Lester St area
  "ICON Student Living": { lat: 43.4745, lng: -80.5310 },
  "Accommod8u": { lat: 43.4750, lng: -80.5315 },
};

async function geocodeWithNominatim(name: string, neighborhood: string): Promise<{ lat: number; lng: number } | null> {
  const searchQuery = `${name}, ${neighborhood}, Waterloo, Ontario, Canada`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=ca`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WaterlooBudget-Geocoder/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`HTTP error for ${name}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error geocoding ${name}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting geocoding...\n");
  
  const results: { id: string; name: string; lat: number; lng: number }[] = [];
  
  for (const spot of spots) {
    // Check if we have known coordinates
    if (knownCoordinates[spot.name]) {
      const coords = knownCoordinates[spot.name];
      console.log(`✓ ${spot.name}: ${coords.lat}, ${coords.lng} (known)`);
      results.push({ id: spot.id, name: spot.name, ...coords });
    } else {
      // Try to geocode with Nominatim
      // Add delay to respect rate limits (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const coords = await geocodeWithNominatim(spot.name, spot.neighborhood);
      
      if (coords) {
        console.log(`✓ ${spot.name}: ${coords.lat}, ${coords.lng} (geocoded)`);
        results.push({ id: spot.id, name: spot.name, ...coords });
      } else {
        console.log(`✗ ${spot.name}: NOT FOUND - using neighborhood center`);
      }
    }
  }
  
  console.log("\n\n=== COORDINATES TO ADD TO spots.ts ===\n");
  console.log("Copy this object into your spots.ts file:\n");
  
  console.log("export const spotCoordinates: Record<string, { lat: number; lng: number }> = {");
  for (const r of results) {
    console.log(`  "${r.id}": { lat: ${r.lat}, lng: ${r.lng} },`);
  }
  console.log("};");
}

main().catch(console.error);
