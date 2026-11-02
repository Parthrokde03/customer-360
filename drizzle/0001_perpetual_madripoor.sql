CREATE TABLE `action_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`action_id` text NOT NULL,
	`update_type` text NOT NULL,
	`previous_value` text,
	`new_value` text,
	`notes` text,
	`updated_by_id` text,
	`updated_by_name` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `action_updates_workspace_idx` ON `action_updates` (`workspace`);--> statement-breakpoint
CREATE INDEX `action_updates_action_idx` ON `action_updates` (`workspace`,`action_id`);--> statement-breakpoint
CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`feedback_id` text,
	`meeting_id` text,
	`action_number` text,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`owner_id` text,
	`owner_name` text NOT NULL,
	`owner_department` text,
	`assigned_by_id` text,
	`assigned_by_name` text,
	`priority` text DEFAULT 'Medium' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`due_date` text NOT NULL,
	`original_due_date` text,
	`completed_at` text,
	`delayed_at` text,
	`delay_reason` text,
	`estimated_effort` text,
	`actual_effort` text,
	`progress_percent` integer DEFAULT 0,
	`progress_notes` text,
	`closure_notes` text,
	`closure_evidence` text,
	`customer_confirmation_required` integer DEFAULT false,
	`customer_confirmed` integer DEFAULT false,
	`customer_confirmed_at` text,
	`customer_confirmed_by` text,
	`is_escalated` integer DEFAULT false,
	`escalated_at` text,
	`escalation_reason` text,
	`tags` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `actions_workspace_idx` ON `actions` (`workspace`);--> statement-breakpoint
CREATE INDEX `actions_customer_idx` ON `actions` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `actions_owner_idx` ON `actions` (`workspace`,`owner_id`);--> statement-breakpoint
CREATE INDEX `actions_status_idx` ON `actions` (`workspace`,`status`);--> statement-breakpoint
CREATE INDEX `actions_priority_idx` ON `actions` (`workspace`,`priority`);--> statement-breakpoint
CREATE INDEX `actions_due_date_idx` ON `actions` (`workspace`,`due_date`);--> statement-breakpoint
CREATE INDEX `actions_feedback_idx` ON `actions` (`workspace`,`feedback_id`);--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text,
	`file_size` integer,
	`mime_type` text,
	`storage_key` text,
	`storage_url` text,
	`description` text,
	`uploaded_by_id` text,
	`uploaded_by_name` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `attachments_workspace_idx` ON `attachments` (`workspace`);--> statement-breakpoint
CREATE INDEX `attachments_entity_idx` ON `attachments` (`workspace`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`actor_id` text NOT NULL,
	`actor_name` text,
	`actor_email` text,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`previous_state` text,
	`new_state` text,
	`changes` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_log_workspace_idx` ON `audit_log` (`workspace`);--> statement-breakpoint
