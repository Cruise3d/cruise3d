import React from 'react';
import type { ProductFilterState } from '../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../styles/theme';

export interface ProductFiltersProps {
  filters: ProductFilterState;
  categories: string[];
  materials: string[];
  technologies: string[];
  onFilterChange: (newFilters: ProductFilterState) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  materials,
  technologies,
  onFilterChange,
  onResetFilters,
}) => {
  const { colors, shadows } = theme;

  const handleCategoryClick = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const handleMaterialToggle = (material: string) => {
    const exists = filters.materials.includes(material);
    const updated = exists
      ? filters.materials.filter((m) => m !== material)
      : [...filters.materials, material];
    onFilterChange({ ...filters, materials: updated });
  };

  const handleTechnologyToggle = (tech: string) => {
    const exists = filters.technologies.includes(tech);
    const updated = exists
      ? filters.technologies.filter((t) => t !== tech)
      : [...filters.technologies, tech];
    onFilterChange({ ...filters, technologies: updated });
  };

  return (
    <aside 
      className="w-full space-y-8 p-6 rounded-2xl border"
      style={{
        backgroundColor: colors.background.DEFAULT, // Using background.DEFAULT (#f0f0f0)
        borderColor: colors.border.DEFAULT,
        boxShadow: shadows.DEFAULT,
      }}
    >
      {/* Header & Reset */}
      <div 
        className="flex items-center justify-between pb-4"
        style={{ borderBottom: `1px solid ${colors.border.DEFAULT}` }}
      >
        <h3 
          className="font-semibold flex items-center gap-2"
          style={{ color: colors.text.primary }}
        >
          <span 
            className="material-symbols-outlined text-[1.2rem]"
            style={{ color: colors.text.primary }}
          >
            tune
          </span>
          Filter Products
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetFilters} 
          className="text-xs"
          style={{ color: colors.text.secondary }}
        >
          Reset All
        </Button>
      </div>

      {/* Category Pills */}
      <div>
        <h4 
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: colors.text.tertiary }}
        >
          Category
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? colors.primary.DEFAULT : colors.surface.DEFAULT,
                  color: active ? colors.text.inverted : colors.text.secondary,
                  boxShadow: active ? shadows.sm : 'none',
                  border: active ? `1px solid ${colors.primary.DEFAULT}` : `1px solid ${colors.border.light}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.surface.high;
                    e.currentTarget.style.color = colors.text.primary;
                    e.currentTarget.style.borderColor = colors.border.DEFAULT;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = colors.surface.DEFAULT;
                    e.currentTarget.style.color = colors.text.secondary;
                    e.currentTarget.style.borderColor = colors.border.light;
                  }
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Technology Filter */}
      <div>
        <h4 
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: colors.text.tertiary }}
        >
          Manufacturing Tech
        </h4>
        <div className="space-y-2">
          {technologies.map((tech) => {
            const checked = filters.technologies.includes(tech);
            return (
              <label 
                key={tech} 
                className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
                style={{ color: colors.text.primary }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleTechnologyToggle(tech)}
                  className="w-4 h-4 rounded focus:ring-0"
                  style={{
                    accentColor: colors.primary.DEFAULT,
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: checked ? colors.primary.DEFAULT : colors.surface.DEFAULT,
                  }}
                />
                <span className="font-medium">{tech}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <h4 
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: colors.text.tertiary }}
        >
          Material Grade
        </h4>
        <div className="space-y-2">
          {materials.map((mat) => {
            const checked = filters.materials.includes(mat);
            return (
              <label 
                key={mat} 
                className="flex items-center gap-2.5 text-sm cursor-pointer select-none"
                style={{ color: colors.text.primary }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleMaterialToggle(mat)}
                  className="w-4 h-4 rounded focus:ring-0"
                  style={{
                    accentColor: colors.primary.DEFAULT,
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: checked ? colors.primary.DEFAULT : colors.surface.DEFAULT,
                  }}
                />
                <span>{mat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: colors.text.tertiary }}
        >
          Price Range ($)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, minPrice: Number(e.target.value) || 0 })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice === 10000 ? '' : filters.maxPrice}
            onChange={(e) =>
              onFilterChange({ ...filters, maxPrice: Number(e.target.value) || 10000 })
            }
          />
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div 
        className="pt-2"
        style={{ borderTop: `1px solid ${colors.border.DEFAULT}` }}
      >
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span 
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            In-Stock Items Only
          </span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, inStockOnly: e.target.checked })
            }
            className="w-4 h-4 rounded focus:ring-0"
            style={{
              accentColor: colors.primary.DEFAULT,
              borderColor: colors.border.DEFAULT,
              backgroundColor: filters.inStockOnly ? colors.primary.DEFAULT : colors.surface.DEFAULT,
            }}
          />
        </label>
      </div>
    </aside>
  );
};