-- Seed data for property settings
-- This creates the initial property configurations that all users will derive from
--
-- IMPORTANT: Run the schema migration file first (20250713182420_initial_schema.sql)
-- which will drop and recreate all tables. Then run this seed file to populate initial data.

-- Delete existing seed data (in reverse dependency order)
DELETE FROM public.list_property_settings;
DELETE FROM public.numeric_property_settings;
DELETE FROM public.dimension_property_settings;
DELETE FROM public.text_property_settings;
DELETE FROM public.property_settings WHERE preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default');
DELETE FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default';

-- Create default preset first
INSERT INTO public.presets (figma_user_id, label, visibility, date_created, date_modified)
VALUES ('default', '__default__', 'private', now(), now())
ON CONFLICT (figma_user_id, label) DO NOTHING;

-- Insert base property settings for all available properties, linked to default preset
INSERT INTO public.property_settings (label, randomization_mode, post_range_randomization_sort_order, post_list_randomization_sort_order, post_addition_randomization_sort_order, post_multiplication_randomization_sort_order, is_enabled, preset_id) VALUES
-- Special
('text', 'list', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Layout
('width', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('height', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('x', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('y', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('rotation', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Fill
('opacity', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillOpacity', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColor', 'list', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorRedChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorGreenChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorBlueChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorHue', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorSaturation', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('fillColorLightness', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Stroke
('strokeWeight', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeBottomWeight', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeTopWeight', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeLeftWeight', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeRightWeight', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColor', 'list', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorRedChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorGreenChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorBlueChannel', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorHue', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorSaturation', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeColorLightness', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('strokeOpacity', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Corners
('cornerRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('topLeftRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('topRightRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('bottomLeftRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('bottomRightRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('topRadii', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('rightRadii', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('bottomRadii', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('leftRadii', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Arc
('arcStartingAngle', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('arcEndingAngle', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('arcInnerRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Stars
('pointCount', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),
('innerRadius', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)),

-- Effects
('layerBlur', 'range', 'none', 'none', 'none', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1));

-- Insert text property settings ONLY for the 'text' property
-- Numeric properties don't need text_property_settings - their formatting is handled by hardcoded functions
INSERT INTO public.text_property_settings (property_setting_id, decimal_places, thousands_separator, prefix, suffix) VALUES
((SELECT id FROM public.property_settings WHERE label = 'text' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, ',', '', '');

-- Insert dimension property settings for layout properties
INSERT INTO public.dimension_property_settings (property_setting_id, dimension, anchor_position, preserve_aspect_ratio) VALUES
((SELECT id FROM public.property_settings WHERE label = 'width' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 'width', 'center-center', false),
((SELECT id FROM public.property_settings WHERE label = 'height' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 'height', 'center-center', false);

-- Insert numeric property settings for range-based properties
INSERT INTO public.numeric_property_settings (property_setting_id, min, max, operator) VALUES
-- Layout ranges
((SELECT id FROM public.property_settings WHERE label = 'width' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 10, 1000, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'height' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 10, 1000, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'x' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), -500, 500, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'y' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), -500, 500, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'rotation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), -180, 180, 'add'),

-- Fill ranges
((SELECT id FROM public.property_settings WHERE label = 'opacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillOpacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorRedChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorGreenChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorBlueChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorHue' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorSaturation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorLightness' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),

-- Stroke ranges
((SELECT id FROM public.property_settings WHERE label = 'strokeWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeBottomWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeTopWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeLeftWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeRightWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorRedChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorGreenChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorBlueChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorHue' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorSaturation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorLightness' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeOpacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),

-- Corner ranges
((SELECT id FROM public.property_settings WHERE label = 'cornerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topLeftRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topRightRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomLeftRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRightRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'rightRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'leftRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),

-- Arc ranges
((SELECT id FROM public.property_settings WHERE label = 'arcStartingAngle' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'arcEndingAngle' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'arcInnerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),

-- Star ranges
((SELECT id FROM public.property_settings WHERE label = 'pointCount' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 3, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'innerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add'),

-- Effects ranges
((SELECT id FROM public.property_settings WHERE label = 'layerBlur' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 0, 100, 'add');

-- Insert list property settings for all properties (defaults available when switching to list mode)
INSERT INTO public.list_property_settings (property_setting_id, options) VALUES
-- Text property - common strings
((SELECT id FROM public.property_settings WHERE label = 'text' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), 'Lorem
Ipsum
Dolor
Sit
Amet'),

-- Layout - rotation (degrees)
((SELECT id FROM public.property_settings WHERE label = 'rotation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
90
180
270'),

-- Fill - colors
((SELECT id FROM public.property_settings WHERE label = 'fillColor' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '#000000
#FFFFFF
#FF0000
#00FF00
#0000FF'),

-- Fill - opacity (percentages)
((SELECT id FROM public.property_settings WHERE label = 'opacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
25
50
75
100'),
((SELECT id FROM public.property_settings WHERE label = 'fillOpacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
25
50
75
100'),

-- Stroke - colors
((SELECT id FROM public.property_settings WHERE label = 'strokeColor' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '#000000
#FFFFFF
#FF0000
#00FF00
#0000FF'),

-- Stroke - opacity (percentages)
((SELECT id FROM public.property_settings WHERE label = 'strokeOpacity' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
25
50
75
100'),

-- Stroke - weights (common values)
((SELECT id FROM public.property_settings WHERE label = 'strokeWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeTopWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeBottomWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeLeftWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeRightWeight' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
1
2
4
8'),

-- Corners - radius (common values)
((SELECT id FROM public.property_settings WHERE label = 'cornerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topLeftRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topRightRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomLeftRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRightRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'rightRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'leftRadii' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
4
8
16
32'),

-- Arc - angles (degrees)
((SELECT id FROM public.property_settings WHERE label = 'arcStartingAngle' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
90
180
270
360'),
((SELECT id FROM public.property_settings WHERE label = 'arcEndingAngle' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
90
180
270
360'),

-- Arc - inner radius (percentages)
((SELECT id FROM public.property_settings WHERE label = 'arcInnerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
25
50
75
100'),

-- Stars - point count (common values)
((SELECT id FROM public.property_settings WHERE label = 'pointCount' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '3
4
5
6
8'),

-- Stars - inner radius (percentages)
((SELECT id FROM public.property_settings WHERE label = 'innerRadius' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
25
50
75
100'),

-- Effects - layer blur (common values)
((SELECT id FROM public.property_settings WHERE label = 'layerBlur' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
10
20
30
50'),

-- Layout - dimensions (common sizes)
((SELECT id FROM public.property_settings WHERE label = 'width' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '100
200
300
400
500'),
((SELECT id FROM public.property_settings WHERE label = 'height' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '100
200
300
400
500'),

-- Layout - positions (common offsets)
((SELECT id FROM public.property_settings WHERE label = 'x' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '-100
-50
0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'y' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '-100
-50
0
50
100'),

-- Color channels - RGB (common values)
((SELECT id FROM public.property_settings WHERE label = 'fillColorRedChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorGreenChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorBlueChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorRedChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorGreenChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorBlueChannel' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
128
255'),

-- Color channels - HSL (common values)
((SELECT id FROM public.property_settings WHERE label = 'fillColorHue' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
120
240
360'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorSaturation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorLightness' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorHue' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
120
240
360'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorSaturation' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorLightness' AND preset_id = (SELECT id FROM public.presets WHERE label = '__default__' AND figma_user_id = 'default' LIMIT 1)), '0
50
100');
