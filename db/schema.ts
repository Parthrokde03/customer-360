import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const deviceSessions = sqliteTable('device_sessions', {
  id:text('id').primaryKey(), tokenHash:text('token_hash').notNull(), email:text('email').notNull(),
  workspace:text('workspace').notNull(), name:text('name').notNull(), expiresAt:text('expires_at').notNull(),
  revoked:integer('revoked',{mode:'boolean'}).notNull().default(false), createdAt:text('created_at').notNull(),
},t=>[uniqueIndex('device_token').on(t.tokenHash)]);
export const deliveryOutbox = sqliteTable('delivery_outbox', {
  id:text('id').primaryKey(), workspace:text('workspace').notNull(), email:text('email').notNull(),
  notificationId:text('notification_id').notNull(), recordId:text('record_id').notNull(),
  channel:text('channel').notNull(), status:text('status').notNull().default('pending'),
  attempts:integer('attempts').notNull().default(0), nextAttemptAt:text('next_attempt_at').notNull(),
  lastError:text('last_error'), createdAt:text('created_at').notNull(), deliveredAt:text('delivered_at'),
},t=>[index('delivery_due').on(t.status,t.nextAttemptAt)]);
export const workspaceJobs = sqliteTable('workspace_jobs', {
  workspace:text('workspace').primaryKey(), lastRunAt:text('last_run_at'), lastError:text('last_error'),
});

export const workspaceMembers = sqliteTable('workspace_members', {
  email: text('email').primaryKey(), workspace: text('workspace').notNull(),
  name: text('name').notNull(), role: text('role').notNull(),
  functions: text('functions').notNull().default('[]'), customers: text('customers').notNull().default('[]'),
  active: integer('active', {mode:'boolean'}).notNull().default(true),
}, t => [index('members_workspace').on(t.workspace)]);
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(), workspace: text('workspace').notNull(), data: text('data').notNull(),
});
export const workspaceInvites = sqliteTable('workspace_invites', {
  id:text('id').primaryKey(), email:text('email').notNull(), workspace:text('workspace').notNull(), data:text('data').notNull(),
});
export const secureFiles = sqliteTable('secure_files', {
  id: text('id').primaryKey(), workspace: text('workspace').notNull(), recordId: text('record_id').notNull(),
  name: text('name').notNull(), type: text('type').notNull(), size: integer('size').notNull(),
  createdBy: text('created_by').notNull(),
});

// ============================================================================
// CORE IDENTITY & ACCESS CONTROL
// ============================================================================

/**
 * Users - All system users (GCC leaders, admins, relationship owners)
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('relationship_owner'), // ceo, function_head, relationship_owner, action_owner, admin
  department: text('department'), // IT, HR, Finance, Operations, Procurement, etc.
  title: text('title'), // Job title
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  uniqueIndex('users_email_idx').on(t.email),
  index('users_role_idx').on(t.role),
  index('users_department_idx').on(t.department),
]);

/**
 * Organizations - Business units / customer organizations
 */
export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  name: text('name').notNull(),
  code: text('code'), // Short code like "ATLAS", "MERID"
  industry: text('industry'),
  website: text('website'),
  logoUrl: text('logo_url'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  region: text('region'), // APAC, EMEA, Americas
  tier: text('tier').default('standard'), // strategic, key, standard
  contractStartDate: text('contract_start_date'),
  contractValue: text('contract_value'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('organizations_workspace_idx').on(t.workspace),
  index('organizations_name_idx').on(t.workspace, t.name),
  index('organizations_tier_idx').on(t.workspace, t.tier),
]);

// ============================================================================
// CUSTOMER & STAKEHOLDER MANAGEMENT
// ============================================================================

