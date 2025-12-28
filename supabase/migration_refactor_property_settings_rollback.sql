-- Rollback Migration: Revert property_settings table refactoring
-- This migration restores the original property_settings table structure

-- Step 1: Add back the columns to the original property_settings table

ALTER TABLE public.property_settings
  ADD COLUMN decimal_places smallint,
  ADD COLUMN thousands_separator text CHECK (length(thousands_separator) <= 50),
  ADD COLUMN prefix text CHECK (length(prefix) <= 50),
  ADD COLUMN suffix text CHECK (length(suffix) <= 50),
  ADD COLUMN anchor_position anchor_position,
  ADD COLUMN preserve_aspect_ratio boolean;

-- Step 2: Migrate data back from the new tables to the original table

-- Restore text-related properties
UPDATE public.property_settings
SET
  decimal_places = tps.decimal_places,
  thousands_separator = tps.thousands_separator,
  prefix = tps.prefix,
  suffix = tps.suffix
FROM public.text_property_settings tps
WHERE property_settings.id = tps.property_setting_id;

-- Restore dimension-related properties
UPDATE public.property_settings
SET
  anchor_position = dps.anchor_position,
  preserve_aspect_ratio = dps.preserve_aspect_ratio
FROM public.dimension_property_settings dps
WHERE property_settings.id = dps.property_setting_id;

-- Step 3: Drop the new tables

DROP TABLE IF EXISTS public.numeric_property_settings;
DROP TABLE IF EXISTS public.dimension_property_settings;
DROP TABLE IF EXISTS public.text_property_settings;
