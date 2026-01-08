-- Update any existing __invisible__ presets to __local__
-- Run this in the Supabase SQL Editor if you have existing data

UPDATE public.presets
SET label = '__local__'
WHERE label = '__invisible__';
