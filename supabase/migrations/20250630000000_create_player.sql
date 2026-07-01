-- Player table (matches prisma/schema.prisma)
CREATE TABLE IF NOT EXISTS "Player" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "capital" INTEGER NOT NULL DEFAULT 5000,
    "reputation" INTEGER NOT NULL DEFAULT 50,
    "laborPower" INTEGER NOT NULL DEFAULT 70,
    "scale" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PLAYING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- Auto-update updatedAt on row changes
CREATE OR REPLACE FUNCTION update_player_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS player_updated_at ON "Player";
CREATE TRIGGER player_updated_at
  BEFORE UPDATE ON "Player"
  FOR EACH ROW
  EXECUTE FUNCTION update_player_updated_at();

-- Expose table to Data API
GRANT SELECT, INSERT, UPDATE ON "Player" TO anon, authenticated;

-- RLS (public game — no auth required)
ALTER TABLE "Player" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_select_public" ON "Player";
CREATE POLICY "player_select_public" ON "Player"
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "player_insert_public" ON "Player";
CREATE POLICY "player_insert_public" ON "Player"
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "player_update_public" ON "Player";
CREATE POLICY "player_update_public" ON "Player"
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
