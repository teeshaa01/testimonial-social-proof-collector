import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  ExternalLink,
  Copy,
  Settings,
  Trash2,
  Heart,
  Inbox,
  ArrowRight,
  Globe,
  Share2
} from 'lucide-react';

export const SpaceCard = ({ space, onEdit, onDelete }) => {
  const { success } = useToast();

  const publicCollectUrl = `${window.location.origin}/collect/${space.slug}`;
  const publicWallUrl = `${window.location.origin}/wall/${space.slug}`;

  const copyCollectLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(publicCollectUrl);
    success('Public collection link copied to clipboard!');
  };

  const copyWallLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(publicWallUrl);
    success('Wall of Love link copied to clipboard!');
  };

  return (
    <Card className="flex flex-col justify-between hover:border-indigo-200 transition-all hover:shadow-lg group">
      <div>
        {/* Header with Logo & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {space.brandLogo ? (
                <img
                  src={space.brandLogo}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-indigo-600">
                  {space.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {space.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                <span>/collect/{space.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(space)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit Space"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(space)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Space"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <div>
            <span className="block text-xl font-bold text-slate-900">
              {space.stats?.totalReviews || 0}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Reviews
            </span>
          </div>
          <div>
            <span className="block text-xl font-bold text-amber-600">
              {space.stats?.pendingReviews || 0}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Pending
            </span>
          </div>
        </div>

        {/* Space settings pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {space.mandatoryAvatarToggle && (
            <Badge variant="default" className="text-[10px]">
              Avatar Required
            </Badge>
          )}
          {space.starRatingToggle ? (
            <Badge variant="default" className="text-[10px]">
              5★ Enabled
            </Badge>
          ) : (
            <Badge variant="archived" className="text-[10px]">
              Text Only
            </Badge>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <Link to={`/dashboard/spaces/${space._id}`} className="w-full">
          <Button variant="default" size="sm" className="w-full justify-between">
            <span>Moderate Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyCollectLink}
            className="flex-1 text-xs gap-1.5 text-slate-600"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </Button>
          <a
            href={publicWallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-100"
            >
              <Heart className="w-3.5 h-3.5 fill-indigo-200" />
              <span>Wall of Love</span>
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
};
