'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validators';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const unauthorizedMsg =
    searchParams.get('error') === 'unauthorized'
      ? 'Your account is not an admin account. Ask the site owner to grant admin access.'
      : null;

  const displayedError =
    errorMsg ?? unauthorizedMsg;

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg(null);

    const supabase = createClient();

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      /*
       * Verify / bootstrap admin access
       */
      const ensureRes = await fetch(
        '/api/admin/ensure',
        {
          method: 'POST',
        }
      );

      if (!ensureRes.ok) {
        const result =
          await ensureRes
            .json()
            .catch(() => null);

        setErrorMsg(
          result?.error ||
            'Your account is not configured as an admin.'
        );

        return;
      }

      const redirectTo =
        searchParams.get('redirectTo') ||
        '/admin';

      router.push(redirectTo);
      router.refresh();

    } catch {
      setErrorMsg(
        'An unexpected error occurred.'
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/admin-bg-pattern.png')] bg-cover bg-center">

      <Card className="w-full max-w-md p-8 bg-[#141414] border-[#262626]">

        {/* Logo / Heading */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-serif text-[#fafafa] tracking-tight">
            Bioscope
          </h1>

          <p className="text-[#c9a84c] mt-2 font-medium">
            Admin Portal
          </p>

        </div>

        {/* Error */}
        {displayedError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-6">
            {displayedError}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* Email */}
          <div>
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Password */}
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Sign In */}
          <Button
            type="submit"
            variant="primary"
            className="w-full mt-6"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>

        </form>

      </Card>

    </div>
  );
}