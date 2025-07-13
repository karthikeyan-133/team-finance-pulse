-- Add partner status to shops table
ALTER TABLE public.shops 
ADD COLUMN is_partner boolean NOT NULL DEFAULT true;

-- Update existing shops to be partners by default
UPDATE public.shops SET is_partner = true WHERE is_partner IS NULL;