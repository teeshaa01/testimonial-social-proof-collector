import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import {
  Check,
  XCircle,
  Archive,
  Star,
  Heart,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const TestimonialCard = ({
  testimonial,
  onStatusChange,
  onToggleFeature,
  onToggleLike,
  onDelete
}) => {
  const {
    _id,
    clientName,
    companyRole,
    email,
    starRating,
    reviewText,
    avatarUrl,
    status,
    isFeatured,
    isLiked,
    submittedAt
  } = testimonial;

  const formattedDate = new Date(submittedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="flex flex-col justify-between hover:border-slate-300 transition-all p-5 shadow-sm">
      <div>
        {/* Top bar: Client Info & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={clientName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 w-full h-full flex items-center justify-center">
                  {getInitials(clientName)}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {clientName}
              </h4>
              {companyRole && (
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {companyRole}
                </p>
              )}
              <p className="text-[11px] text-slate-400 font-mono">{email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={status}>
              {status}
            </Badge>
            {isFeatured && (
              <Badge variant="featured" className="text-[10px]">
                <Sparkles className="w-2.5 h-2.5" />
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Star Rating */}
        {starRating > 0 && (
          <div className="mb-3">
            <StarRating value={starRating} readOnly size="sm" />
          </div>
        )}

        {/* Review text */}
        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 mb-4 whitespace-pre-line">
          "{reviewText}"
        </p>
      </div>

      {/* Footer controls: Moderation Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>

          <div className="flex items-center gap-1">
            {/* Heart / Liked button */}
            <button
              onClick={() => onToggleLike(_id)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isLiked
                  ? 'text-rose-500 bg-rose-50'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              )}
              title={isLiked ? 'Unlike review' : 'Like review'}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </button>

            {/* Featured button */}
            <button
              onClick={() => onToggleFeature(_id)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isFeatured
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-400 hover:text-purple-600 hover:bg-slate-100'
              )}
              title={isFeatured ? 'Unmark featured' : 'Mark as featured'}
            >
              <Star className={cn('w-4 h-4', isFeatured && 'fill-current')} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDelete(_id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status transition action buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <Button
            variant={status === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(_id, 'approved')}
            className={cn(
              'text-[11px] py-1 h-8',
              status === 'approved' && 'bg-emerald-600 hover:bg-emerald-700'
            )}
            disabled={status === 'approved'}
          >
            <Check className="w-3 h-3" />
            Approve
          </Button>

          <Button
            variant={status === 'rejected' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(_id, 'rejected')}
            className="text-[11px] py-1 h-8 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            disabled={status === 'rejected'}
          >
            <XCircle className="w-3 h-3" />
            Reject
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(_id, 'archived')}
            className={cn(
              'text-[11px] py-1 h-8 text-slate-600',
              status === 'archived' && 'bg-slate-200 text-slate-800'
            )}
            disabled={status === 'archived'}
          >
            <Archive className="w-3 h-3" />
            Archive
          </Button>
        </div>
      </div>
    </Card>
  );
};
