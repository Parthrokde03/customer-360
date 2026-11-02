CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`actor` text NOT NULL,
	`record_id` text NOT NULL,
	`operation` text NOT NULL,
	`details` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`kind` text NOT NULL,
	`customer_id` text,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `workspace_kind` ON `records` (`workspace`,`kind`);--> statement-breakpoint
CREATE INDEX `customer_records` ON `records` (`workspace`,`customer_id`);