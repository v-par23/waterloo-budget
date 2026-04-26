"use client";

import { useState } from "react";
import { categoryConfig, Category } from "@/data/spots";

export default function SuggestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "" as Category | "",
    neighborhood: "",
    price: "",
    description: "",
    address: "",
    submitterName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - just show success message
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Suggest a Spot</h1>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
          <div className="text-4xl sm:text-5xl">🎉</div>
          <h2 className="text-lg sm:text-xl font-semibold text-green-800">Thanks for your suggestion!</h2>
          <p className="text-sm sm:text-base text-green-700 max-w-md mx-auto">
            Our team will review your submission. If other users also suggest this spot, 
            we&apos;ll prioritize adding it to WaterlooBudget.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                category: "",
                neighborhood: "",
                price: "",
                description: "",
                address: "",
                submitterName: "",
              });
            }}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Suggest Another Spot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Suggest a Spot</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          Know a budget-friendly spot in Waterloo that should be on our list? 
          Let us know! Suggestions will be reviewed by our team and added if recommended by others as well.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-xl">
        {/* Spot Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Spot Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Joe's Coffee Shop"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
          >
            <option value="">Select a category</option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.emoji} {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood */}
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
            Neighborhood / Area <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="neighborhood"
            required
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder="e.g., Uptown Waterloo, UW Campus"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Approximate Price
          </label>
          <input
            type="text"
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., ~$10, Free, $5-15"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Why is this spot great?
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What makes this spot budget-friendly or special?"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address (optional)
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g., 123 King St, Waterloo"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Submitter Name */}
        <div>
          <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name (optional)
          </label>
          <input
            type="text"
            id="submitterName"
            value={formData.submitterName}
            onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
            placeholder="For credit if we add your suggestion"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Submit Suggestion
        </button>

        <p className="text-xs text-gray-500 text-center">
          Submissions are reviewed by our team. Popular suggestions get added faster!
        </p>
      </form>
    </div>
  );
}
