import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@/lib/ai/config";
import { Building, uwBuildings, ClassSession } from "@/lib/schedule/types";

// Map common building name variations to codes
const buildingAliases: Record<string, Building> = {
  "mathematics": "MC",
  "math": "MC",
  "mc": "MC",
  "davis": "DC",
  "dc": "DC",
  "engineering 5": "E5",
  "e5": "E5",
  "engineering 7": "E7",
  "e7": "E7",
  "quantum nano": "QNC",
  "qnc": "QNC",
  "science teaching": "STC",
  "stc": "STC",
  "physics": "PHY",
  "phy": "PHY",
  "arts lecture": "AL",
  "al": "AL",
  "hagey": "HH",
  "hh": "HH",
  "modern languages": "ML",
  "ml": "ML",
  "rch": "RCH",
  "dwe": "DWE",
  "cph": "CPH",
  "biology": "B1",
  "b1": "B1",
  "b2": "B2",
  "earth sciences": "ESC",
  "esc": "ESC",
  "environment": "EV1",
  "ev1": "EV1",
  "ev2": "EV2",
  "ev3": "EV3",
  "pac": "PAC",
  "cif": "CIF",
  "bmh": "BMH",
  "pas": "PAS",
  "m3": "M3",
  "ahs": "AHS",
};

function parseBuilding(buildingStr: string): Building {
  const lower = buildingStr.toLowerCase().trim();
  
  // Check aliases first
  if (buildingAliases[lower]) {
    return buildingAliases[lower];
  }
  
  // Check if it's a valid building code
  const upper = buildingStr.toUpperCase().trim();
  if (upper in uwBuildings) {
    return upper as Building;
  }
  
  // Default to MC if unknown
  return "MC";
}

function parseDay(dayStr: string): ClassSession["day"] | null {
  const lower = dayStr.toLowerCase().trim();
  if (lower.includes("mon") || lower === "m") return "monday";
  if (lower.includes("tue") || lower === "t") return "tuesday";
  if (lower.includes("wed") || lower === "w") return "wednesday";
  if (lower.includes("thu") || lower === "th" || lower === "r") return "thursday";
  if (lower.includes("fri") || lower === "f") return "friday";
  return null;
}

function parseClassType(typeStr: string): ClassSession["type"] {
  const lower = typeStr.toLowerCase();
  if (lower.includes("lec")) return "lecture";
  if (lower.includes("tut")) return "tutorial";
  if (lower.includes("lab")) return "lab";
  if (lower.includes("sem")) return "seminar";
  return "lecture";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/png";

    const systemPrompt = `You are a schedule parser for University of Waterloo students. Extract class information from schedule images/PDFs.

Return a JSON array of classes with this structure:
{
  "classes": [
    {
      "courseCode": "CS 246",
      "courseName": "Object-Oriented Software Development",
      "type": "lecture|tutorial|lab|seminar",
      "day": "monday|tuesday|wednesday|thursday|friday",
      "startTime": "09:30",
      "endTime": "10:20",
      "building": "MC",
      "room": "4020"
    }
  ]
}

Important:
- Use 24-hour time format (HH:MM)
- Building should be the code (MC, DC, E5, etc.)
- If a class meets multiple days, create separate entries for each day
- Course code format should be like "CS 246" or "MATH 239"
- Only include confirmed classes, not waitlisted
- Parse ALL visible classes in the schedule`;

    // Use GPT-4 Vision to parse the schedule
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Parse this UW schedule and extract all classes. Return only valid JSON."
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            }
          ]
        }
      ],
    });

    const content = text || "";
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Parse and validate
    const parsed = JSON.parse(jsonStr);
    const classes: Omit<ClassSession, "id">[] = [];
    
    for (const cls of parsed.classes || []) {
      const day = parseDay(cls.day);
      if (!day) continue;
      
      classes.push({
        courseCode: cls.courseCode?.toUpperCase() || "UNKNOWN",
        courseName: cls.courseName || "",
        type: parseClassType(cls.type || "lecture"),
        day,
        startTime: cls.startTime || "09:00",
        endTime: cls.endTime || "10:00",
        building: parseBuilding(cls.building || "MC"),
        room: cls.room || "",
      });
    }

    return NextResponse.json({ 
      success: true, 
      classes,
      message: `Found ${classes.length} classes`
    });

  } catch (error) {
    console.error("Schedule parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse schedule. Please try again or enter classes manually." },
      { status: 500 }
    );
  }
}
