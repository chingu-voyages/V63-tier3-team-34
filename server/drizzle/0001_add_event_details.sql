ALTER TABLE "events" ADD COLUMN "event_type" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "guest_emails" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "max_guests" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "admission_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "rsvp_enabled" boolean DEFAULT true NOT NULL;