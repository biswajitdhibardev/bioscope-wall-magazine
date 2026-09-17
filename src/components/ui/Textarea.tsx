import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, maxLength, value, defaultValue, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    
    // For character count, we need to track value if it's controlled, or just use the length
    const displayValue = value ?? defaultValue ?? '';
    const charCount = String(displayValue).length;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-[#fafafa]"
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-[#262626] bg-[#141414] px-3 py-2 text-sm text-[#fafafa] transition-colors',
            'placeholder:text-[#a3a3a3]',
            'focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]',
            className
          )}
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        <div className="mt-1.5 flex justify-between">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-[#ef4444]"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          {maxLength && (
            <div className="text-xs text-[#a3a3a3] pl-4 whitespace-nowrap">
              {charCount} / {maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
