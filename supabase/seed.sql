-- Seed data for property settings
-- This creates the initial property configurations that all users will derive from
--
-- IMPORTANT: Run the schema migration file first (20250713182420_initial_schema.sql)
-- which will drop and recreate all tables. Then run this seed file to populate initial data.

-- Create default preset first
INSERT INTO public.presets (figma_user_id, label, visibility, date_created, date_modified)
VALUES ('default', '__default__', 'private', now(), now());

-- Insert base property settings for all available properties, linked to default preset
INSERT INTO public.property_settings (label, randomization_mode, post_randomization_sort_order, is_enabled, preset_id) VALUES
-- Special
('text', 'list', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Layout
('width', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('height', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('x', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('y', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('rotation', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Fill
('opacity', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillOpacity', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColor', 'list', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorRedChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorGreenChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorBlueChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorHue', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorSaturation', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('fillColorLightness', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Stroke
('strokeWeight', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeBottomWeight', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeTopWeight', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeLeftWeight', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeRightWeight', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColor', 'list', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorRedChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorGreenChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorBlueChannel', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorHue', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorSaturation', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeColorLightness', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('strokeOpacity', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Corners
('cornerRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('topLeftRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('topRightRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('bottomLeftRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('bottomRightRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('topRadii', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('rightRadii', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('bottomRadii', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('leftRadii', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Arc
('arcStartingAngle', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('arcEndingAngle', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('arcInnerRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),

-- Stars
('pointCount', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__')),
('innerRadius', 'range', 'none', false, (SELECT id FROM public.presets WHERE label = '__default__'));

-- Insert text property settings ONLY for the 'text' property
-- Numeric properties don't need text_property_settings - their formatting is handled by hardcoded functions
INSERT INTO public.text_property_settings (property_setting_id, decimal_places, thousands_separator, prefix, suffix) VALUES
((SELECT id FROM public.property_settings WHERE label = 'text'), 0, ',', '', '');

-- Insert dimension property settings for layout properties
INSERT INTO public.dimension_property_settings (property_setting_id, dimension, anchor_position, preserve_aspect_ratio) VALUES
((SELECT id FROM public.property_settings WHERE label = 'width'), 'width', 'center-center', false),
((SELECT id FROM public.property_settings WHERE label = 'height'), 'height', 'center-center', false);

-- Insert numeric property settings for range-based properties
INSERT INTO public.numeric_property_settings (property_setting_id, min, max, operator) VALUES
-- Layout ranges
((SELECT id FROM public.property_settings WHERE label = 'width'), 10, 1000, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'height'), 10, 1000, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'x'), -500, 500, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'y'), -500, 500, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'rotation'), -180, 180, 'add'),

-- Fill ranges
((SELECT id FROM public.property_settings WHERE label = 'opacity'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillOpacity'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorRedChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorGreenChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorBlueChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorHue'), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorSaturation'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorLightness'), 0, 100, 'add'),

-- Stroke ranges
((SELECT id FROM public.property_settings WHERE label = 'strokeWeight'), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeBottomWeight'), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeTopWeight'), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeLeftWeight'), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeRightWeight'), 0, 20, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorRedChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorGreenChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorBlueChannel'), 0, 255, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorHue'), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorSaturation'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorLightness'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'strokeOpacity'), 0, 100, 'add'),

-- Corner ranges
((SELECT id FROM public.property_settings WHERE label = 'cornerRadius'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topLeftRadius'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topRightRadius'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomLeftRadius'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRightRadius'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'topRadii'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'rightRadii'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRadii'), 0, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'leftRadii'), 0, 100, 'add'),

-- Arc ranges
((SELECT id FROM public.property_settings WHERE label = 'arcStartingAngle'), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'arcEndingAngle'), 0, 360, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'arcInnerRadius'), 0, 100, 'add'),

-- Star ranges
((SELECT id FROM public.property_settings WHERE label = 'pointCount'), 3, 100, 'add'),
((SELECT id FROM public.property_settings WHERE label = 'innerRadius'), 0, 100, 'add');

-- Insert list property settings for all properties (defaults available when switching to list mode)
INSERT INTO public.list_property_settings (property_setting_id, options) VALUES
-- Text property - common strings
((SELECT id FROM public.property_settings WHERE label = 'text'), 'Lorem
Ipsum
Dolor
Sit
Amet'),

-- Layout - rotation (degrees)
((SELECT id FROM public.property_settings WHERE label = 'rotation'), '0
90
180
270'),

-- Fill - colors
((SELECT id FROM public.property_settings WHERE label = 'fillColor'), '#000000
#FFFFFF
#FF0000
#00FF00
#0000FF'),

-- Fill - opacity (percentages)
((SELECT id FROM public.property_settings WHERE label = 'opacity'), '0
25
50
75
100'),
((SELECT id FROM public.property_settings WHERE label = 'fillOpacity'), '0
25
50
75
100'),

-- Stroke - colors
((SELECT id FROM public.property_settings WHERE label = 'strokeColor'), '#000000
#FFFFFF
#FF0000
#00FF00
#0000FF'),

-- Stroke - opacity (percentages)
((SELECT id FROM public.property_settings WHERE label = 'strokeOpacity'), '0
25
50
75
100'),

-- Stroke - weights (common values)
((SELECT id FROM public.property_settings WHERE label = 'strokeWeight'), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeTopWeight'), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeBottomWeight'), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeLeftWeight'), '0
1
2
4
8'),
((SELECT id FROM public.property_settings WHERE label = 'strokeRightWeight'), '0
1
2
4
8'),

-- Corners - radius (common values)
((SELECT id FROM public.property_settings WHERE label = 'cornerRadius'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topLeftRadius'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topRightRadius'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomLeftRadius'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRightRadius'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'topRadii'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'rightRadii'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRadii'), '0
4
8
16
32'),
((SELECT id FROM public.property_settings WHERE label = 'leftRadii'), '0
4
8
16
32'),

-- Arc - angles (degrees)
((SELECT id FROM public.property_settings WHERE label = 'arcStartingAngle'), '0
90
180
270
360'),
((SELECT id FROM public.property_settings WHERE label = 'arcEndingAngle'), '0
90
180
270
360'),

-- Arc - inner radius (percentages)
((SELECT id FROM public.property_settings WHERE label = 'arcInnerRadius'), '0
25
50
75
100'),

-- Stars - point count (common values)
((SELECT id FROM public.property_settings WHERE label = 'pointCount'), '3
4
5
6
8'),

-- Stars - inner radius (percentages)
((SELECT id FROM public.property_settings WHERE label = 'innerRadius'), '0
25
50
75
100'),

-- Layout - dimensions (common sizes)
((SELECT id FROM public.property_settings WHERE label = 'width'), '100
200
300
400
500'),
((SELECT id FROM public.property_settings WHERE label = 'height'), '100
200
300
400
500'),

-- Layout - positions (common offsets)
((SELECT id FROM public.property_settings WHERE label = 'x'), '-100
-50
0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'y'), '-100
-50
0
50
100'),

-- Color channels - RGB (common values)
((SELECT id FROM public.property_settings WHERE label = 'fillColorRedChannel'), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorGreenChannel'), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorBlueChannel'), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorRedChannel'), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorGreenChannel'), '0
128
255'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorBlueChannel'), '0
128
255'),

-- Color channels - HSL (common values)
((SELECT id FROM public.property_settings WHERE label = 'fillColorHue'), '0
120
240
360'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorSaturation'), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorLightness'), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorHue'), '0
120
240
360'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorSaturation'), '0
50
100'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorLightness'), '0
50
100');
