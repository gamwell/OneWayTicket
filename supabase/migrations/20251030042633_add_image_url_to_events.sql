/*
  # Add image support to events table

  1. Changes
    - Add `image_url` column to `events` table to store event cover images
    - Column is optional (nullable) to support existing events
    - Will be populated with themed Pexels images based on event categories

  2. Notes
    - Uses TEXT type for storing URLs
    - No default value to allow flexible image management
*/

ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
