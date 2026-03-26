-- ---------------------------
-- MODULE NAME: Blog System Functions
-- MODULE DATE: 20260313
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- ---------------------------
-- Update Updated At Function
-- ---------------------------
CREATE OR REPLACE FUNCTION public.update_blog_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_updated_at_column();

CREATE TRIGGER update_blog_topics_updated_at
    BEFORE UPDATE ON public.blog_topics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
    BEFORE UPDATE ON public.blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_updated_at_column();

-- ---------------------------
-- Slug Generation
-- ---------------------------
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title TEXT, table_name TEXT)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
    slug_exists BOOLEAN;
BEGIN
    -- Convert title to lowercase and replace spaces and special chars with hyphens
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\\s+', '-', 'g');
    new_slug := base_slug;
    
    -- Check if slug exists in the specified table
    LOOP
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
        INTO slug_exists
        USING new_slug;
        
        EXIT WHEN NOT slug_exists;
        
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::text;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------
-- Auto-generate Slugs
-- ---------------------------
CREATE OR REPLACE FUNCTION public.generate_post_slug()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := public.generate_unique_slug(NEW.title, 'blog_posts');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_post_slug
    BEFORE INSERT ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_post_slug();

CREATE OR REPLACE FUNCTION public.generate_topic_slug()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := public.generate_unique_slug(NEW.name, 'blog_topics');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_topic_slug
    BEFORE INSERT ON public.blog_topics
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_topic_slug();

-- ---------------------------
-- Reading Time Calculation
-- ---------------------------
CREATE OR REPLACE FUNCTION public.calculate_blog_reading_time()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    words_per_minute INTEGER := 200;
    word_count INTEGER;
BEGIN
    -- Count words in content (rough estimate)
    word_count := array_length(regexp_split_to_array(NEW.content, '\\s+'), 1);
    
    -- Calculate reading time in minutes (rounded up)
    NEW.reading_time_minutes := CEILING(word_count::float / words_per_minute);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reading_time
    BEFORE INSERT OR UPDATE OF content ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_blog_reading_time();

-- ---------------------------
-- Update Published At
-- ---------------------------
CREATE OR REPLACE FUNCTION public.update_blog_published_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin_approved AND NEW.is_user_published AND OLD.published_at IS NULL THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_published_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_published_at();

-- ---------------------------
-- Update View Count
-- ---------------------------
CREATE OR REPLACE FUNCTION public.increment_blog_view_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.activity_type = 'view' THEN
        UPDATE public.blog_posts
        SET view_count = view_count + 1
        WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_view_count
    AFTER INSERT ON public.blog_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_blog_view_count();

-- ---------------------------
-- Update Like Count
-- ---------------------------
CREATE OR REPLACE FUNCTION public.update_blog_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.activity_type = 'like') THEN
        UPDATE public.blog_posts
        SET like_count = like_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.activity_type = 'like') THEN
        UPDATE public.blog_posts
        SET like_count = GREATEST(like_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_blog_post_like_count_trigger ON public.blog_activities;
CREATE TRIGGER update_blog_post_like_count_trigger
  AFTER INSERT OR DELETE ON public.blog_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_post_like_count();

COMMIT;

