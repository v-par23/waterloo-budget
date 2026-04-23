import { spots, Spot, Category, spotCoordinates } from "@/data/spots";
import {
  ClassSession,
  TimeGap,
  SpotSuggestion,
  CategorizedSuggestions,
  timeToMinutes,
  uwBuildings,
  Building,
} from "./types";

// Calculate distance between two coordinates in meters
function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Get spots sorted by distance from a building
function getSpotsByDistance(building: Building): { spot: Spot; distance: number }[] {
  const buildingCoords = uwBuildings[building];
  
  return spots
    .map((spot) => {
      const coords = spotCoordinates[spot.id];
      if (!coords) return { spot, distance: Infinity };
      
      const distance = getDistance(
        buildingCoords.lat,
        buildingCoords.lng,
        coords.lat,
        coords.lng
      );
      return { spot, distance };
    })
    .filter(({ distance }) => distance < Infinity)
    .sort((a, b) => a.distance - b.distance);
}

// Determine what categories are best for a time gap
function getCategoriesForGap(
  durationMinutes: number,
  startTime: string
): { category: Category; weight: number }[] {
  const hour = parseInt(startTime.split(":")[0]);
  const categories: { category: Category; weight: number }[] = [];

  // Short gaps (< 30 min): quick coffee, grab and go
  if (durationMinutes < 30) {
    categories.push({ category: "coffee", weight: 10 });
    return categories;
  }

  // Medium gaps (30-60 min): coffee, quick food
  if (durationMinutes < 60) {
    categories.push({ category: "coffee", weight: 8 });
    if (hour >= 11 && hour <= 14) {
      categories.push({ category: "food", weight: 7 });
    }
    return categories;
  }

  // Longer gaps (1-2 hours): study spots, food, coffee
  if (durationMinutes < 120) {
    categories.push({ category: "workspots", weight: 9 });
    categories.push({ category: "coffee", weight: 6 });
    
    if (hour >= 11 && hour <= 14) {
      categories.push({ category: "food", weight: 8 });
    } else if (hour >= 17 && hour <= 20) {
      categories.push({ category: "food", weight: 7 });
    }
    return categories;
  }

  // Long gaps (2+ hours): study spots, gym, food
  categories.push({ category: "workspots", weight: 10 });
  
  if (hour >= 11 && hour <= 14) {
    categories.push({ category: "food", weight: 7 });
  } else if (hour >= 17 && hour <= 20) {
    categories.push({ category: "food", weight: 8 });
  }
  
  // Gym is good for long breaks
  if (durationMinutes >= 90) {
    categories.push({ category: "gym", weight: 6 });
  }

  categories.push({ category: "coffee", weight: 5 });
  
  return categories;
}

