-- Migration: Refactor property_settings table to separate property type tables
-- This migration breaks out the mutually exclusive property types into their own tables

-- Step 1: Create the new property type tables

-- Text property settings (for decimal_places, thousands_separator, prefix, suffix)
CREATE TABLE public.text_property_settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_setting_id bigint NOT NULL,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  decimal_places smallint,
  thousands_separator text CHECK (length(thousands_separator) <= 50),
  prefix text CHECK (length(prefix) <= 50),
  suffix text CHECK (length(suffix) <= 50),
  CONSTRAINT text_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT text_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT text_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- Dimension property settings (for dimension, anchor_position, preserve_aspect_ratio)
CREATE TABLE public.dimension_property_settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_setting_id bigint NOT NULL,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  dimension text CHECK (dimension IN ('width', 'height')),
  anchor_position anchor_position,
  preserve_aspect_ratio boolean,
  CONSTRAINT dimension_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT dimension_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT dimension_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- Numeric property settings (for min, max, operator)
CREATE TABLE public.numeric_property_settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_setting_id bigint NOT NULL,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  min numeric,
  max numeric,
  operator text CHECK (operator IN ('add', 'multiply')),
  CONSTRAINT numeric_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT numeric_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT numeric_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- Step 2: Migrate existing data to the new tables
--
-- The following data migration is skipped for a fresh production DB
-- INSERT INTO public.text_property_settings (
--   property_setting_id,
--   date_created,
--   date_modified,
--   decimal_places,
--   thousands_separator,
--   prefix,
--   suffix
-- )
-- SELECT
--   id as property_setting_id,
--   date_created,
--   date_modified,
--   decimal_places,
--   thousands_separator,
--   prefix,
--   suffix
-- FROM public.property_settings
-- WHERE
--   decimal_places IS NOT NULL OR
--   thousands_separator IS NOT NULL OR
--   prefix IS NOT NULL OR
--   suffix IS NOT NULL;

-- Migrate dimension-related properties
-- INSERT INTO public.dimension_property_settings (
--   property_setting_id,
--   date_created,
--   date_modified,
--   anchor_position,
--   preserve_aspect_ratio
-- )
-- SELECT
--   id as property_setting_id,
--   date_created,
--   date_modified,
--   anchor_position,
--   preserve_aspect_ratio
-- FROM public.property_settings
-- WHERE
--   anchor_position IS NOT NULL OR
--   preserve_aspect_ratio IS NOT NULL;

-- Note: Numeric properties (min, max, operator) are not in the current schema
-- but we're creating the table structure for future use

-- Step 3: Remove the migrated columns from the original table

ALTER TABLE public.property_settings
  DROP COLUMN IF EXISTS decimal_places,
  DROP COLUMN IF EXISTS thousands_separator,
  DROP COLUMN IF EXISTS prefix,
  DROP COLUMN IF EXISTS suffix,
  DROP COLUMN IF EXISTS anchor_position,
  DROP COLUMN IF EXISTS preserve_aspect_ratio;

-- Step 4: Add indexes for better performance

CREATE INDEX idx_text_property_settings_property_setting_id ON public.text_property_settings(property_setting_id);
CREATE INDEX idx_dimension_property_settings_property_setting_id ON public.dimension_property_settings(property_setting_id);
CREATE INDEX idx_numeric_property_settings_property_setting_id ON public.numeric_property_settings(property_setting_id);

-- Step 5: Add RLS policies if needed (assuming RLS is enabled)
-- Note: Adjust these policies based on your actual RLS requirements

ALTER TABLE public.text_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dimension_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numeric_property_settings ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust as needed for your use case)
-- CREATE POLICY "Users can view their own text property settings" ON public.text_property_settings
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.property_settings ps
--       JOIN public.presets p ON ps.collection_id = p.id
--       WHERE ps.id = text_property_settings.property_setting_id
--       AND p.figma_user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can view their own dimension property settings" ON public.dimension_property_settings
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.property_settings ps
--       JOIN public.presets p ON ps.collection_id = p.id
--       WHERE ps.id = dimension_property_settings.property_setting_id
--       AND p.figma_user_id = auth.uid()
--     )
--   );

-- CREATE POLICY "Users can view their own numeric property settings" ON public.numeric_property_settings
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.property_settings ps
--       JOIN public.presets p ON ps.collection_id = p.id
--       WHERE ps.id = numeric_property_settings.property_setting_id
--       AND p.figma_user_id = auth.uid()
--     )
--   );
