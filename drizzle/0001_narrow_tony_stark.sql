CREATE TABLE "encounters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"new_note_id" uuid NOT NULL,
	"old_note_id" uuid NOT NULL,
	"similarity" double precision NOT NULL,
	"selection_method" text DEFAULT 'pattern_top_1' NOT NULL,
	"shown_at" timestamp with time zone NOT NULL,
	"feedback" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_new_note_id_notes_id_fk" FOREIGN KEY ("new_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_old_note_id_notes_id_fk" FOREIGN KEY ("old_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;