-- Seed data for property settings
-- This creates the initial property configurations that all users will derive from

-- Insert base property settings for all available properties
INSERT INTO public.property_settings (label, randomization_mode, post_randomization_sort_order, is_enabled) VALUES
-- Special
('text', 'list', 'none', false),

-- Layout
('width', 'range', 'none', false),
('height', 'range', 'none', false),
('x', 'range', 'none', false),
('y', 'range', 'none', false),
('rotation', 'range', 'none', false),

-- Fill
('opacity', 'range', 'none', false),
('fillOpacity', 'range', 'none', false),
('fillColor', 'list', 'none', false),
('fillColorRedChannel', 'range', 'none', false),
('fillColorGreenChannel', 'range', 'none', false),
('fillColorBlueChannel', 'range', 'none', false),
('fillColorHue', 'range', 'none', false),
('fillColorSaturation', 'range', 'none', false),
('fillColorLightness', 'range', 'none', false),

-- Stroke
('strokeWeight', 'range', 'none', false),
('strokeBottomWeight', 'range', 'none', false),
('strokeTopWeight', 'range', 'none', false),
('strokeLeftWeight', 'range', 'none', false),
('strokeRightWeight', 'range', 'none', false),
('strokeColor', 'list', 'none', false),
('strokeColorRedChannel', 'range', 'none', false),
('strokeColorGreenChannel', 'range', 'none', false),
('strokeColorBlueChannel', 'range', 'none', false),
('strokeColorHue', 'range', 'none', false),
('strokeColorSaturation', 'range', 'none', false),
('strokeColorLightness', 'range', 'none', false),
('strokeOpacity', 'range', 'none', false),

-- Corners
('cornerRadius', 'range', 'none', false),
('topLeftRadius', 'range', 'none', false),
('topRightRadius', 'range', 'none', false),
('bottomLeftRadius', 'range', 'none', false),
('bottomRightRadius', 'range', 'none', false),
('topRadii', 'range', 'none', false),
('rightRadii', 'range', 'none', false),
('bottomRadii', 'range', 'none', false),
('leftRadii', 'range', 'none', false),

-- Arc
('arcStartingAngle', 'range', 'none', false),
('arcEndingAngle', 'range', 'none', false),
('arcInnerRadius', 'range', 'none', false),

-- Stars
('pointCount', 'range', 'none', false),
('innerRadius', 'range', 'none', false);

-- Insert text property settings for properties that need text formatting
INSERT INTO public.text_property_settings (property_setting_id, decimal_places, thousands_separator, prefix, suffix) VALUES
-- Layout properties that might need formatting
((SELECT id FROM public.property_settings WHERE label = 'width'), 0, ',', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'height'), 0, ',', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'x'), 0, ',', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'y'), 0, ',', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'rotation'), 1, '', '', '°'),

-- Fill properties
((SELECT id FROM public.property_settings WHERE label = 'opacity'), 0, '', '', '%'),
((SELECT id FROM public.property_settings WHERE label = 'fillOpacity'), 0, '', '', '%'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorRedChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'fillColorGreenChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'fillColorBlueChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'fillColorHue'), 0, '', '', '°'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorSaturation'), 0, '', '', '%'),
((SELECT id FROM public.property_settings WHERE label = 'fillColorLightness'), 0, '', '', '%'),

-- Stroke properties
((SELECT id FROM public.property_settings WHERE label = 'strokeWeight'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'strokeBottomWeight'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'strokeTopWeight'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'strokeLeftWeight'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'strokeRightWeight'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorRedChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorGreenChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorBlueChannel'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorHue'), 0, '', '', '°'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorSaturation'), 0, '', '', '%'),
((SELECT id FROM public.property_settings WHERE label = 'strokeColorLightness'), 0, '', '', '%'),
((SELECT id FROM public.property_settings WHERE label = 'strokeOpacity'), 0, '', '', '%'),

-- Corner properties
((SELECT id FROM public.property_settings WHERE label = 'cornerRadius'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'topLeftRadius'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'topRightRadius'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'bottomLeftRadius'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRightRadius'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'topRadii'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'rightRadii'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'bottomRadii'), 0, '', '', 'px'),
((SELECT id FROM public.property_settings WHERE label = 'leftRadii'), 0, '', '', 'px'),

-- Arc properties
((SELECT id FROM public.property_settings WHERE label = 'arcStartingAngle'), 1, '', '', '°'),
((SELECT id FROM public.property_settings WHERE label = 'arcEndingAngle'), 1, '', '', '°'),
((SELECT id FROM public.property_settings WHERE label = 'arcInnerRadius'), 0, '', '', '%'),

-- Star properties
((SELECT id FROM public.property_settings WHERE label = 'pointCount'), 0, '', '', ''),
((SELECT id FROM public.property_settings WHERE label = 'innerRadius'), 0, '', '', '%');

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
