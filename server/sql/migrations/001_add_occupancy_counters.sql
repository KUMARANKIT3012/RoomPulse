BEGIN;

ALTER TABLE occupancy
  ADD COLUMN IF NOT EXISTS entered_count INTEGER;
ALTER TABLE occupancy
  ALTER COLUMN entered_count SET DEFAULT 0;
UPDATE occupancy
SET entered_count = 0
WHERE entered_count IS NULL;
ALTER TABLE occupancy
  ALTER COLUMN entered_count SET NOT NULL;

ALTER TABLE occupancy
  ADD COLUMN IF NOT EXISTS exited_count INTEGER;
ALTER TABLE occupancy
  ALTER COLUMN exited_count SET DEFAULT 0;
UPDATE occupancy
SET exited_count = 0
WHERE exited_count IS NULL;
ALTER TABLE occupancy
  ALTER COLUMN exited_count SET NOT NULL;

COMMIT;
