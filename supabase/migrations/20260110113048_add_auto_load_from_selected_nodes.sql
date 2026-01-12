-- Add is_auto_load_from_selected_nodes column to user_options table
ALTER TABLE public.user_options
ADD COLUMN IF NOT EXISTS is_auto_load_from_selected_nodes boolean NOT NULL DEFAULT false;