/**
 * Customers - Customer accounts (business units within organizations)
 */
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  organizationId: text('organization_id'),
  name: text('name').notNull(),
  code: text('code'),
  businessFunction: text('business_function').notNull(), // IT, HR, Finance, Operations, Procurement
  location: text('location'),
  region: text('region'),
  relationshipOwnerId: text('relationship_owner_id'),
  relationshipOwnerName: text('relationship_owner_name'),
  primaryStakeholderId: text('primary_stakeholder_id'),
  currentSentiment: text('current_sentiment').default('Neutral'), // Positive, Neutral, Concerned, Critical
  previousSentiment: text('previous_sentiment'),
  sentimentChangedAt: text('sentiment_changed_at'),
  criticality: text('criticality').default('medium'), // low, medium, high, critical
  lastInteractionDate: text('last_interaction_date'),
  lastInteractionType: text('last_interaction_type'),
  nextScheduledMeeting: text('next_scheduled_meeting'),
  openActionsCount: integer('open_actions_count').default(0),
  overdueActionsCount: integer('overdue_actions_count').default(0),
  totalInteractions: integer('total_interactions').default(0),
  tags: text('tags'), // JSON array of tags
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('customers_workspace_idx').on(t.workspace),
  index('customers_function_idx').on(t.workspace, t.businessFunction),
  index('customers_sentiment_idx').on(t.workspace, t.currentSentiment),
  index('customers_owner_idx').on(t.workspace, t.relationshipOwnerId),
  index('customers_criticality_idx').on(t.workspace, t.criticality),
  index('customers_org_idx').on(t.workspace, t.organizationId),
]);

/**
 * Stakeholders - Customer-side contacts
 */
export const stakeholders = sqliteTable('stakeholders', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  fullName: text('full_name').notNull(),
  title: text('title'),
  designation: text('designation'),
  department: text('department'),
  email: text('email'),
  phone: text('phone'),
  linkedInUrl: text('linkedin_url'),
  location: text('location'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  criticality: text('criticality').default('medium'), // low, medium, high, executive
  influenceLevel: text('influence_level').default('medium'), // low, medium, high, decision_maker
  preferredContactMethod: text('preferred_contact_method'),
  notes: text('notes'),
  lastContactedAt: text('last_contacted_at'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('stakeholders_workspace_idx').on(t.workspace),
  index('stakeholders_customer_idx').on(t.workspace, t.customerId),
  index('stakeholders_primary_idx').on(t.workspace, t.customerId, t.isPrimary),
]);

// ============================================================================
// MEETINGS & INTERACTIONS
// ============================================================================

/**
 * Meetings - Scheduled and completed meetings
 */
export const meetings = sqliteTable('meetings', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  meetingType: text('meeting_type').notNull().default('general'), // qbr, escalation, onboarding, check_in, strategic, general
  location: text('location'),
  isVirtual: integer('is_virtual', { mode: 'boolean' }).default(false),
  meetingLink: text('meeting_link'),
  scheduledAt: text('scheduled_at').notNull(),
  scheduledEndAt: text('scheduled_end_at'),
  actualStartAt: text('actual_start_at'),
  actualEndAt: text('actual_end_at'),
  status: text('status').notNull().default('Scheduled'), // Scheduled, In Progress, Completed, Cancelled, Rescheduled
  outcome: text('outcome'), // positive, neutral, needs_follow_up, escalation_required
  summary: text('summary'),
  followUpRequired: integer('follow_up_required', { mode: 'boolean' }).default(false),
  followUpNotes: text('follow_up_notes'),
  feedbackCaptured: integer('feedback_captured', { mode: 'boolean' }).default(false),
  organizerId: text('organizer_id'),
  organizerName: text('organizer_name'),
  reminderSent: integer('reminder_sent', { mode: 'boolean' }).default(false),
  feedbackReminderSent: integer('feedback_reminder_sent', { mode: 'boolean' }).default(false),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('meetings_workspace_idx').on(t.workspace),
  index('meetings_customer_idx').on(t.workspace, t.customerId),
  index('meetings_date_idx').on(t.workspace, t.scheduledAt),
  index('meetings_status_idx').on(t.workspace, t.status),
  index('meetings_organizer_idx').on(t.workspace, t.organizerId),
]);

/**
 * Meeting Participants - GCC leaders and stakeholders in meetings
 */
export const meetingParticipants = sqliteTable('meeting_participants', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  meetingId: text('meeting_id').notNull(),
  participantType: text('participant_type').notNull(), // gcc_leader, customer_stakeholder
  userId: text('user_id'), // For GCC leaders
  stakeholderId: text('stakeholder_id'), // For customer stakeholders
  participantName: text('participant_name').notNull(),
  participantEmail: text('participant_email'),
  participantRole: text('participant_role'), // Host, Presenter, Attendee
  attended: integer('attended', { mode: 'boolean' }),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
}, t => [
  index('meeting_participants_workspace_idx').on(t.workspace),
  index('meeting_participants_meeting_idx').on(t.workspace, t.meetingId),
]);

