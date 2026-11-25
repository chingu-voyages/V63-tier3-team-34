CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"token" text NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "invitations_event_id_email_unique" UNIQUE("event_id","email")
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Written by hand: before the column goes, keep the guests of existing events as pending invitations.
INSERT INTO "invitations" ("event_id", "email", "token")
SELECT e."id", lower(btrim(g."email")), replace(gen_random_uuid()::text, '-', '')
FROM "events" e
CROSS JOIN LATERAL unnest(e."guest_emails") AS g("email")
WHERE btrim(g."email") <> ''
ON CONFLICT ("event_id", "email") DO NOTHING;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_emails";