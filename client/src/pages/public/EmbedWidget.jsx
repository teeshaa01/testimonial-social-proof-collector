import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { publicApi } from '../../api/public.api';
import { StarRating } from '../../components/ui/StarRating';
import { Star, ChevronLeft, ChevronRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const EmbedWidget = () => {
  const { spaceSlug } = useParams();
  const [searchParams] = useSearchParams();

  const layout = searchParams.get('layout') || 'grid'; // grid, carousel, badge
  const theme = searchParams.get('theme') || 'light'; // light, dark
  const collectorAppUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const [space, setSpace] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchEmbedData = async () => {
      try {
        const res = await publicApi.getWall(spaceSlug);
        setSpace(res.data.space);
        setTestimonials(res.data.testimonials || []);
      } catch (err) {
        console.error('Embed load error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmbedData();
  }, [spaceSlug]);

  const isDark = theme === 'dark';

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
      <div className={cn('p-4 text-center text-xs', isDark ? 'text-slate-400 bg-slate-950' : 'text-slate-500 bg-transparent')}>
        Loading testimonials...
      </div>
    );
  }

  if (!space || testimonials.length === 0) {
    return (
      <div className={cn('p-4 text-center text-xs rounded-xl border', isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500')}>
        No testimonials available yet.
      </div>
    );
  }

  // --- 1. BADGE LAYOUT ---
  if (layout === 'badge') {
    const averageRating = space.starRatingToggle
      ? (
          testimonials.reduce((acc, curr) => acc + curr.starRating, 0) / testimonials.length
        ).toFixed(1)
      : null;

    return (
      <div className={cn('p-2.5 font-sans', isDark ? 'bg-slate-950' : 'bg-transparent')}>
        <a
          href={`${collectorAppUrl}/wall/${space.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-sm transition-transform hover:scale-[1.02]',
            isDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          )}
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2 overflow-hidden">
            {testimonials.slice(0, 3).map((t, i) => (
              <div
                key={t._id || i}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center shrink-0"
              >
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.clientName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(t.clientName)
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {averageRating && <StarRating value={Math.round(averageRating)} readOnly size="sm" />}
              {averageRating && <span className="text-xs font-bold">{averageRating}</span>}
            </div>
            <span className={cn('text-[11px] font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Loved by {testimonials.length}+ happy clients
            </span>
          </div>
        </a>
      </div>
    );
  }

  // --- 2. CAROUSEL LAYOUT ---
  if (layout === 'carousel') {
    const current = testimonials[carouselIndex];

    const nextSlide = () => {
      setCarouselIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
      setCarouselIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
      <div className={cn('p-4 font-sans max-w-2xl mx-auto', isDark ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-900')}>
        <div
          className={cn(
            'relative rounded-2xl p-6 border shadow-sm transition-all',
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {current.avatarUrl ? (
                  <img src={current.avatarUrl} alt={current.clientName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-indigo-600">
                    {getInitials(current.clientName)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">{current.clientName}</h4>
                {current.companyRole && (
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {current.companyRole}
                  </p>
                )}
              </div>
            </div>

            {space.starRatingToggle && current.starRating && (
              <StarRating value={current.starRating} readOnly size="sm" />
            )}
          </div>

          <p className={cn('text-sm italic leading-relaxed mb-6', isDark ? 'text-slate-200' : 'text-slate-700')}>
            "{current.reviewText}"
          </p>

          {/* Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100/10">
            <span className="text-[11px] text-slate-400">
              {carouselIndex + 1} of {testimonials.length} reviews
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevSlide}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                )}
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className={cn(
                  'p-1.5 rounded-lg border transition-colors',
                  isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                )}
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. GRID LAYOUT (DEFAULT) ---
  return (
    <div className={cn('p-4 font-sans', isDark ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-900')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className={cn(
              'rounded-2xl p-5 border shadow-sm transition-all',
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-indigo-600">
                    {getInitials(t.clientName)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold truncate leading-tight">{t.clientName}</h4>
                {t.companyRole && (
                  <p className={cn('text-[11px] truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {t.companyRole}
                  </p>
                )}
              </div>
            </div>

            {space.starRatingToggle && t.starRating && (
              <div className="mb-2">
                <StarRating value={t.starRating} readOnly size="sm" />
              </div>
            )}

            <p className={cn('text-xs leading-relaxed line-clamp-4', isDark ? 'text-slate-300' : 'text-slate-600')}>
              "{t.reviewText}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
