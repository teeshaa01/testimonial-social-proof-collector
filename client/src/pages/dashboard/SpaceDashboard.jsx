import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { spaceApi } from '../../api/space.api';
import { testimonialApi } from '../../api/testimonial.api';
import { MetricsOverview } from '../../components/metrics/MetricsOverview';
import { TestimonialFilterBar } from '../../components/testimonials/TestimonialFilterBar';
import { TestimonialCard } from '../../components/testimonials/TestimonialCard';
import { EmbedModal } from '../../components/embed/EmbedModal';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Share2,
  Code2,
  Heart,
  ExternalLink,
  Loader2,
  MessageSquareOff,
  Sparkles,
  Inbox
} from 'lucide-react';

export const SpaceDashboard = () => {
  const { id } = useParams();

  const [space, setSpace] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [statusTab, setStatusTab] = useState('all'); // all, pending, approved, archived
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Embed Modal state
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [spaceRes, metricsRes] = await Promise.all([
        spaceApi.getById(id),
        spaceApi.getMetrics(id)
      ]);
      setSpace(spaceRes.data.space);
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load space information.');
    }
  }, [id, error]);

  const fetchReviews = useCallback(async () => {
    try {
      const params = {};
      if (statusTab !== 'all') params.status = statusTab;
      if (search.trim()) params.search = search.trim();
      if (ratingFilter) params.rating = ratingFilter;

      const res = await testimonialApi.getBySpace(id, params);
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load testimonials.');
    } finally {
      setIsLoading(false);
    }
  }, [id, statusTab, search, ratingFilter, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Moderation handlers
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await testimonialApi.updateStatus(reviewId, newStatus);
      success(`Review status updated to ${newStatus}.`);
      fetchReviews();
      // Reload metrics
      const metricsRes = await spaceApi.getMetrics(id);
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update review status.');
    }
  };

  const handleToggleFeature = async (reviewId) => {
    try {
      const res = await testimonialApi.toggleFeature(reviewId);
      success(res.data.message);
      fetchReviews();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to toggle featured flag.');
    }
  };

  const handleToggleLike = async (reviewId) => {
    try {
      const res = await testimonialApi.toggleLike(reviewId);
      success(res.data.message);
      fetchReviews();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to toggle like flag.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this testimonial?')) {
      return;
    }
    try {
      await testimonialApi.delete(reviewId);
      success('Testimonial deleted.');
      fetchReviews();
      const metricsRes = await spaceApi.getMetrics(id);
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  if (isLoading && !space) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium text-slate-500">Loading space reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Spaces
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-indigo-600 shrink-0">
              {space?.brandLogo ? (
                <img src={space.brandLogo} alt={space.name} className="w-full h-full object-cover" />
              ) : (
                space?.name?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {space?.name}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                /collect/{space?.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmbedOpen(true)}
            className="gap-1.5 text-slate-700 bg-white shadow-sm"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>Embed Generator</span>
          </Button>

          <a
            href={`/collect/${space?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-slate-700 bg-white shadow-sm">
              <ExternalLink className="w-4 h-4" />
              <span>Public Form</span>
            </Button>
          </a>

          <a
            href={`/wall/${space?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="default" size="sm" className="gap-1.5 bg-indigo-600 shadow-sm">
              <Heart className="w-4 h-4 fill-white/20" />
              <span>Wall of Love</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="pt-8">
        <MetricsOverview metrics={metrics} />
      </div>

      {/* Moderation Controls & Filter Bar */}
      <div className="pt-4 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs: All, Pending, Approved, Archived */}
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({metrics?.totalReviews || 0})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({metrics?.statusCounts?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({metrics?.statusCounts?.approved || 0})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({metrics?.statusCounts?.archived || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search & Rating Filter Bar */}
        <TestimonialFilterBar
          search={search}
          onSearchChange={setSearch}
          ratingFilter={ratingFilter}
          onRatingFilterChange={setRatingFilter}
          onClearFilters={() => {
            setSearch('');
            setRatingFilter('');
          }}
        />
      </div>

      {/* Reviews Listing */}
      {testimonials.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquareOff className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No testimonials found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            {search || ratingFilter
              ? 'Try clearing your search or rating filters to view other reviews.'
              : `Share your public collection link (/collect/${space?.slug}) with your clients to start gathering social proof.`}
          </p>
          <a
            href={`/collect/${space?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Collection Form</span>
            </Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t._id}
              testimonial={t}
              onStatusChange={handleStatusChange}
              onToggleFeature={handleToggleFeature}
              onToggleLike={handleToggleLike}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}

      {/* Embed Generator Modal */}
      <EmbedModal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        space={space}
      />
    </div>
  );
};