// ============================================================================
// FEEDBACK & SENTIMENT
// ============================================================================

/**
 * Feedback - All customer feedback records
 */
export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  meetingId: text('meeting_id'),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default('General'), // Appreciation, Concern, Complaint, Suggestion, New Requirement, Escalation, Improvement Opportunity, General
  sentiment: text('sentiment').notNull().default('Neutral'), // Positive, Neutral, Concerned, Critical
  priority: text('priority').default('medium'), // low, medium, high, critical
  source: text('source').default('meeting'), // meeting, email, call, chat, survey
  sourceReference: text('source_reference'),
  themes: text('themes'), // JSON array of theme tags
  isSensitive: integer('is_sensitive', { mode: 'boolean' }).default(false),
  requiresAction: integer('requires_action', { mode: 'boolean' }).default(false),
  linkedActionId: text('linked_action_id'),
  status: text('status').default('Open'), // Open, Acknowledged, In Progress, Resolved, Closed
  acknowledgedAt: text('acknowledged_at'),
  acknowledgedBy: text('acknowledged_by'),
  resolvedAt: text('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  capturedById: text('captured_by_id'),
  capturedByName: text('captured_by_name'),
  feedbackDate: text('feedback_date').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recurringCount: integer('recurring_count').default(0),
  relatedFeedbackIds: text('related_feedback_ids'), // JSON array
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('feedback_workspace_idx').on(t.workspace),
  index('feedback_customer_idx').on(t.workspace, t.customerId),
  index('feedback_meeting_idx').on(t.workspace, t.meetingId),
  index('feedback_category_idx').on(t.workspace, t.category),
  index('feedback_sentiment_idx').on(t.workspace, t.sentiment),
  index('feedback_date_idx').on(t.workspace, t.feedbackDate),
  index('feedback_status_idx').on(t.workspace, t.status),
]);

/**
 * Feedback Themes - Categorized themes for analytics
 */
export const feedbackThemes = sqliteTable('feedback_themes', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // Service, Quality, Communication, Timeline, Cost, etc.
  color: text('color'),
  usageCount: integer('usage_count').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('feedback_themes_workspace_idx').on(t.workspace),
  uniqueIndex('feedback_themes_name_idx').on(t.workspace, t.name),
]);

/**
 * Sentiment History - Track sentiment changes over time
 */
export const sentimentHistory = sqliteTable('sentiment_history', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  sentiment: text('sentiment').notNull(),
  previousSentiment: text('previous_sentiment'),
  reason: text('reason'),
  triggeredBy: text('triggered_by'), // feedback_id, manual, system
  recordedAt: text('recorded_at').notNull(),
  recordedBy: text('recorded_by'),
}, t => [
  index('sentiment_history_workspace_idx').on(t.workspace),
  index('sentiment_history_customer_idx').on(t.workspace, t.customerId),
  index('sentiment_history_date_idx').on(t.workspace, t.recordedAt),
]);

// ============================================================================
// ACTIONS & COMMITMENTS
// ============================================================================

/**
 * Actions - Trackable commitments and action items
 */
export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  feedbackId: text('feedback_id'),
  meetingId: text('meeting_id'),
  actionNumber: text('action_number'), // Human-readable ID like "ACT-2026-0001"
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // Service Improvement, Issue Resolution, New Request, Follow-up, etc.
  ownerId: text('owner_id'),
  ownerName: text('owner_name').notNull(),
  ownerDepartment: text('owner_department'),
  assignedById: text('assigned_by_id'),
  assignedByName: text('assigned_by_name'),
  priority: text('priority').notNull().default('Medium'), // Low, Medium, High, Critical
  status: text('status').notNull().default('Open'), // Open, In Progress, Delayed, Blocked, Closed, Cancelled
  dueDate: text('due_date').notNull(),
  originalDueDate: text('original_due_date'),
  completedAt: text('completed_at'),
  delayedAt: text('delayed_at'),
  delayReason: text('delay_reason'),
  estimatedEffort: text('estimated_effort'), // hours, days
  actualEffort: text('actual_effort'),
  progressPercent: integer('progress_percent').default(0),
  progressNotes: text('progress_notes'),
  closureNotes: text('closure_notes'),
  closureEvidence: text('closure_evidence'), // JSON array of attachment IDs
  customerConfirmationRequired: integer('customer_confirmation_required', { mode: 'boolean' }).default(false),
  customerConfirmed: integer('customer_confirmed', { mode: 'boolean' }).default(false),
  customerConfirmedAt: text('customer_confirmed_at'),
  customerConfirmedBy: text('customer_confirmed_by'),
  isEscalated: integer('is_escalated', { mode: 'boolean' }).default(false),
  escalatedAt: text('escalated_at'),
  escalationReason: text('escalation_reason'),
  tags: text('tags'), // JSON array
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('actions_workspace_idx').on(t.workspace),
  index('actions_customer_idx').on(t.workspace, t.customerId),
  index('actions_owner_idx').on(t.workspace, t.ownerId),
  index('actions_status_idx').on(t.workspace, t.status),
  index('actions_priority_idx').on(t.workspace, t.priority),
  index('actions_due_date_idx').on(t.workspace, t.dueDate),
  index('actions_feedback_idx').on(t.workspace, t.feedbackId),
]);

