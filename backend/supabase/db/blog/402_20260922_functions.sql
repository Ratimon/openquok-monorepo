-- ---------------------------
-- MODULE NAME: Blog System Functions
-- MODULE DATE: 20260922
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- Fix reading-time estimation (HTML-aware word count; skip when minutes are set explicitly).
CREATE OR REPLACE FUNCTION public.calculate_blog_reading_time()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    words_per_minute INTEGER := 200;
    stripped TEXT;
    word_count INTEGER;
BEGIN
    IF NEW.reading_time_minutes IS NOT NULL THEN
        RETURN NEW;
    END IF;

    stripped := regexp_replace(COALESCE(NEW.content, ''), '<[^>]*>', ' ', 'g');
    stripped := regexp_replace(stripped, E'\\s+', ' ', 'g');
    stripped := btrim(stripped);

    IF stripped = '' THEN
        NEW.reading_time_minutes := 1;
        RETURN NEW;
    END IF;

    word_count := array_length(
        regexp_split_to_array(stripped, '[[:space:]]+'),
        1
    );

    NEW.reading_time_minutes := GREATEST(
        1,
        CEILING(COALESCE(word_count, 0)::float / words_per_minute)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalculate stored reading times (previous trigger treated whole HTML as one token).
UPDATE public.blog_posts
SET reading_time_minutes = NULL
WHERE content IS NOT NULL;

UPDATE public.blog_posts
SET content = content
WHERE content IS NOT NULL;

COMMIT;
