CREATE TABLE IF NOT EXISTS "generated_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "link_id" uuid NOT NULL REFERENCES "affiliate_links"("id"),
  "platform" text NOT NULL,
  "goal" text NOT NULL,
  "audience" text NOT NULL,
  "tone" text NOT NULL,
  "extra_context" text,
  "output_json" jsonb NOT NULL,
  "generated_text" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