/**
 * Action Updates - History of action progress and changes
 */
export const actionUpdates = sqliteTable('action_updates', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  actionId: text('action_id').notNull(),
  updateType: text('update_type').notNull(), // status_change, progress_update, reassignment, note, due_date_change
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  notes: text('notes'),
  updatedById: text('updated_by_id'),
  updatedByName: text('updated_by_name'),
  createdAt: text('created_at').notNull(),
}, t => [
  index('action_updates_workspace_idx').on(t.workspace),
  index('action_updates_action_idx').on(t.workspace, t.actionId),
]);

// ============================================================================
// ESCALATIONS
// ============================================================================

/**
 * Escalations - Critical issues requiring leadership attention
 */
export const escalations = sqliteTable('escalations', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  customerId: text('customer_id').notNull(),
  feedbackId: text('feedback_id'),
  actionId: text('action_id'),
  title: text('title').notNull(),
  description: text('description'),
  severity: text('severity').notNull().default('high'), // medium, high, critical
  category: text('category'), // Service, Quality, Timeline, Communication, etc.
  status: text('status').notNull().default('Open'), // Open, Under Review, In Progress, Resolved, Closed
  escalatedById: text('escalated_by_id'),
  escalatedByName: text('escalated_by_name'),
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  targetResolutionDate: text('target_resolution_date'),
  actualResolutionDate: text('actual_resolution_date'),
  resolutionNotes: text('resolution_notes'),
  impactDescription: text('impact_description'),
  rootCause: text('root_cause'),
  preventiveMeasures: text('preventive_measures'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('escalations_workspace_idx').on(t.workspace),
  index('escalations_customer_idx').on(t.workspace, t.customerId),
  index('escalations_status_idx').on(t.workspace, t.status),
  index('escalations_severity_idx').on(t.workspace, t.severity),
]);

// ============================================================================
// DOCUMENTS & ATTACHMENTS
// ============================================================================

/**
 * Attachments - Files attached to various records
 */
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  entityType: text('entity_type').notNull(), // customer, meeting, feedback, action, escalation
  entityId: text('entity_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  storageKey: text('storage_key'),
  storageUrl: text('storage_url'),
  description: text('description'),
  uploadedById: text('uploaded_by_id'),
  uploadedByName: text('uploaded_by_name'),
  createdAt: text('created_at').notNull(),
}, t => [
  index('attachments_workspace_idx').on(t.workspace),
  index('attachments_entity_idx').on(t.workspace, t.entityType, t.entityId),
]);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notifications - User notifications
 */
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // action_assigned, action_due, action_overdue, meeting_reminder, feedback_received, escalation
  title: text('title').notNull(),
  message: text('message'),
  priority: text('priority').default('normal'), // low, normal, high, urgent
  entityType: text('entity_type'), // action, meeting, feedback, customer, escalation
  entityId: text('entity_id'),
  deepLink: text('deep_link'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  readAt: text('read_at'),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
}, t => [
  index('notifications_workspace_idx').on(t.workspace),
  index('notifications_user_idx').on(t.workspace, t.userId),
  index('notifications_unread_idx').on(t.workspace, t.userId, t.isRead),
]);

/**
 * Notification Preferences - User notification settings
 */
