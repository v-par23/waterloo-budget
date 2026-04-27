"use client";

import { useState, useRef } from "react";
import { useSchedule } from "@/components/ScheduleProvider";
import {
  ClassSession,
  Building,
  uwBuildings,
  weekdays,
  dayLabels,
  formatTime,
} from "@/lib/schedule/types";
import Link from "next/link";

const classTypes: ClassSession["type"][] = ["lecture", "tutorial", "lab", "seminar"];

// Generate time options (7:00 AM to 10:00 PM in 30-min increments)
const timeOptions: string[] = [];
for (let hour = 7; hour <= 22; hour++) {
  timeOptions.push(`${hour.toString().padStart(2, "0")}:00`);
  if (hour < 22) {
    timeOptions.push(`${hour.toString().padStart(2, "0")}:30`);
  }
}

export default function SchedulePage() {
  const { schedule, addClass, removeClass, loading } = useSchedule();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    type: "lecture" as ClassSession["type"],
    day: "monday" as ClassSession["day"],
    startTime: "09:30",
    endTime: "10:20",
    building: "MC" as Building,
    room: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload an image (PNG, JPG, WebP) or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 10MB");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/schedule/parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse schedule");
      }

      // Add all parsed classes
      let addedCount = 0;
      for (const cls of data.classes) {
        addClass(cls);
        addedCount++;
      }

      setUploadSuccess(`Successfully imported ${addedCount} classes!`);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to parse schedule");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClass(formData);
    setFormData({
      courseCode: "",
      courseName: "",
      type: "lecture",
      day: "monday",
      startTime: "09:30",
      endTime: "10:20",
      building: "MC",
      room: "",
    });
    setShowForm(false);
  };

  // Group classes by day
  const classesByDay = weekdays.reduce((acc, day) => {
    acc[day] = schedule.classes
      .filter((c) => c.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<ClassSession["day"], ClassSession[]>);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Schedule</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Add your classes to get personalized spot suggestions during breaks
          </p>
        </div>
        <div className="flex gap-2">
          {schedule.classes.length > 0 && (
            <Link
              href="/planner"
              className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base font-medium"
            >
              View Planner →
            </Link>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
          >
            + Add Class
          </button>
        </div>
      </div>

      {/* Upload Schedule Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Import from Quest</h3>
            <p className="text-sm text-blue-700 mb-3">
              Take a screenshot of your Quest schedule and upload it - we&apos;ll automatically extract your classes!
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="sr-only"
                />
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploading 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-blue-700 hover:bg-blue-100 border border-blue-300"
                }`}>
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Parsing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Screenshot
                    </>
                  )}
                </span>
              </label>
              <span className="text-xs text-blue-600">PNG, JPG, or PDF</span>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {uploadError}
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {uploadSuccess}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Class Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Add a Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., CS 246"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="e.g., Object-Oriented Software Development"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ClassSession["type"] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                >
                  {classTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value as ClassSession["day"] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {dayLabels[day]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Building & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                  <select
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value as Building })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                  >
                    {Object.entries(uwBuildings).map(([code, info]) => (
                      <option key={code} value={code}>
                        {code} - {info.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g., 2017"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Display */}
      {schedule.classes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center">
          <p className="text-gray-600 mb-2">No classes added yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Add your classes to get smart spot suggestions during your free time
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Your First Class
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {weekdays.map((day) => (
            <div key={day} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{dayLabels[day]}</h3>
              </div>
              {classesByDay[day].length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  No classes
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {classesByDay[day].map((classSession) => (
                    <div
                      key={classSession.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500 w-24">
                          {formatTime(classSession.startTime)} - {formatTime(classSession.endTime)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {classSession.courseCode}
                            {classSession.courseName && (
                              <span className="font-normal text-gray-500"> - {classSession.courseName}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {classSession.type.charAt(0).toUpperCase() + classSession.type.slice(1)} •{" "}
                            {classSession.building} {classSession.room}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeClass(classSession.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove class"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {schedule.classes.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-100">
          <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
            {schedule.classes.length} classes added
          </h3>
          <p className="text-sm text-green-700">
            Head to the <Link href="/planner" className="underline font-medium">Daily Planner</Link> to see
            personalized spot suggestions for your free time between classes!
          </p>
        </div>
      )}
    </div>
  );
}
