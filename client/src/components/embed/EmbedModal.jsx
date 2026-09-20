import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { Copy, Check, LayoutGrid, SlidersHorizontal, Award, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export const EmbedModal = ({ isOpen, onClose, space }) => {
  const [layout, setLayout] = useState('grid'); // grid, carousel, badge
  const [theme, setTheme] = useState('light'); // light, dark
  const [hasCopied, setHasCopied] = useState(false);

  const { success } = useToast();

  if (!space) return null;

  const collectorAppUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const embedUrl = `${collectorAppUrl}/embed/${space.slug}?layout=${layout}&theme=${theme}`;

  const iframeHeight = layout === 'badge' ? '120px' : layout === 'carousel' ? '380px' : '600px';

  const embedCode = `<iframe
  src="${embedUrl}"
  frameborder="0"
  scrolling="no"
  width="100%"
  height="${iframeHeight}"
  style="border: none; overflow: hidden; border-radius: 12px; width: 100%;"
  title="${space.name} Testimonials"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setHasCopied(true);
    success('Embed code copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title="Embed Generator"
        description="Configure and export interactive social proof widgets to embed on any website or landing page."
        className="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Layout selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Widget Layout
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all',
                    layout === 'grid'
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('carousel')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all',
                    layout === 'carousel'
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Carousel
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('badge')}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all',
                    layout === 'badge'
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  )}
                >
                  <Award className="w-4 h-4" />
                  Badge
                </button>
              </div>
            </div>

            {/* Theme selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all',
                    theme === 'light'
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  )}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400" />
                  Light Theme
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all',
                    theme === 'dark'
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                      : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-white'
                  )}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600" />
                  Dark Theme
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Interactive Live Preview
              </label>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Open in standalone window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div
              className={cn(
                'rounded-2xl border p-4 transition-colors duration-200 overflow-hidden',
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              )}
            >
              <iframe
                key={`${layout}-${theme}`}
                src={embedUrl}
                title="Widget Preview"
                className="w-full rounded-xl border-0"
                style={{ height: iframeHeight }}
              />
            </div>
          </div>

          {/* Copy-paste Code Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                HTML / Iframe Embed Code
              </label>
              <Button
                variant="default"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Embed Code</span>
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-900 text-indigo-300 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed select-all">
                {embedCode}
              </pre>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Paste this snippet anywhere in your website HTML, Webflow, WordPress, Shopify, or React application.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
