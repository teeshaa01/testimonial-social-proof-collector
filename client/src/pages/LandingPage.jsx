import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/ui/StarRating';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Share2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Star,
  Quote,
  Layers,
  BarChart3
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Technical Assessment Project • MERN Stack
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Collect Testimonials & Showcase{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Social Proof
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Create dedicated review spaces, collect client testimonials without requiring logins, moderate reviews with rich rating metrics, and generate responsive embeds.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-200">
                <span>Go to Spaces Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-200">
                  <span>Create Owner Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Owner Log In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Custom Spaces</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Generate unique URL spaces with custom prompts, optional or required client avatars, brand logos, and 1-5 star ratings.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Moderation & Metrics</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Approve, reject, or archive incoming reviews. Filter by star rating, search keywords, and view distribution metrics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Wall of Love & Embeds</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Publish responsive masonry walls of approved testimonials or copy iframe embed snippets in Grid, Carousel, and Badge modes.
            </p>
          </div>
        </div>

        {/* Assessment Requirements Summary Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-indigo-900 text-white text-left shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Security & Architecture
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">
                Pair-Token Authentication with Rotation
              </h3>
              <p className="text-xs text-indigo-200 mt-2 max-w-xl leading-relaxed">
                Short-lived 15-minute access JWTs paired with 7-day refresh JWTs stored in secure httpOnly cookies. Automatic rotation with token reuse detection protects all owner endpoints.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 text-xs font-medium text-indigo-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>15-min Access / 7-day Refresh Token</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>httpOnly SameSite Cookies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero login needed for clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
