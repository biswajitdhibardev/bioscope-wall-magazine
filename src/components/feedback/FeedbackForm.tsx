'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { RatingStars } from './RatingStars';
import { ReactionButtons } from './ReactionButtons';
import { SuccessAnimation } from './SuccessAnimation';
import { useSessionId } from '@/hooks/useSessionId';
import { feedbackFormSchema, FeedbackFormValues } from '@/lib/validators';
import { MAX_FEEDBACK_LENGTH } from '@/lib/constants';

interface FeedbackFormProps {
  artworkId: string;
  artworkTitle: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ artworkId, artworkTitle, onSuccess }: FeedbackFormProps) {
  const sessionId = useSessionId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      artwork_id: artworkId,
      rating: 0,
      reactions: [],
      feedback: '',
    },
    mode: 'onChange'
  });

  const feedbackValue = watch('feedback') || '';
  const currentRating = watch('rating');

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsDuplicate(false);
    setErrorMsg(null);

    if (!sessionId) {
      setErrorMsg("Session initialization failed. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          anonymous_session_id: sessionId,
        }),
      });

      if (response.status === 201 || response.ok) {
        setShowSuccess(true);
        setIsSubmitted(true);
      } else if (response.status === 409) {
        setIsDuplicate(true);
      } else if (response.status === 429) {
        setErrorMsg("You're submitting feedback too quickly. Please try again later.");
      } else {
        let errData: { error?: string; details?: string; code?: string } = {};
        try {
          errData = await response.json();
        } catch {
          // Keep the generic message if the server did not return JSON.
        }
        const detail = errData.details ? ` (${errData.details})` : '';
        setErrorMsg((errData.error || "An error occurred while submitting. Please try again.") + detail);
      }
    } catch {
      setErrorMsg("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDuplicate) {
    return (
      <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-[#262626] text-center max-w-xl mx-auto">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-[#8b5cf6]" />
        </div>
        <h3 className="font-playfair text-xl text-[#fafafa] mb-2">Feedback Received</h3>
        <p className="text-[#a3a3a3] mb-6">
          You&apos;ve already shared your feedback for this artwork. Thank you for your contribution!
        </p>
        <Link
          href="/artworks"
          className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#262626] text-[#fafafa] hover:bg-[#404040] transition-colors font-medium min-h-[44px]"
        >
          Browse More Artworks
        </Link>
      </div>
    );
  }

  if (isSubmitted && !showSuccess) {
    return (
      <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-[#262626] text-center max-w-xl mx-auto">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-[#c9a84c]" />
        </div>
        <h3 className="font-playfair text-xl text-[#fafafa] mb-2">Feedback Submitted</h3>
        <p className="text-[#a3a3a3] mb-6">
          Your thoughts on &apos;{artworkTitle}&apos; have been successfully recorded.
        </p>
        <Link
          href="/artworks"
          className="inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#262626] text-[#fafafa] hover:bg-[#404040] transition-colors font-medium min-h-[44px]"
        >
          Browse More Artworks
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-[#262626] max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Rating Section */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#fafafa]">
                How would you rate this artwork? <span className="text-red-500">*</span>
              </label>
            </div>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <RatingStars 
                  value={field.value} 
                  onChange={field.onChange} 
                  size="lg" 
                  disabled={isSubmitting} 
                />
              )}
            />
            {errors.rating && (
              <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>
            )}
          </section>

          {/* Reactions Section */}
          <section className="space-y-3">
            <label className="text-sm font-medium text-[#fafafa]">
              What does this artwork make you feel? <span className="text-[#a3a3a3] text-xs font-normal">(Optional)</span>
            </label>
            <Controller
              name="reactions"
              control={control}
              render={({ field }) => (
                <ReactionButtons 
                  selected={field.value || []} 
                  onChange={field.onChange} 
                  disabled={isSubmitting} 
                />
              )}
            />
          </section>

          {/* Feedback Section */}
          <section className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label htmlFor="feedback" className="text-sm font-medium text-[#fafafa]">
                Share your thoughts <span className="text-[#a3a3a3] text-xs font-normal">(Optional)</span>
              </label>
              <span className={`text-xs ${feedbackValue.length > (MAX_FEEDBACK_LENGTH || 1000) ? 'text-red-500' : 'text-[#a3a3a3]'}`}>
                {feedbackValue.length} / {MAX_FEEDBACK_LENGTH || 1000}
              </span>
            </div>
            <textarea
              id="feedback"
              {...register('feedback')}
              disabled={isSubmitting}
              placeholder="What caught your eye? How did it make you feel?"
              className="w-full min-h-[120px] bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 text-[#fafafa] placeholder:text-[#525252] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] resize-y transition-all"
            />
            {errors.feedback && (
              <p className="text-red-500 text-xs mt-1">{errors.feedback.message}</p>
            )}
          </section>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || currentRating === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#d4b55c] text-black font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </form>
      </div>

      {showSuccess && (
        <SuccessAnimation 
          artworkTitle={artworkTitle} 
          onComplete={() => {
            setShowSuccess(false);
            if (onSuccess) onSuccess();
          }} 
        />
      )}
    </>
  );
}
