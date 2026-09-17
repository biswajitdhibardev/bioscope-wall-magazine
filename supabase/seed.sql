-- Insert sample Exhibitions
INSERT INTO public.exhibitions (id, name, description, cover_image, start_date, end_date, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Echoes of Tomorrow', 'A vivid exploration of the future through abstract lenses and bold color structures. Engaging viewers in what is to come.', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800', '2026-09-01', '2026-10-31', true),
  ('22222222-2222-2222-2222-222222222222', 'Fragments of Light', 'A photographic and physical journey into lighting dynamics, shadows, and reflections that define our reality.', 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800', '2026-11-01', '2026-12-31', false);

-- Insert sample Artists
INSERT INTO public.artists (id, name, biography, profile_image, artistic_style, education, social_links)
VALUES
  ('33333333-3333-3333-3333-333333333331', 'Aria Chen', 'Aria Chen is a renowned abstract painter exploring emotional landscapes through fluid mechanics and color theory.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Abstract Expressionism', 'MFA from Royal College of Art', '{"instagram": "@ariachenart", "website": "ariachen.com"}'),
  ('33333333-3333-3333-3333-333333333332', 'Marcus Okafor', 'Marcus uses reclaimed materials to construct intricate, large-scale sculptures challenging modern consumerism.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Contemporary Sculpture', 'BFA from Rhode Island School of Design', '{"twitter": "@mokafor_art"}'),
  ('33333333-3333-3333-3333-333333333333', 'Elena Volkov', 'Elena is a digital artist bridging the gap between surrealism and classical painting techniques using modern tools.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Digital Surrealism', 'Self-taught', '{"portfolio": "elenavolkov.io"}'),
  ('33333333-3333-3333-3333-333333333334', 'Raj Patel', 'A street photographer focused on capturing split-second moments of humanity amidst architectural marvels.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Documentary Photography', 'BA in Photography from Parsons', '{"instagram": "@rajshoots"}'),
  ('33333333-3333-3333-3333-333333333335', 'Sofia Andersson', 'Mixing media from textiles to code, Sofia creates interactive pieces that respond to the viewer.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Interactive Mixed Media', 'MFA from Konstfack', '{"github": "sofia-andersson"}');

-- Insert sample Artworks
INSERT INTO public.artworks (id, exhibition_id, artist_id, title, description, medium, dimensions, year, category, image_url, is_published, display_order)
VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Crimson Flow', 'An exploration of passion and anger using deep reds and fluid motion.', 'Oil on Canvas', '120x150cm', 2025, 'Painting', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', true, 1),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Iron Giants', 'Reclaimed steel welded into a complex geometric pattern.', 'Steel and Wire', '200x100x100cm', 2026, 'Sculpture', 'https://images.unsplash.com/photo-1582561424760-0321d6df314a?w=800', true, 2),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Digital Dawn', 'A surreal sunrise breaking over a glitch-art landscape.', 'Digital Render', '4000x3000px', 2025, 'Digital Art', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', true, 3),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'Neon Silence', 'A solitary figure standing beneath a flickering neon sign in Tokyo.', 'Digital Photography', '24x36in', 2024, 'Photography', 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=800', true, 4),
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333335', 'Textile Memory', 'A fabric-based interactive piece that records touches.', 'Mixed Media', '100x100cm', 2026, 'Mixed Media', 'https://images.unsplash.com/photo-1601296200639-89349ce7e58b?w=800', true, 5),
  ('44444444-4444-4444-4444-444444444446', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333331', 'Azure Depth', 'Deep blues representing the ocean''s mystery.', 'Acrylic on Wood', '100x100cm', 2026, 'Painting', 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800', true, 6),
  ('44444444-4444-4444-4444-444444444447', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', 'Copper Winds', 'Wind chimes constructed from industrial copper piping.', 'Copper', '300x50x50cm', 2025, 'Sculpture', 'https://images.unsplash.com/photo-1544414981-d00e5da7f607?w=800', true, 7),
  ('44444444-4444-4444-4444-444444444448', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Neural Network', 'An AI-assisted generated visualization of synapses.', 'Generative Art', 'N/A', 2026, 'Digital Art', 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800', true, 8),
  ('44444444-4444-4444-4444-444444444449', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333334', 'Shadow Play', 'High contrast black and white study of architectural shadows.', 'Film Photography', '16x20in', 2023, 'Photography', 'https://images.unsplash.com/photo-1502219692488-87729f2705b1?w=800', true, 9),
  ('44444444-4444-4444-4444-444444444450', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333335', 'Luminous Threads', 'Fiber optics woven into traditional tapestry.', 'Mixed Media', '150x200cm', 2026, 'Mixed Media', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', true, 10);

-- Insert sample Ratings
INSERT INTO public.ratings (artwork_id, rating, feedback, reactions, anonymous_session_id)
VALUES
  ('44444444-4444-4444-4444-444444444441', 5, 'Absolutely breathtaking! The colors are incredibly vibrant.', '{"heart", "wow"}', 'session-101'),
  ('44444444-4444-4444-4444-444444444441', 4, 'Very evocative, though a bit dark for my taste.', '{"thoughtful"}', 'session-102'),
  ('44444444-4444-4444-4444-444444444442', 5, 'The scale of this sculpture is mind-blowing.', '{"wow"}', 'session-103'),
  ('44444444-4444-4444-4444-444444444442', 3, 'Interesting use of materials.', '{}', 'session-104'),
  ('44444444-4444-4444-4444-444444444443', 5, 'Perfect blend of surrealism and digital aesthetics.', '{"heart"}', 'session-105'),
  ('44444444-4444-4444-4444-444444444444', 4, 'Great composition and mood.', '{"clap"}', 'session-106'),
  ('44444444-4444-4444-4444-444444444444', 5, 'Captures the essence of the city perfectly.', '{"heart", "star"}', 'session-107'),
  ('44444444-4444-4444-4444-444444444445', 5, 'So unique how it responds to touch!', '{"wow"}', 'session-108'),
  ('44444444-4444-4444-4444-444444444446', 4, 'Beautifully calming piece.', '{"heart"}', 'session-109'),
  ('44444444-4444-4444-4444-444444444447', 4, 'Love the industrial vibe.', '{}', 'session-110'),
  ('44444444-4444-4444-4444-444444444448', 5, 'Generative art at its finest.', '{"wow", "mindblown"}', 'session-111'),
  ('44444444-4444-4444-4444-444444444448', 4, 'Fascinating concept.', '{}', 'session-112'),
  ('44444444-4444-4444-4444-444444444449', 5, 'The shadows are incredibly crisp.', '{"clap"}', 'session-113'),
  ('44444444-4444-4444-4444-444444444450', 5, 'Innovative use of fiber optics.', '{"star"}', 'session-114'),
  ('44444444-4444-4444-4444-444444444450', 4, 'Really cool texture and lighting.', '{"heart"}', 'session-115');

-- Insert sample QR Codes
INSERT INTO public.qr_codes (exhibition_id, artwork_id, label, target_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'Crimson Flow Display', 'https://bioscope.app/artworks/44444444-4444-4444-4444-444444444441'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444442', 'Iron Giants Display', 'https://bioscope.app/artworks/44444444-4444-4444-4444-444444444442');
