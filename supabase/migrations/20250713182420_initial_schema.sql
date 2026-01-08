-- Complete schema for property randomizer
-- This creates all tables, enums, indexes, constraints, and RLS policies needed for the app

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS public.list_property_settings CASCADE;
DROP TABLE IF EXISTS public.user_options CASCADE;
DROP TABLE IF EXISTS public.numeric_property_settings CASCADE;
DROP TABLE IF EXISTS public.dimension_property_settings CASCADE;
DROP TABLE IF EXISTS public.text_property_settings CASCADE;
DROP TABLE IF EXISTS public.property_settings CASCADE;
DROP TABLE IF EXISTS public.presets CASCADE;

-- Drop existing types/enums
DROP TYPE IF EXISTS public.randomization_mode CASCADE;
DROP TYPE IF EXISTS public.post_randomization_sort_order CASCADE;
DROP TYPE IF EXISTS public.anchor_position CASCADE;
DROP TYPE IF EXISTS public.preset_visibility CASCADE;

-- Create enums first
CREATE TYPE public.anchor_position AS ENUM (
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
);

CREATE TYPE public.post_randomization_sort_order AS ENUM (
  'ascending',
  'descending',
  'none'
);

CREATE TYPE public.randomization_mode AS ENUM (
  'addition',
  'multiplication',
  'list',
  'range',
  'chatgpt'
);

CREATE TYPE public.preset_visibility AS ENUM (
  'private',
  'public'
);

-- Create the presets table first (no dependencies)
CREATE TABLE public.presets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  figma_user_id text NOT NULL,
  label text NOT NULL,
  visibility preset_visibility NOT NULL DEFAULT 'private',
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT presets_pkey PRIMARY KEY (id),
  CONSTRAINT presets_figma_user_id_label_unique UNIQUE (figma_user_id, label)
);

-- Create the base property_settings table (depends on presets)
CREATE TABLE public.property_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,
  randomization_mode randomization_mode NOT NULL DEFAULT 'range',
  post_randomization_sort_order post_randomization_sort_order DEFAULT 'none',
  is_enabled boolean NOT NULL DEFAULT false,
  preset_id uuid,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT property_settings_preset_id_fkey FOREIGN KEY (preset_id) REFERENCES public.presets(id) ON DELETE CASCADE
);

-- Create the property type tables

-- Text property settings (for decimal_places, thousands_separator, prefix, suffix)
-- Only used for the 'text' property
CREATE TABLE public.text_property_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_setting_id uuid NOT NULL,
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
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_setting_id uuid NOT NULL,
  dimension text CHECK (dimension IN ('width', 'height')),
  anchor_position anchor_position,
  preserve_aspect_ratio boolean,
  CONSTRAINT dimension_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT dimension_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT dimension_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- Numeric property settings (for min, max, operator)
CREATE TABLE public.numeric_property_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_setting_id uuid NOT NULL,
  min numeric,
  max numeric,
  operator text CHECK (operator IN ('add', 'multiply')),
  CONSTRAINT numeric_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT numeric_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT numeric_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- List property settings (for list mode options stored as newline-separated text)
CREATE TABLE public.list_property_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_setting_id uuid NOT NULL,
  options text NOT NULL DEFAULT '',
  CONSTRAINT list_property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT list_property_settings_property_setting_id_fkey FOREIGN KEY (property_setting_id) REFERENCES public.property_settings(id) ON DELETE CASCADE,
  CONSTRAINT list_property_settings_property_setting_id_unique UNIQUE (property_setting_id)
);

-- User options table (for storing user preferences)
CREATE TABLE public.user_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  figma_user_id text NOT NULL,
  is_auto_scroll_enabled boolean NOT NULL DEFAULT false,
  is_grouped_by_status boolean NOT NULL DEFAULT false,
  is_grouped_by_type boolean NOT NULL DEFAULT false,
  is_light_mode boolean NOT NULL DEFAULT false,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_options_pkey PRIMARY KEY (id),
  CONSTRAINT user_options_figma_user_id_unique UNIQUE (figma_user_id)
);

-- Add indexes
CREATE INDEX idx_property_settings_preset_id ON public.property_settings(preset_id);
CREATE INDEX idx_presets_figma_user_id ON public.presets(figma_user_id);
CREATE INDEX idx_text_property_settings_property_setting_id ON public.text_property_settings(property_setting_id);
CREATE INDEX idx_dimension_property_settings_property_setting_id ON public.dimension_property_settings(property_setting_id);
CREATE INDEX idx_numeric_property_settings_property_setting_id ON public.numeric_property_settings(property_setting_id);
CREATE INDEX idx_list_property_settings_property_setting_id ON public.list_property_settings(property_setting_id);
CREATE INDEX idx_user_options_figma_user_id ON public.user_options(figma_user_id);

-- Enable RLS
ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.text_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dimension_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numeric_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_options ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for presets
-- Default preset is readable by everyone
-- User presets: Since we're not using Supabase Auth, RLS can't verify ownership
-- We'll rely on application-level security (service validates figma_user_id matches)
CREATE POLICY "Everyone can view default preset" ON public.presets
  FOR SELECT USING (figma_user_id = 'default');

CREATE POLICY "Users can view all presets" ON public.presets
  FOR SELECT USING (true);

CREATE POLICY "Users can insert presets" ON public.presets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update presets" ON public.presets
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete presets" ON public.presets
  FOR DELETE USING (true);

-- Add RLS policies for property_settings
-- Since we're not using Supabase Auth, allow all operations
-- Application code will validate ownership via figma_user_id
CREATE POLICY "Users can view property settings" ON public.property_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert property settings" ON public.property_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update property settings" ON public.property_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete property settings" ON public.property_settings
  FOR DELETE USING (true);

-- Add RLS policies for text_property_settings
-- Allow all operations - application code validates ownership
CREATE POLICY "Users can view text property settings" ON public.text_property_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert text property settings" ON public.text_property_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update text property settings" ON public.text_property_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete text property settings" ON public.text_property_settings
  FOR DELETE USING (true);

-- Add RLS policies for dimension_property_settings
-- Allow all operations - application code validates ownership
CREATE POLICY "Users can view dimension property settings" ON public.dimension_property_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert dimension property settings" ON public.dimension_property_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update dimension property settings" ON public.dimension_property_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete dimension property settings" ON public.dimension_property_settings
  FOR DELETE USING (true);

-- Add RLS policies for numeric_property_settings
-- Allow all operations - application code validates ownership
CREATE POLICY "Users can view numeric property settings" ON public.numeric_property_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert numeric property settings" ON public.numeric_property_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update numeric property settings" ON public.numeric_property_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete numeric property settings" ON public.numeric_property_settings
  FOR DELETE USING (true);

-- Add RLS policies for list_property_settings
-- Allow all operations - application code validates ownership
CREATE POLICY "Users can view list property settings" ON public.list_property_settings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert list property settings" ON public.list_property_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update list property settings" ON public.list_property_settings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete list property settings" ON public.list_property_settings
  FOR DELETE USING (true);

-- Add RLS policies for user_options
CREATE POLICY "Users can view their own options" ON public.user_options
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own options" ON public.user_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own options" ON public.user_options
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own options" ON public.user_options
  FOR DELETE USING (true);