export const notificationPreferences = sqliteTable('notification_preferences', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  userId: text('user_id').notNull(),
  notificationType: text('notification_type').notNull(),
  inApp: integer('in_app', { mode: 'boolean' }).default(true),
  email: integer('email', { mode: 'boolean' }).default(true),
  push: integer('push', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('notification_prefs_workspace_idx').on(t.workspace),
  uniqueIndex('notification_prefs_user_type_idx').on(t.workspace, t.userId, t.notificationType),
]);

// ============================================================================
// AUDIT & SYSTEM
// ============================================================================

/**
 * Audit Log - Immutable record of all significant operations
 */
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name'),
  actorEmail: text('actor_email'),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  operation: text('operation').notNull(), // create, update, delete, status_change, assignment_change
  previousState: text('previous_state'), // JSON
  newState: text('new_state'), // JSON
  changes: text('changes'), // JSON summary of what changed
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
}, t => [
  index('audit_log_workspace_idx').on(t.workspace),
  index('audit_log_entity_idx').on(t.workspace, t.entityType, t.entityId),
  index('audit_log_actor_idx').on(t.workspace, t.actorId),
  index('audit_log_date_idx').on(t.workspace, t.createdAt),
]);

/**
 * System Settings - Workspace-level configuration
 */
export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  settingKey: text('setting_key').notNull(),
  settingValue: text('setting_value'),
  description: text('description'),
  updatedAt: text('updated_at').notNull(),
}, t => [
  uniqueIndex('system_settings_key_idx').on(t.workspace, t.settingKey),
]);

// ============================================================================
// LEGACY COMPATIBILITY - Keep old tables for migration
// ============================================================================

/**
 * Records - Generic record storage (legacy, for migration)
 */
export const records = sqliteTable('records', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  kind: text('kind').notNull(),
  customerId: text('customer_id'),
  data: text('data').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [
  index('workspace_kind').on(t.workspace, t.kind),
  index('customer_records').on(t.workspace, t.customerId),
]);

/**
 * Audit - Simple audit table (legacy, for migration)
 */
export const audit = sqliteTable('audit', {
  id: text('id').primaryKey(),
  workspace: text('workspace').notNull(),
  actor: text('actor').notNull(),
  recordId: text('record_id').notNull(),
  operation: text('operation').notNull(),
  details: text('details').notNull(),
  at: text('at').notNull(),
});

// Referential graph for the normalized domain. The record envelope is retained
// as an API/search snapshot while domain tables hold typed business fields.
export const domainLinks = sqliteTable('domain_links', {
  recordId:text('record_id').primaryKey().references(()=>records.id,{onDelete:'restrict'}),
  workspace:text('workspace').notNull(),
  customerId:text('customer_id').references(()=>records.id,{onDelete:'restrict'}),
  feedbackId:text('feedback_id').references(()=>records.id,{onDelete:'restrict'}),
  meetingId:text('meeting_id').references(()=>records.id,{onDelete:'restrict'}),
  ownerEmail:text('owner_email').references(()=>workspaceMembers.email,{onDelete:'restrict'}),
},t=>[index('domain_customer').on(t.workspace,t.customerId),index('domain_owner').on(t.workspace,t.ownerEmail)]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Stakeholder = typeof stakeholders.$inferSelect;
export type NewStakeholder = typeof stakeholders.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type FeedbackTheme = typeof feedbackThemes.$inferSelect;
export type SentimentHistoryRecord = typeof sentimentHistory.$inferSelect;
export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
export type ActionUpdate = typeof actionUpdates.$inferSelect;
export type Escalation = typeof escalations.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

// ============================================================================
// DEMO DATA HELPER TYPES
// ============================================================================

export type RecordItem = {
  id: string;
  kind: string;
  title: string;
  customerId?: string;
  owner?: string;
  function?: string;
  location?: string;
  stakeholder?: string;
  sentiment?: string;
  date?: string;
  due?: string;
  status?: string;
  priority?: string;
  category?: string;
  closure?: string;
  confirmationRequired?: boolean;
  confirmed?: boolean;
  description?: string;
  summary?: string;
  type?: string;
  time?: string;
  stakeholderTitle?: string;
  stakeholderEmail?: string;
  stakeholderPhone?: string;
  criticality?: string;
  previousSentiment?: string;
  lastInteraction?: string;
  industry?: string;
  region?: string;
  email?: string;
  phone?: string;
  website?: string;
  ownerEmail?: string;
  version?: string;
  [key: string]: unknown;
};
