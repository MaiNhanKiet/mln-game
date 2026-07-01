-- Enable Supabase Realtime for Player table (INSERT/UPDATE/DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'Player'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Player";
  END IF;
END $$;
