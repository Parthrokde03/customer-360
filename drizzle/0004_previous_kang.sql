CREATE TABLE `domain_links` (
	`record_id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text,
	`feedback_id` text,
	`meeting_id` text,
	`owner_email` text,
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`customer_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`feedback_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`meeting_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`owner_email`) REFERENCES `workspace_members`(`email`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `domain_customer` ON `domain_links` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `domain_owner` ON `domain_links` (`workspace`,`owner_email`);