-- Add extras_pred column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS extras_pred jsonb DEFAULT '{}';

-- Add extras_real column to groups table  
ALTER TABLE groups ADD COLUMN IF NOT EXISTS extras_real jsonb DEFAULT '{}';
