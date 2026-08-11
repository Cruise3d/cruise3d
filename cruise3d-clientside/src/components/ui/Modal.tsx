import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { theme } from '../../styles/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  closeOnEsc = true,
}) => {
  const { colors, shadows } = theme;
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && overlayRef.current === e.target) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md w-full',
    md: 'max-w-lg w-full',
    lg: 'max-w-2xl w-full',
    xl: 'max-w-5xl w-full',
    full: 'max-w-[calc(100vw-2rem)] w-full h-[calc(100vh-2rem)]',
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        className={clsx(
          'flex flex-col rounded-xl border overflow-hidden transform transition-all duration-300 animate-scale-up',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: colors.surface.DEFAULT,
          borderColor: colors.border.DEFAULT,
          boxShadow: shadows.xl,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border.DEFAULT }}
        >
          {title ? (
            <h3 
              className="text-lg font-semibold leading-none"
              style={{ color: colors.text.primary }}
            >
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 cursor-pointer"
            style={{ color: colors.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.surface.low;
              e.currentTarget.style.color = colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.text.secondary;
            }}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-5 text-sm"
          style={{ color: colors.text.secondary }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div 
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{
              backgroundColor: colors.surface.low,
              borderColor: colors.border.DEFAULT,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};