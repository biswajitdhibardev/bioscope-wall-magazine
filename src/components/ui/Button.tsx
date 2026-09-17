import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#c9a84c] text-black hover:bg-[#d4b85c]',
        secondary: 'bg-[#8b5cf6] text-white hover:bg-[#9f79f8]',
        outline: 'border border-[#262626] bg-transparent hover:bg-[#1a1a1a] text-[#fafafa]',
        ghost: 'hover:bg-[#1a1a1a] text-[#fafafa]',
        danger: 'bg-[#ef4444] text-white hover:bg-[#f87171]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Alias for leftIcon */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // `icon` is a convenience alias for `leftIcon`
    const resolvedLeftIcon = leftIcon ?? icon;

    const content = (
      <>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && resolvedLeftIcon && <span className="mr-2">{resolvedLeftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (asChild) {
      // Render as the single child element (e.g. a Link), merging our classes/props onto it.
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-disabled={isLoading || disabled}
          {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}
        >
          {children}
        </Slot>
      );
    }

    // We only use Framer Motion whileTap if it's not a Slot, since Slot might complain about motion props
    const motionProps = { whileTap: { scale: 0.97 } };

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
