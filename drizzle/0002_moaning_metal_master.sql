CREATE TABLE `secure_files` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`record_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`workspace` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`email` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`functions` text DEFAULT '[]' NOT NULL,
	`customers` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `members_workspace` ON `workspace_members` (`workspace`);