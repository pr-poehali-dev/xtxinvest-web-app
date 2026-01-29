-- Add is_virtual and currency columns to cards table
ALTER TABLE t_p46704143_xtxinvest_web_app.cards 
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'RUB';

-- Update existing cards to have proper values
UPDATE t_p46704143_xtxinvest_web_app.cards 
SET is_virtual = FALSE, currency = 'RUB' 
WHERE is_virtual IS NULL OR currency IS NULL;