// Generate spot suggestions for a time gap
export function getSuggestionsForGap(gap: TimeGap): SpotSuggestion[] {
  const suggestions: SpotSuggestion[] = [];
  const categoryWeights = getCategoriesForGap(gap.durationMinutes, gap.startTime);

  // Get nearby spots if we know the building
  let nearbySpots: { spot: Spot; distance: number }[] = [];
  if (gap.nearestBuilding) {
    nearbySpots = getSpotsByDistance(gap.nearestBuilding);
  }

  // Score each spot
  for (const spot of spots) {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    const categoryMatch = categoryWeights.find((c) => c.category === spot.category);
    if (categoryMatch) {
      score += categoryMatch.weight;
      
      if (spot.category === "coffee" && gap.durationMinutes < 30) {
        reasons.push("Quick coffee break");
      } else if (spot.category === "workspots" && gap.durationMinutes >= 60) {
        reasons.push("Great study spot for longer breaks");
      } else if (spot.category === "food") {
        const hour = parseInt(gap.startTime.split(":")[0]);
        if (hour >= 11 && hour <= 14) {
          reasons.push("Perfect for lunch");
        } else if (hour >= 17 && hour <= 20) {
          reasons.push("Dinner time");
        }
      } else if (spot.category === "gym" && gap.durationMinutes >= 90) {
        reasons.push("Enough time for a workout");
      }
    }

    // Distance bonus
    const nearbyEntry = nearbySpots.find((n) => n.spot.id === spot.id);
    if (nearbyEntry) {
      if (nearbyEntry.distance < 200) {
        score += 5;
        reasons.push("Very close to your class");
      } else if (nearbyEntry.distance < 400) {
        score += 3;
        reasons.push("Short walk from class");
      } else if (nearbyEntry.distance < 600) {
        score += 1;
      }
    }

    // Free spot bonus for budget-conscious students
    if (spot.isFree) {
      score += 2;
      if (!reasons.some(r => r.includes("free"))) {
        reasons.push("Free!");
      }
    }

    // Low price bonus
    if (spot.priceLevel <= 1 && !spot.isFree) {
      score += 1;
    }

    if (score > 0 && reasons.length > 0) {
      suggestions.push({
        spotId: spot.id,
        reason: reasons[0],
        priority: score,
      });
    }
  }

  // Sort by priority and return top suggestions
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

// Generate categorized spot suggestions for a time gap
// Returns 3 work spots, 3 food/coffee spots, and 3 wellness spots (2 gym + 1 grocery)
export function getCategorizedSuggestionsForGap(gap: TimeGap): CategorizedSuggestions {
  // Get nearby spots if we know the building
  let nearbySpots: { spot: Spot; distance: number }[] = [];
  if (gap.nearestBuilding) {
    nearbySpots = getSpotsByDistance(gap.nearestBuilding);
  }

  // Helper to score and rank spots by category
  const scoreSpotsByCategory = (categories: Category[]): SpotSuggestion[] => {
    const suggestions: SpotSuggestion[] = [];
    const hour = parseInt(gap.startTime.split(":")[0]);

    for (const spot of spots) {
      if (!categories.includes(spot.category)) continue;

      let score = 5; // Base score for category match
      const reasons: string[] = [];

      // Category-specific reasons
      if (spot.category === "workspots") {
        if (gap.durationMinutes >= 60) {
          score += 3;
          reasons.push("Great for studying");
        } else {
          reasons.push("Quick study spot");
        }
      } else if (spot.category === "coffee") {
        if (gap.durationMinutes < 30) {
          score += 2;
          reasons.push("Quick caffeine fix");
        } else {
          reasons.push("Coffee break");
        }
      } else if (spot.category === "food") {
        if (hour >= 11 && hour <= 14) {
          score += 3;
          reasons.push("Perfect for lunch");
        } else if (hour >= 17 && hour <= 20) {
          score += 2;
          reasons.push("Dinner time");
        } else {
          reasons.push("Grab a bite");
        }
      } else if (spot.category === "gym") {
        if (gap.durationMinutes >= 60) {
          score += 3;
          reasons.push("Time for a workout");
        } else {
          score += 1;
          reasons.push("Quick gym session");
        }
      } else if (spot.category === "grocery") {
        reasons.push("Stock up on supplies");
      }

      // Distance bonus
      const nearbyEntry = nearbySpots.find((n) => n.spot.id === spot.id);
      if (nearbyEntry) {
        if (nearbyEntry.distance < 200) {
          score += 5;
          reasons.unshift("Very close");
        } else if (nearbyEntry.distance < 400) {
          score += 3;
          reasons.unshift("Short walk");
        } else if (nearbyEntry.distance < 600) {
          score += 1;
        }
      }

      // Free spot bonus
      if (spot.isFree) {
        score += 2;
        if (!reasons.some(r => r.includes("Free"))) {
          reasons.push("Free!");
        }
      }

      // Low price bonus
      if (spot.priceLevel <= 1 && !spot.isFree) {
        score += 1;
      }

      suggestions.push({
        spotId: spot.id,
        reason: reasons[0] || "Recommended",
        priority: score,
      });
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  };

  // Get work spots (3)
  const workSpots = scoreSpotsByCategory(["workspots"]).slice(0, 3);

  // Get food/coffee spots (3)
  const foodCoffeeSpots = scoreSpotsByCategory(["food", "coffee"]).slice(0, 3);

  // Get wellness spots: 2 gym + 1 grocery (sorted by distance)
  const gymSpots = scoreSpotsByCategory(["gym"]).slice(0, 2);
  
  // For grocery, prioritize by actual distance since we only show 1
  const groceryByDistance = nearbySpots
    .filter(({ spot }) => spot.category === "grocery")
    .slice(0, 1)
    .map(({ spot, distance }) => ({
      spotId: spot.id,
      reason: distance < 1000 ? "Closest grocery" : "Nearby grocery",
      priority: 10,
    }));
  
  // Fallback if no nearby spots found
  const grocerySpots = groceryByDistance.length > 0 
    ? groceryByDistance 
    : scoreSpotsByCategory(["grocery"]).slice(0, 1);
    
  const wellnessSpots = [...gymSpots, ...grocerySpots];

  return {
    workSpots,
    foodCoffeeSpots,
    wellnessSpots,
  };
}

// Find time gaps in a day's schedule
export function findTimeGaps(
  classes: ClassSession[],
  day: ClassSession["day"],
  dayStartTime = "08:00",
  dayEndTime = "22:00"
): TimeGap[] {
  const dayClasses = classes
    .filter((c) => c.day === day)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (dayClasses.length === 0) {
    // No classes - whole day is free
    return [{
      day,
      startTime: dayStartTime,
      endTime: dayEndTime,
      durationMinutes: timeToMinutes(dayEndTime) - timeToMinutes(dayStartTime),
      nearestBuilding: "DC", // Default to DC
    }];
  }

  const gaps: TimeGap[] = [];
  const dayStart = timeToMinutes(dayStartTime);
  const dayEnd = timeToMinutes(dayEndTime);

  // Gap before first class
  const firstClass = dayClasses[0];
  const firstClassStart = timeToMinutes(firstClass.startTime);
  if (firstClassStart - dayStart >= 30) {
    gaps.push({
      day,
      startTime: dayStartTime,
      endTime: firstClass.startTime,
      durationMinutes: firstClassStart - dayStart,
      afterClass: firstClass,
      nearestBuilding: firstClass.building,
    });
  }

  // Gaps between classes
  for (let i = 0; i < dayClasses.length - 1; i++) {
    const currentClass = dayClasses[i];
    const nextClass = dayClasses[i + 1];
    const currentEnd = timeToMinutes(currentClass.endTime);
    const nextStart = timeToMinutes(nextClass.startTime);
    const gapDuration = nextStart - currentEnd;

    if (gapDuration >= 15) {
      gaps.push({
        day,
        startTime: currentClass.endTime,
        endTime: nextClass.startTime,
        durationMinutes: gapDuration,
        beforeClass: currentClass,
        afterClass: nextClass,
        nearestBuilding: currentClass.building, // Stay near where you were
      });
    }
  }

  // Gap after last class
  const lastClass = dayClasses[dayClasses.length - 1];
  const lastClassEnd = timeToMinutes(lastClass.endTime);
  if (dayEnd - lastClassEnd >= 30) {
    gaps.push({
      day,
      startTime: lastClass.endTime,
      endTime: dayEndTime,
      durationMinutes: dayEnd - lastClassEnd,
      beforeClass: lastClass,
      nearestBuilding: lastClass.building,
    });
  }

  return gaps;
}

// Get a smart description for a gap
export function getGapDescription(gap: TimeGap): string {
  const hours = Math.floor(gap.durationMinutes / 60);
  const minutes = gap.durationMinutes % 60;
  
  let duration = "";
  if (hours > 0 && minutes > 0) {
    duration = `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    duration = `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    duration = `${minutes} min`;
  }

  if (gap.beforeClass && gap.afterClass) {
    return `${duration} break between ${gap.beforeClass.courseCode} and ${gap.afterClass.courseCode}`;
  } else if (gap.beforeClass) {
    return `${duration} free after ${gap.beforeClass.courseCode}`;
  } else if (gap.afterClass) {
    return `${duration} before ${gap.afterClass.courseCode}`;
  }
  
  return `${duration} free time`;
}
