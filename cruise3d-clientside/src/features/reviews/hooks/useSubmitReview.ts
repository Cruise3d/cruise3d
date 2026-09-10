import { useState } from 'react';

import { createReview } from '../api';
import type { CreateReviewPayload, Review } from '../types';

interface ReviewError {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: unknown;
    };
  };
}

export interface UseSubmitReviewResult {
  submitReview: (payload: CreateReviewPayload) => Promise<Review | null>;
  isSubmitting: boolean;
  error: string | null;
  statusCode: number | null;
  reset: () => void;
}

function getErrorDetails(error: unknown): { message: string; statusCode: number | null } {
  const candidate = error as ReviewError;
  const responseMessage = candidate.response?.data?.message;

  if (responseMessage) {
    return { message: responseMessage, statusCode: candidate.response?.status ?? null };
  }

  if (candidate.message) {
    return { message: candidate.message, statusCode: candidate.response?.status ?? null };
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
      return { message, statusCode: null };
    }
  }

  return { message: 'Failed to submit your review.', statusCode: null };
}

export function useSubmitReview(): UseSubmitReviewResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const submitReview = async (payload: CreateReviewPayload): Promise<Review | null> => {
    setIsSubmitting(true);
    setError(null);
    setStatusCode(null);

    try {
      return await createReview(payload);
    } catch (err) {
      const details = getErrorDetails(err);
      setError(details.message);
      setStatusCode(details.statusCode);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setStatusCode(null);
  };

  return { submitReview, isSubmitting, error, statusCode, reset };
}