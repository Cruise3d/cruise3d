import React from 'react';
import { clsx } from 'clsx';

export interface ColorOption {
  id: string;
  name: string;
  colorHex: string;
  materialName?: string;
}

export interface ColorSwatchPickerProps {
  options: ColorOption[];
  selectedId: string;
  onSelect: (option: ColorOption) => void;
  label?: string;
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  options,
  selectedId,
  onSelect,
  label = 'Material Finish',
}) => {
  const selectedOption = options.find((opt) => opt.id === selectedId) || options[0];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
        <span>{label}:</span>
        <span className="text-gray-900 font-bold">{selectedOption?.name}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {options.map((option) => {
          const isSelected = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option)}
              title={`${option.name} (${option.materialName || 'Finish'})`}
              className={clsx(
                'group relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer focus:outline-none',
                isSelected
                  ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                  : 'hover:scale-105 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
              )}
            >
              <span
                className="w-7 h-7 rounded-full border border-black/10 shadow-xs block"
                style={{ backgroundColor: option.colorHex }}
              />

              {/* Tooltip on Hover */}
              <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
