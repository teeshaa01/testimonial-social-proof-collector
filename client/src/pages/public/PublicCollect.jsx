import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../api/public.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { StarRating } from '../../components/ui/StarRating';
import { Card } from '../../components/ui/Card';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Image as ImageIcon,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PublicCollect = () => {
  const { spaceSlug } = useParams();

  const [space, setSpace] = useState(null);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);
  const [spaceError, setSpaceError] = useState('');

  // Form states
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchSpace = async () => {
      setIsLoadingSpace(true);
      try {
        const res = await publicApi.getSpace(spaceSlug);
        setSpace(res.data.space);
      } catch (err) {
        setSpaceError(err.response?.data?.message || 'Space not found.');
      } finally {
        setIsLoadingSpace(false);
      }
    };

    fetchSpace();
  }, [spaceSlug]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!clientName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setSubmitError('Please enter a review message of at least 5 characters.');
      return;
    }

    if (space?.mandatoryAvatarToggle && !avatarFile) {
      setSubmitError('This space requires a profile photo or avatar upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('clientName', clientName.trim());
      formData.append('email', email.trim());
      formData.append('companyRole', companyRole.trim());
      formData.append('reviewText', reviewText.trim());

      if (space?.starRatingToggle) {
        formData.append('starRating', starRating);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await publicApi.submitTestimonial(spaceSlug, formData);
      setIsSuccess(true);
      triggerConfetti();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSpace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading collection form...</p>
      </div>
    );
  }

  if (spaceError || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Space Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {spaceError || 'The testimonial collection form you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/">
            <Button variant="outline" size="md">
              Return Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Brand & Space Header */}
        <div className="text-center mb-8">
          {space.brandLogo ? (
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-white border border-slate-200/80 p-2 shadow-sm flex items-center justify-center overflow-hidden">
              <img src={space.brandLogo} alt={space.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-200">
              {space.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {space.headerTitle || space.name}
          </h1>
          {space.customMessage && (
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {space.customMessage}
            </p>
          )}
        </div>

        {/* Success Card */}
        {isSuccess ? (
          <Card className="p-8 text-center bg-white shadow-xl border-slate-200/80 rounded-3xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Thank You, {clientName}!
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Your testimonial has been submitted successfully to{' '}
              <span className="font-semibold text-slate-800">{space.name}</span>. We truly appreciate your feedback and support!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSuccess(false);
                  setReviewText('');
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
              >
                Submit Another Review
              </Button>
              <Link to={`/wall/${space.slug}`}>
                <Button variant="default" size="md" className="gap-1.5">
                  <Heart className="w-4 h-4 fill-white/20" />
                  <span>View Wall of Love</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="shadow-xl border-slate-200/80 bg-white rounded-3xl p-6 sm:p-8">
            {/* Custom Prompts Box if configured */}
            {space.customPrompts && space.customPrompts.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Questions to consider
                </div>
                <ul className="space-y-1.5 text-xs text-indigo-950/80 list-disc list-inside">
                  {space.customPrompts.map((prompt, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Picker (if enabled) */}
              {space.starRatingToggle && (
                <div className="text-center py-2 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Your Overall Rating
                  </label>
                  <StarRating
                    value={starRating}
                    onChange={setStarRating}
                    size="lg"
                    className="justify-center"
                  />
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {starRating} out of 5 stars
                  </p>
                </div>
              )}

              {/* Review Text */}
              <Textarea
                label="Your Testimonial"
                rows={4}
                placeholder="Share your experience, results achieved, or what you liked most..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                helperText="Minimum 5 characters"
              />

              {/* Client Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Alex Morgan"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
                <Input
                  label="Your Email"
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Company / Role (Optional)"
                placeholder="e.g. Head of Growth @ Acme"
                value={companyRole}
                onChange={(e) => setCompanyRole(e.target.value)}
              />

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Photo / Avatar {space.mandatoryAvatarToggle ? '(Required)' : '(Optional)'}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {avatarPreview ? 'Change Photo' : 'Upload Your Photo'}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full mt-4 text-base font-semibold shadow-lg shadow-indigo-200"
                isLoading={isSubmitting}
              >
                <span>Submit My Testimonial</span>
                <Sparkles className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Powered by <span className="font-semibold text-slate-600">Testimonial Collector</span> • Social Proof Platform
        </div>
      </div>
    </div>
  );
};
