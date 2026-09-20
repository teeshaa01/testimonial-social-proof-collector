import React from 'react';
import { Search, X, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TestimonialFilterBar = ({
  search,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = Boolean(search || ratingFilter);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Star Rating Filter */}
      <div className="flex items-center gap-1 w-full sm:w-auto">
        <select
          value={ratingFilter || ''}
          onChange={(e) => onRatingFilterChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4">4 Stars only</option>
          <option value="3">3 Stars only</option>
          <option value="2">2 Stars only</option>
          <option value="1">1 Star only</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline ml-1 shrink-0"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
