-- Migration: Initial schema setup
-- This migration creates the base tables needed for the property randomizer

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

-- Create the presets table first (no dependencies)
CREATE TABLE public.presets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  figma_user_id text NOT NULL,
  label text NOT NULL,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT presets_pkey PRIMARY KEY (id)
);

-- Create the base property_settings table (depends on presets)
CREATE TABLE public.property_settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  label text NOT NULL,
  randomization_mode randomization_mode NOT NULL DEFAULT 'range',
  post_randomization_sort_order post_randomization_sort_order DEFAULT 'none',
  is_enabled boolean NOT NULL DEFAULT false,
  collection_id bigint,
  date_created timestamp with time zone NOT NULL DEFAULT now(),
  date_modified timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT property_settings_pkey PRIMARY KEY (id),
  CONSTRAINT property_settings_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.presets(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_property_settings_collection_id ON public.property_settings(collection_id);
CREATE INDEX idx_presets_figma_user_id ON public.presets(figma_user_id);

-- Enable RLS
ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for presets
CREATE POLICY "Users can view their own presets" ON public.presets
  FOR SELECT USING (figma_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own presets" ON public.presets
  FOR INSERT WITH CHECK (figma_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own presets" ON public.presets
  FOR UPDATE USING (figma_user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own presets" ON public.presets
  FOR DELETE USING (figma_user_id = auth.uid()::text);

-- Add RLS policies for property_settings
CREATE POLICY "Users can view property settings for their presets" ON public.property_settings
  FOR SELECT USING (
    collection_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.presets p
      WHERE p.id = property_settings.collection_id
      AND p.figma_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert property settings for their presets" ON public.property_settings
  FOR INSERT WITH CHECK (
    collection_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.presets p
      WHERE p.id = property_settings.collection_id
      AND p.figma_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update property settings for their presets" ON public.property_settings
  FOR UPDATE USING (
    collection_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.presets p
      WHERE p.id = property_settings.collection_id
      AND p.figma_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete property settings for their presets" ON public.property_settings
  FOR DELETE USING (
    collection_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.presets p
      WHERE p.id = property_settings.collection_id
      AND p.figma_user_id = auth.uid()::text
    )
  );
