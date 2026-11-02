CREATE TABLE `delivery_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`email` text NOT NULL,
	`notification_id` text NOT NULL,
	`record_id` text NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text NOT NULL,
	`last_error` text,
	`created_at` text NOT NULL,
	`delivered_at` text
);
--> statement-breakpoint
CREATE INDEX `delivery_due` ON `delivery_outbox` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE `device_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`email` text NOT NULL,
	`workspace` text NOT NULL,
	`name` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_token` ON `device_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `workspace_jobs` (
	`workspace` text PRIMARY KEY NOT NULL,
	`last_run_at` text,
	`last_error` text
);