CREATE INDEX `audit_log_entity_idx` ON `audit_log` (`workspace`,`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_log_actor_idx` ON `audit_log` (`workspace`,`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_log_date_idx` ON `audit_log` (`workspace`,`created_at`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`organization_id` text,
	`name` text NOT NULL,
	`code` text,
	`business_function` text NOT NULL,
	`location` text,
	`region` text,
	`relationship_owner_id` text,
	`relationship_owner_name` text,
	`primary_stakeholder_id` text,
	`current_sentiment` text DEFAULT 'Neutral',
	`previous_sentiment` text,
	`sentiment_changed_at` text,
	`criticality` text DEFAULT 'medium',
	`last_interaction_date` text,
	`last_interaction_type` text,
	`next_scheduled_meeting` text,
	`open_actions_count` integer DEFAULT 0,
	`overdue_actions_count` integer DEFAULT 0,
	`total_interactions` integer DEFAULT 0,
	`tags` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `customers_workspace_idx` ON `customers` (`workspace`);--> statement-breakpoint
CREATE INDEX `customers_function_idx` ON `customers` (`workspace`,`business_function`);--> statement-breakpoint
CREATE INDEX `customers_sentiment_idx` ON `customers` (`workspace`,`current_sentiment`);--> statement-breakpoint
CREATE INDEX `customers_owner_idx` ON `customers` (`workspace`,`relationship_owner_id`);--> statement-breakpoint
CREATE INDEX `customers_criticality_idx` ON `customers` (`workspace`,`criticality`);--> statement-breakpoint
CREATE INDEX `customers_org_idx` ON `customers` (`workspace`,`organization_id`);--> statement-breakpoint
CREATE TABLE `escalations` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`feedback_id` text,
	`action_id` text,
	`title` text NOT NULL,
	`description` text,
	`severity` text DEFAULT 'high' NOT NULL,
	`category` text,
	`status` text DEFAULT 'Open' NOT NULL,
	`escalated_by_id` text,
	`escalated_by_name` text,
	`assigned_to_id` text,
	`assigned_to_name` text,
	`target_resolution_date` text,
	`actual_resolution_date` text,
	`resolution_notes` text,
	`impact_description` text,
	`root_cause` text,
	`preventive_measures` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `escalations_workspace_idx` ON `escalations` (`workspace`);--> statement-breakpoint
CREATE INDEX `escalations_customer_idx` ON `escalations` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `escalations_status_idx` ON `escalations` (`workspace`,`status`);--> statement-breakpoint
CREATE INDEX `escalations_severity_idx` ON `escalations` (`workspace`,`severity`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`meeting_id` text,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'General' NOT NULL,
	`sentiment` text DEFAULT 'Neutral' NOT NULL,
	`priority` text DEFAULT 'medium',
	`source` text DEFAULT 'meeting',
	`source_reference` text,
	`themes` text,
	`is_sensitive` integer DEFAULT false,
	`requires_action` integer DEFAULT false,
	`linked_action_id` text,
	`status` text DEFAULT 'Open',
	`acknowledged_at` text,
	`acknowledged_by` text,
	`resolved_at` text,
	`resolution_notes` text,
	`captured_by_id` text,
	`captured_by_name` text,
	`feedback_date` text NOT NULL,
	`is_recurring` integer DEFAULT false,
	`recurring_count` integer DEFAULT 0,
	`related_feedback_ids` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_workspace_idx` ON `feedback` (`workspace`);--> statement-breakpoint
CREATE INDEX `feedback_customer_idx` ON `feedback` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `feedback_meeting_idx` ON `feedback` (`workspace`,`meeting_id`);--> statement-breakpoint
CREATE INDEX `feedback_category_idx` ON `feedback` (`workspace`,`category`);--> statement-breakpoint
CREATE INDEX `feedback_sentiment_idx` ON `feedback` (`workspace`,`sentiment`);--> statement-breakpoint
CREATE INDEX `feedback_date_idx` ON `feedback` (`workspace`,`feedback_date`);--> statement-breakpoint
CREATE INDEX `feedback_status_idx` ON `feedback` (`workspace`,`status`);--> statement-breakpoint
CREATE TABLE `feedback_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`color` text,
	`usage_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_themes_workspace_idx` ON `feedback_themes` (`workspace`);--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_themes_name_idx` ON `feedback_themes` (`workspace`,`name`);--> statement-breakpoint
CREATE TABLE `meeting_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`meeting_id` text NOT NULL,
	`participant_type` text NOT NULL,
	`user_id` text,
	`stakeholder_id` text,
	`participant_name` text NOT NULL,
	`participant_email` text,
	`participant_role` text,
	`attended` integer,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meeting_participants_workspace_idx` ON `meeting_participants` (`workspace`);--> statement-breakpoint
CREATE INDEX `meeting_participants_meeting_idx` ON `meeting_participants` (`workspace`,`meeting_id`);--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`meeting_type` text DEFAULT 'general' NOT NULL,
	`location` text,
	`is_virtual` integer DEFAULT false,
	`meeting_link` text,
	`scheduled_at` text NOT NULL,
	`scheduled_end_at` text,
	`actual_start_at` text,
	`actual_end_at` text,
	`status` text DEFAULT 'Scheduled' NOT NULL,
	`outcome` text,
	`summary` text,
	`follow_up_required` integer DEFAULT false,
	`follow_up_notes` text,
	`feedback_captured` integer DEFAULT false,
	`organizer_id` text,
	`organizer_name` text,
	`reminder_sent` integer DEFAULT false,
	`feedback_reminder_sent` integer DEFAULT false,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meetings_workspace_idx` ON `meetings` (`workspace`);--> statement-breakpoint
CREATE INDEX `meetings_customer_idx` ON `meetings` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `meetings_date_idx` ON `meetings` (`workspace`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `meetings_status_idx` ON `meetings` (`workspace`,`status`);--> statement-breakpoint
CREATE INDEX `meetings_organizer_idx` ON `meetings` (`workspace`,`organizer_id`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`user_id` text NOT NULL,
	`notification_type` text NOT NULL,
	`in_app` integer DEFAULT true,
	`email` integer DEFAULT true,
	`push` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_prefs_workspace_idx` ON `notification_preferences` (`workspace`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_prefs_user_type_idx` ON `notification_preferences` (`workspace`,`user_id`,`notification_type`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`priority` text DEFAULT 'normal',
	`entity_type` text,
	`entity_id` text,
	`deep_link` text,
	`is_read` integer DEFAULT false,
	`read_at` text,
	`is_archived` integer DEFAULT false,
	`expires_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_workspace_idx` ON `notifications` (`workspace`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`workspace`,`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_unread_idx` ON `notifications` (`workspace`,`user_id`,`is_read`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`industry` text,
	`website` text,
	`logo_url` text,
	`address` text,
	`city` text,
	`country` text,
	`region` text,
	`tier` text DEFAULT 'standard',
	`contract_start_date` text,
	`contract_value` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `organizations_workspace_idx` ON `organizations` (`workspace`);--> statement-breakpoint
CREATE INDEX `organizations_name_idx` ON `organizations` (`workspace`,`name`);--> statement-breakpoint
CREATE INDEX `organizations_tier_idx` ON `organizations` (`workspace`,`tier`);--> statement-breakpoint
CREATE TABLE `sentiment_history` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`sentiment` text NOT NULL,
	`previous_sentiment` text,
	`reason` text,
	`triggered_by` text,
	`recorded_at` text NOT NULL,
	`recorded_by` text
);
--> statement-breakpoint
CREATE INDEX `sentiment_history_workspace_idx` ON `sentiment_history` (`workspace`);--> statement-breakpoint
CREATE INDEX `sentiment_history_customer_idx` ON `sentiment_history` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `sentiment_history_date_idx` ON `sentiment_history` (`workspace`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`customer_id` text NOT NULL,
	`full_name` text NOT NULL,
	`title` text,
	`designation` text,
	`department` text,
	`email` text,
	`phone` text,
	`linkedin_url` text,
	`location` text,
	`is_primary` integer DEFAULT false,
	`criticality` text DEFAULT 'medium',
	`influence_level` text DEFAULT 'medium',
	`preferred_contact_method` text,
	`notes` text,
	`last_contacted_at` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `stakeholders_workspace_idx` ON `stakeholders` (`workspace`);--> statement-breakpoint
CREATE INDEX `stakeholders_customer_idx` ON `stakeholders` (`workspace`,`customer_id`);--> statement-breakpoint
CREATE INDEX `stakeholders_primary_idx` ON `stakeholders` (`workspace`,`customer_id`,`is_primary`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text,
	`description` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_settings_key_idx` ON `system_settings` (`workspace`,`setting_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`display_name` text,
	`avatar_url` text,
	`role` text DEFAULT 'relationship_owner' NOT NULL,
	`department` text,
	`title` text,
	`phone` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_department_idx` ON `users` (`department`);