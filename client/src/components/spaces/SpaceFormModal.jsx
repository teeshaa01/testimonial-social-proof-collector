import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { spaceApi } from '../../api/space.api';
import { useToast } from '../../context/ToastContext';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

export const SpaceFormModal = ({ isOpen, onClose, spaceToEdit, onSaved }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [headerTitle, setHeaderTitle] = useState('Share your experience with us');
  const [customMessage, setCustomMessage] = useState('Your feedback helps us continuously improve.');
  const [customPrompts, setCustomPrompts] = useState(
    'Who are you and what do you do?\nWhat specific problem did our product solve for you?\nWould you recommend us to others?'
  );
  const [mandatoryAvatarToggle, setMandatoryAvatarToggle] = useState(false);
  const [starRatingToggle, setStarRatingToggle] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { success } = useToast();

  useEffect(() => {
    if (spaceToEdit) {
      setName(spaceToEdit.name || '');
      setSlug(spaceToEdit.slug || '');
      setHeaderTitle(spaceToEdit.headerTitle || 'Share your experience with us');
      setCustomMessage(spaceToEdit.customMessage || '');
      setCustomPrompts(
        Array.isArray(spaceToEdit.customPrompts)
          ? spaceToEdit.customPrompts.join('\n')
          : spaceToEdit.customPrompts || ''
      );
      setMandatoryAvatarToggle(Boolean(spaceToEdit.mandatoryAvatarToggle));
      setStarRatingToggle(spaceToEdit.starRatingToggle !== false);
      setLogoPreview(spaceToEdit.brandLogo || '');
    } else {
      setName('');
      setSlug('');
      setHeaderTitle('Share your experience with us');
      setCustomMessage('Your feedback helps us continuously improve.');
      setCustomPrompts(
        'Who are you and what do you do?\nWhat specific problem did our product solve for you?\nWould you recommend us to others?'
      );
      setMandatoryAvatarToggle(false);
      setStarRatingToggle(true);
      setLogoFile(null);
      setLogoPreview('');
    }
    setErrorMsg('');
  }, [spaceToEdit, isOpen]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!spaceToEdit) {
      // Auto generate slug
      const generatedSlug = val
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Space name is required.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim());
      formData.append('headerTitle', headerTitle.trim());
      formData.append('customMessage', customMessage.trim());

      const promptsArray = customPrompts
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);
      formData.append('customPrompts', JSON.stringify(promptsArray));

      formData.append('mandatoryAvatarToggle', mandatoryAvatarToggle);
      formData.append('starRatingToggle', starRatingToggle);

      if (logoFile) {
        formData.append('brandLogo', logoFile);
      }

      if (spaceToEdit) {
        await spaceApi.update(spaceToEdit._id, formData);
        success('Space updated successfully!');
      } else {
        await spaceApi.create(formData);
        success('New space created successfully!');
      }

      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save space.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={spaceToEdit ? 'Edit Space' : 'Create New Testimonial Space'}
        description="Configure your public testimonial collection form and settings."
        className="max-w-xl"
      >
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Space Name"
              placeholder="e.g. Acme Corp Reviews"
              value={name}
              onChange={handleNameChange}
              required
            />
            <Input
              label="Public Slug / URL"
              placeholder="e.g. acme-corp"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText={`URL: /collect/${slug || 'slug'}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Brand Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {logoPreview ? 'Change Logo' : 'Upload Brand Logo'}
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
              </div>
            </div>
          </div>

          <Input
            label="Header Title (Shown to public)"
            placeholder="e.g. Share your experience with us"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />

          <Textarea
            label="Custom Welcome Message"
            rows={2}
            placeholder="A short message thanking your clients and guiding their feedback."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />

          <Textarea
            label="Custom Prompts (One question per line)"
            rows={3}
            placeholder="Questions or bullet prompts shown on the public collection form."
            value={customPrompts}
            onChange={(e) => setCustomPrompts(e.target.value)}
            helperText="These prompt questions guide clients on what to write about."
          />

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200/60">
            <Switch
              label="Mandatory Client Avatar"
              description="Require clients to upload a profile photo or avatar before submitting"
              checked={mandatoryAvatarToggle}
              onCheckedChange={setMandatoryAvatarToggle}
            />
            <Switch
              label="Enable Star Rating"
              description="Collect a 1 to 5 star rating alongside written review"
              checked={starRatingToggle}
              onCheckedChange={setStarRatingToggle}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="default" size="md" isLoading={isLoading}>
              {spaceToEdit ? 'Save Changes' : 'Create Space'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
