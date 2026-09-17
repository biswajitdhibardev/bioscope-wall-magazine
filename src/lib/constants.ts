export const SITE_NAME = "Bioscope Wall Magazine";
export const SITE_DESCRIPTION = "A curated digital art exhibition experience";
export const SITE_TAGLINE = "Where Art Meets the Digital Canvas";

export const MAX_RATING = 5;
export const MIN_RATING = 1;

export const MAX_FEEDBACK_LENGTH = 1000;
export const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_VIDEO = 100 * 1024 * 1024; // 100MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const STORAGE_BUCKETS = {
  artworks: "artworks",
  artists: "artists",
  exhibitions: "exhibitions",
} as const;

export const RATE_LIMIT_MAX_SUBMISSIONS = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/artworks" },
  { label: "Exhibitions", href: "/exhibitions" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Artworks", href: "/admin/artworks", icon: "Image" },
  { label: "Artists", href: "/admin/artists", icon: "Users" },
  { label: "Exhibitions", href: "/admin/exhibitions", icon: "Calendar" },
  { label: "Feedback", href: "/admin/feedback", icon: "MessageSquare" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "QR Codes", href: "/admin/qr-codes", icon: "QrCode" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;

export const ARTWORK_CATEGORIES = [
  "Drawing",
  "Writing",
  "Handcraft",
  "Photography",
] as const;