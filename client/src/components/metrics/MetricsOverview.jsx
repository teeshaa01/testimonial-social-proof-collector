import React from 'react';
import { Card } from '../ui/Card';
import { StarRating } from '../ui/StarRating';
import { Star, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export const MetricsOverview = ({ metrics }) => {
  if (!metrics) return null;

  const { totalReviews, averageRating, statusCounts, breakdown } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Average Rating Card */}
      <Card className="flex flex-col justify-between p-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Star Rating
          </span>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">
              {averageRating || '0.0'}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2">
            <StarRating value={Math.round(averageRating)} readOnly size="md" />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
          Calculated across {totalReviews} collected customer review{totalReviews === 1 ? '' : 's'}.
        </p>
      </Card>

      {/* Quick Status Stats Card */}
      <Card className="flex flex-col justify-between p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          Review Volume & Status
        </span>
        <div className="grid grid-cols-3 gap-3 my-auto">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="block text-2xl font-bold text-slate-900">{totalReviews}</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase">Total</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <span className="block text-2xl font-bold text-amber-700">
              {statusCounts?.pending || 0}
            </span>
            <span className="text-[11px] font-medium text-amber-600 uppercase">Pending</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="block text-2xl font-bold text-emerald-700">
              {statusCounts?.approved || 0}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 uppercase">Approved</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
          {statusCounts?.pending || 0} review{statusCounts?.pending === 1 ? '' : 's'} awaiting your moderation.
        </p>
      </Card>

      {/* Star Distribution Breakdown Card */}
      <Card className="p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">
          Rating Distribution
        </span>
        <div className="space-y-2">
          {(breakdown || []).map((item) => (
            <div key={item.stars} className="flex items-center gap-2 text-xs">
              <span className="w-6 font-semibold text-slate-600 flex items-center gap-0.5">
                {item.stars}
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right font-medium text-slate-500">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
