import { z } from "zod";
import { REACTION_OPTIONS } from "./types";
import { MAX_FEEDBACK_LENGTH, MAX_RATING, MIN_RATING } from "./constants";

// ─── Feedback Submission ───────────────────────

const feedbackFields = {
  artwork_id: z.string().uuid("Invalid artwork ID"),
  rating: z
    .number()
    .int()
    .min(MIN_RATING, `Rating must be at least ${MIN_RATING}`)
    .max(MAX_RATING, `Rating must be at most ${MAX_RATING}`),
  feedback: z
    .string()
    .max(MAX_FEEDBACK_LENGTH, `Feedback must be under ${MAX_FEEDBACK_LENGTH} characters`)
    .optional()
    .transform((val) => val?.trim() || undefined),
  reactions: z
    .array(z.enum(REACTION_OPTIONS))
    .optional(),
};

// Browser form schema: the anonymous session ID is created automatically
// by the client, so it must not be a required form field.
export const feedbackFormSchema = z.object(feedbackFields);
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

// Server schema: validates the complete payload received by the API.
export const feedbackSchema = z.object({
  ...feedbackFields,
  anonymous_session_id: z.string().min(1, "Session ID is required"),
});

// ─── Artwork Form ──────────────────────────────

export const artworkFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  medium: z.string().max(200).optional(),
  dimensions: z.string().max(200).optional(),
  year: z.coerce.number().int().min(1000).max(2100).nullable().optional(),
  category: z.string().max(100).optional(),
  artist_id: z.string().uuid("Select an artist").optional(),
  exhibition_id: z.string().uuid("Select an exhibition").optional(),
  is_published: z.boolean().default(false),
  image_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  audio_url: z.string().url().optional().or(z.literal("")),
});

export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

// ─── Artist Form ───────────────────────────────

export const artistFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  biography: z.string().max(10000).optional(),
  artistic_style: z.string().max(200).optional(),
  education: z.string().max(1000).optional(),
  profile_image: z.string().url().optional().or(z.literal("")),
  social_links: z
    .object({
      website: z.string().url().optional().or(z.literal("")),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      behance: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

export type ArtistFormValues = z.infer<typeof artistFormSchema>;

// ─── Exhibition Form ───────────────────────────

export const exhibitionFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  cover_image: z.string().url().optional().or(z.literal("")),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(false),
});

export type ExhibitionFormValues = z.infer<typeof exhibitionFormSchema>;

// ─── Login Form ────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
