// UW Buildings with approximate coordinates
export const uwBuildings = {
  "MC": { name: "Mathematics and Computer", lat: 43.4721, lng: -80.5440 },
  "DC": { name: "Davis Centre", lat: 43.4727, lng: -80.5422 },
  "E5": { name: "Engineering 5", lat: 43.4728, lng: -80.5398 },
  "E7": { name: "Engineering 7", lat: 43.4731, lng: -80.5388 },
  "QNC": { name: "Quantum Nano Centre", lat: 43.4713, lng: -80.5447 },
  "STC": { name: "Science Teaching Complex", lat: 43.4709, lng: -80.5418 },
  "PHY": { name: "Physics", lat: 43.4707, lng: -80.5434 },
  "AL": { name: "Arts Lecture Hall", lat: 43.4688, lng: -80.5428 },
  "HH": { name: "Hagey Hall", lat: 43.4679, lng: -80.5418 },
  "ML": { name: "Modern Languages", lat: 43.4688, lng: -80.5436 },
  "RCH": { name: "J.R. Chicken Engineering Building", lat: 43.4702, lng: -80.5407 },
  "DWE": { name: "Douglas Wright Engineering", lat: 43.4699, lng: -80.5395 },
  "CPH": { name: "Carl A. Pollock Hall", lat: 43.4704, lng: -80.5392 },
  "B1": { name: "Biology 1", lat: 43.4712, lng: -80.5466 },
  "B2": { name: "Biology 2", lat: 43.4715, lng: -80.5458 },
  "ESC": { name: "Earth Sciences & Chemistry", lat: 43.4713, lng: -80.5432 },
  "EV1": { name: "Environment 1", lat: 43.4681, lng: -80.5434 },
  "EV2": { name: "Environment 2", lat: 43.4683, lng: -80.5442 },
  "EV3": { name: "Environment 3", lat: 43.4678, lng: -80.5447 },
  "PAC": { name: "Physical Activities Complex", lat: 43.4722, lng: -80.5469 },
  "CIF": { name: "Columbia Icefield", lat: 43.4753, lng: -80.5490 },
  "BMH": { name: "B.C. Matthews Hall", lat: 43.4739, lng: -80.5459 },
  "PAS": { name: "Psychology, Anthropology, Sociology", lat: 43.4668, lng: -80.5425 },
  "M3": { name: "Mathematics 3", lat: 43.4730, lng: -80.5442 },
  "AHS": { name: "Applied Health Sciences", lat: 43.4743, lng: -80.5475 },
  "SJ1": { name: "St. Jerome's 1", lat: 43.4695, lng: -80.5465 },
  "REV": { name: "Ron Chicken Village", lat: 43.4706, lng: -80.5492 },
  "V1": { name: "Village 1", lat: 43.4718, lng: -80.5512 },
  "MKV": { name: "Mackenzie King Village", lat: 43.4710, lng: -80.5532 },
  "UWP": { name: "UW Place", lat: 43.4707, lng: -80.5355 },
} as const;

export type Building = keyof typeof uwBuildings;

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  type: "lecture" | "tutorial" | "lab" | "seminar";
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  startTime: string; // "09:30" format
  endTime: string;
  building: Building;
  room: string;
}

export interface UserSchedule {
  term: string; // e.g., "Winter 2026"
  classes: ClassSession[];
}

export interface TimeGap {
  day: ClassSession["day"];
  startTime: string;
  endTime: string;
  durationMinutes: number;
  beforeClass?: ClassSession;
  afterClass?: ClassSession;
  nearestBuilding?: Building;
}

export interface SpotSuggestion {
  spotId: string;
  reason: string;
  priority: number; // 1-10, higher is better match
}

export interface CategorizedSuggestions {
  workSpots: SpotSuggestion[];
  foodCoffeeSpots: SpotSuggestion[];
  wellnessSpots: SpotSuggestion[]; // gym + grocery
}

// Helper to parse time string to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper to convert minutes back to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Format time for display (12-hour format)
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Days for iteration
export const weekdays: ClassSession["day"][] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const dayLabels: Record<ClassSession["day"], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};
