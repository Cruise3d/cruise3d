import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface ProductGalleryProps {
  images: string[];
  title: string;
  badge?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  title,
  badge,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Main Image Display */}
      <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl bg-slate-50 border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] group">
        <img
          src={imageError[selectedIndex] ? fallbackImage : images[selectedIndex] || fallbackImage}
          alt={`${title} - view ${selectedIndex + 1}`}
          onError={() => setImageError((prev) => ({ ...prev, [selectedIndex]: true }))}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badge Overlay */}
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-gray-900/80 text-white backdrop-blur-xs">
              {badge}
            </span>
          </div>
        )}

        {/* Prev / Next Controls if multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Previous Image"
            >
              <span className="material-symbols-outlined text-[1.25rem]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Next Image"
            >
              <span className="material-symbols-outlined text-[1.25rem]">chevron_right</span>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={clsx(
                  'relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border-2 transition-all cursor-pointer flex-shrink-0',
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20'
                    : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'
                )}
              >
                <img
                  src={imageError[idx] ? fallbackImage : img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => setImageError((prev) => ({ ...prev, [idx]: true }))}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
