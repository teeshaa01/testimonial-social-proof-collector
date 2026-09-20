import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../api/public.api';
import { StarRating } from '../../components/ui/StarRating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Heart,
  Sparkles,
  MessageSquarePlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const PublicWall = () => {
  const { spaceSlug } = useParams();

  const [space, setSpace] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchWall = async () => {
      setIsLoading(true);
      try {
        const res = await publicApi.getWall(spaceSlug);
        setSpace(res.data.space);
        setTestimonials(res.data.testimonials || []);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Wall of Love not found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWall();
  }, [spaceSlug]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium text-slate-500">Loading Wall of Love...</p>
      </div>
    );
  }

  if (errorMsg || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Space Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{errorMsg || 'Unable to display Wall of Love.'}</p>
          <Link to="/">
            <Button variant="outline" size="md">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            Wall of Love
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            {space.brandLogo && (
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm overflow-hidden flex items-center justify-center">
                <img src={space.brandLogo} alt={space.name} className="w-full h-full object-contain" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {space.name}
            </h1>
          </div>

          <p className="text-base text-slate-600 leading-relaxed mb-6">
            Real stories, reviews, and testimonials from our community and clients.
          </p>

          <Link to={`/collect/${space.slug}`}>
            <Button
              variant="default"
              size="md"
              className="gap-2 shadow-lg shadow-indigo-200"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a Testimonial</span>
            </Button>
          </Link>
        </div>

        {/* Masonry Testimonial Grid */}
        {testimonials.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No approved reviews yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Be the very first client to share your feedback!
            </p>
            <Link to={`/collect/${space.slug}`}>
              <Button variant="default" size="sm">
                Submit Testimonial
              </Button>
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className={cn(
                  'break-inside-avoid rounded-2xl bg-white p-6 border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                  t.isFeatured
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80'
                )}
              >
                {/* Top: Avatar, Name, Verified */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.clientName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-full h-full flex items-center justify-center">
                          {getInitials(t.clientName)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {t.clientName}
                      </h4>
                      {t.companyRole && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {t.companyRole}
                        </p>
                      )}
                    </div>
                  </div>

                  {t.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Rating */}
                {space.starRatingToggle && t.starRating && (
                  <div className="mb-3">
                    <StarRating value={t.starRating} readOnly size="sm" />
                  </div>
                )}

                {/* Review Message */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  "{t.reviewText}"
                </p>

                {/* Verified badge */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Verified Client
                  </span>
                  <span>
                    {new Date(t.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 text-center text-xs text-slate-400">
          Powered by <span className="font-semibold text-slate-600">Testimonial Collector</span> • Curated Social Proof
        </div>
      </div>
    </div>
  );
};
