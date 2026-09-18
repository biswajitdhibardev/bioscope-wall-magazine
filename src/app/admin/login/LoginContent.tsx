"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const redirectTo =
    searchParams.get("redirect") || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMsg(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#c9a84c]/10 blur-[120px]" />

        <div className="absolute bottom-[-180px] left-[-120px] h-[400px] w-[400px] rounded-full bg-[#c9a84c]/5 blur-[100px]" />

        <div className="absolute top-1/3 right-[-150px] h-[350px] w-[350px] rounded-full bg-[#c9a84c]/5 blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Login container */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a84c]/30 bg-[#141414] shadow-[0_0_35px_rgba(201,168,76,0.08)]">

            <LockKeyhole
              size={28}
              strokeWidth={1.7}
              className="text-[#c9a84c]"
            />

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Bioscope
          </h1>

          <div className="mt-2 flex items-center justify-center gap-2">

            <div className="h-px w-8 bg-[#c9a84c]/40" />

            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#c9a84c]">
              Admin Panel
            </span>

            <div className="h-px w-8 bg-[#c9a84c]/40" />

          </div>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#262626] bg-[#141414]/95 p-7 shadow-2xl backdrop-blur-xl sm:p-8">

          {/* Card heading */}
          <div className="mb-7">

            <div className="mb-2 flex items-center gap-2">

              <ShieldCheck
                size={18}
                className="text-[#c9a84c]"
              />

              <h2 className="text-xl font-semibold text-white">
                Welcome back
              </h2>

            </div>

            <p className="text-sm text-gray-500">
              Sign in to manage the Bioscope wall
              magazine.
            </p>

          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

              <p className="text-sm text-red-400">
                {errorMsg}
              </p>

            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className="w-full rounded-xl border border-[#262626] bg-[#0d0d0d] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20"
                />

              </div>

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full rounded-xl border border-[#262626] bg-[#0d0d0d] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 transition-colors hover:text-[#c9a84c]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a84c] px-4 py-3.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_8px_25px_rgba(201,168,76,0.12)] transition-all duration-300 hover:bg-[#d8b95e] hover:shadow-[0_8px_30px_rgba(201,168,76,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a]" />

                  Signing in...
                </>
              ) : (
                <>
                  Sign In

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </>
              )}

            </button>

          </form>

          {/* Footer */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#262626] pt-5">

            <LockKeyhole
              size={12}
              className="text-gray-600"
            />

            <p className="text-xs text-gray-600">
              Secure administrator access
            </p>

          </div>

        </div>

        {/* Bottom branding */}
        <p className="mt-6 text-center text-xs text-gray-700">
          Bioscope Wall Magazine
        </p>

      </div>

    </main>
  );
}