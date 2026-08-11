import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { theme } from '../../styles/theme';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const { colors } = theme;

  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={clsx('flex items-center justify-center gap-1.5', className)}
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <span className="material-symbols-outlined text-[1.25rem] leading-none">
          chevron_left
        </span>
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className="inline-flex items-center justify-center w-8 h-8 text-sm select-none font-medium"
              style={{ color: colors.text.tertiary }}
            >
              &hellip;
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <Button
            key={`page-${page}`}
            variant={isCurrent ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(Number(page))}
            aria-current={isCurrent ? 'page' : undefined}
            className={clsx(
              'w-8 h-8 p-0 cursor-pointer text-sm font-medium'
            )}
            style={
              isCurrent
                ? {
                    backgroundColor: colors.primary.DEFAULT,
                    color: colors.text.inverted,
                    border: `1px solid ${colors.primary.DEFAULT}`,
                  }
                : undefined
            }
            onMouseEnter={(e) => {
              if (!isCurrent) {
                e.currentTarget.style.backgroundColor = colors.surface.low;
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrent) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = colors.border.DEFAULT;
              }
            }}
          >
            {page}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        <span className="material-symbols-outlined text-[1.25rem] leading-none">
          chevron_right
        </span>
      </Button>
    </nav>
  );
};