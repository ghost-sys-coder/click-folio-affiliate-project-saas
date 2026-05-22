ALTER TABLE "link_clicks" ADD COLUMN IF NOT EXISTS "content" text;
ALTER TABLE "link_clicks" ADD COLUMN IF NOT EXISTS "term" text;
