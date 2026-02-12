ALTER TABLE public.dimension_property_settings
  DROP CONSTRAINT IF EXISTS dimension_property_settings_dimension_check;

ALTER TABLE public.dimension_property_settings
  ADD CONSTRAINT dimension_property_settings_dimension_check
  CHECK (dimension IN ('width', 'height', 'rotation'));
