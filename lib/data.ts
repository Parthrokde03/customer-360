/**
 * Customer 360° Platform - Comprehensive Demo Data
 * Welspun Global Capability Center
 * 
 * This file contains realistic fictional data for demonstration purposes.
 * All names, companies, and scenarios are illustrative and do not represent
 * actual Welspun customers or business relationships.
 */

import type { RecordItem } from '../db/schema';
export type { RecordItem } from '../db/schema';

// ============================================================================
// GCC LEADERSHIP TEAM
// ============================================================================

export const gccLeaders = [
  { id: 'u1', name: 'Priya Sharma', role: 'Chief Operating Officer', department: 'Operations', email: 'priya.sharma@welspun.com' },
  { id: 'u2', name: 'Rahul Desai', role: 'VP Finance & Accounts', department: 'Finance', email: 'rahul.desai@welspun.com' },
  { id: 'u3', name: 'Ananya Rao', role: 'Head of Technology', department: 'IT', email: 'ananya.rao@welspun.com' },
  { id: 'u4', name: 'Vikram Mehta', role: 'Director HR Services', department: 'HR', email: 'vikram.mehta@welspun.com' },
  { id: 'u5', name: 'Sneha Patel', role: 'Procurement Lead', department: 'Procurement', email: 'sneha.patel@welspun.com' },
  { id: 'u6', name: 'Arjun Nair', role: 'Quality Assurance Head', department: 'Operations', email: 'arjun.nair@welspun.com' },
];

// ============================================================================
// BUSINESS FUNCTIONS
// ============================================================================

export const businessFunctions = [
  'Operations',
  'Finance',
  'IT',
  'HR',
  'Procurement',
  'Quality',
  'Supply Chain',
  'Legal',
];

export const feedbackCategories = [
  'Appreciation',
  'Concern',
  'Complaint',
  'Suggestion',
  'New Requirement',
  'Escalation',
  'Improvement Opportunity',
  'General Feedback',
];

export const meetingTypes = [
  'Quarterly Business Review',
  'Monthly Check-in',
  'Escalation Review',
  'Onboarding',
  'Strategic Planning',
  'Service Review',
  'Issue Resolution',
  'General Discussion',
];

// ============================================================================
// CUSTOMERS - Fictional Business Units
// ============================================================================

export const customers: RecordItem[] = [
  {
    id: 'c1',
    kind: 'customer',
    title: 'Atlas Textiles International',
    function: 'Operations',
    location: 'Mumbai, India',
    region: 'APAC',
    owner: 'Priya Sharma',
    stakeholder: 'Arjun Mehta',
    stakeholderTitle: 'VP Operations',
    stakeholderEmail: 'arjun.mehta@atlastextiles.com',
    sentiment: 'Concerned',
    previousSentiment: 'Positive',
    criticality: 'high',
    lastInteraction: '2026-10-17',
    openActions: 4,
    overdueActions: 2,
    totalInteractions: 28,
    tier: 'strategic',
    contractValue: '$2.4M',
  },
  {
    id: 'c2',
    kind: 'customer',
    title: 'Meridian Living Solutions',
    function: 'Finance',
    location: 'London, UK',
    region: 'EMEA',
    owner: 'Rahul Desai',
    stakeholder: 'Emma Wilson',
    stakeholderTitle: 'CFO',
    stakeholderEmail: 'emma.wilson@meridianliving.co.uk',
    sentiment: 'Positive',
    previousSentiment: 'Positive',
    criticality: 'medium',
    lastInteraction: '2026-10-22',
    openActions: 1,
    overdueActions: 0,
    totalInteractions: 15,
    tier: 'key',
    contractValue: '$1.1M',
  },
  {
    id: 'c3',
    kind: 'customer',
    title: 'Northstar Infrastructure Corp',
    function: 'IT',
    location: 'Ahmedabad, India',
    region: 'APAC',
    owner: 'Ananya Rao',
    stakeholder: 'Vikram Shah',
    stakeholderTitle: 'CTO',
    stakeholderEmail: 'vikram.shah@northstarinfra.com',
    sentiment: 'Critical',
    previousSentiment: 'Concerned',
    criticality: 'critical',
    lastInteraction: '2026-10-25',
    openActions: 6,
    overdueActions: 3,
    totalInteractions: 42,
    tier: 'strategic',
    contractValue: '$3.8M',
  },
  {
    id: 'c4',
    kind: 'customer',
    title: 'Evergreen Consumer Products',
    function: 'Procurement',
    location: 'New York, USA',
    region: 'Americas',
    owner: 'Sneha Patel',
    stakeholder: 'Sarah Chen',
    stakeholderTitle: 'VP Supply Chain',
    stakeholderEmail: 'sarah.chen@evergreen.com',
    sentiment: 'Positive',
    previousSentiment: 'Neutral',
    criticality: 'medium',
    lastInteraction: '2026-10-20',
    openActions: 2,
    overdueActions: 0,
    totalInteractions: 19,
    tier: 'key',
    contractValue: '$980K',
  },
  {
    id: 'c5',
    kind: 'customer',
    title: 'Horizon Industries Ltd',
    function: 'HR',
    location: 'Pune, India',
    region: 'APAC',
    owner: 'Vikram Mehta',
    stakeholder: 'Neha Kapoor',
    stakeholderTitle: 'CHRO',
    stakeholderEmail: 'neha.kapoor@horizonind.com',
    sentiment: 'Neutral',
    previousSentiment: 'Neutral',
    criticality: 'medium',
    lastInteraction: '2026-10-18',
    openActions: 3,
    overdueActions: 1,
    totalInteractions: 22,
    tier: 'standard',
    contractValue: '$650K',
  },
  {
    id: 'c6',
    kind: 'customer',
    title: 'Summit Energy Partners',
    function: 'Operations',
    location: 'Dubai, UAE',
    region: 'EMEA',
    owner: 'Priya Sharma',
    stakeholder: 'Omar Hassan',
    stakeholderTitle: 'COO',
    stakeholderEmail: 'omar.hassan@summitenergy.ae',
    sentiment: 'Positive',
    previousSentiment: 'Positive',
    criticality: 'high',
    lastInteraction: '2026-10-24',
    openActions: 1,
    overdueActions: 0,
    totalInteractions: 31,
    tier: 'strategic',
    contractValue: '$2.1M',
  },
  {
    id: 'c7',
    kind: 'customer',
    title: 'Pacific Retail Group',
    function: 'Supply Chain',
    location: 'Singapore',
    region: 'APAC',
    owner: 'Arjun Nair',
    stakeholder: 'Michael Tan',
    stakeholderTitle: 'VP Logistics',
    stakeholderEmail: 'michael.tan@pacificretail.sg',
    sentiment: 'Concerned',
    previousSentiment: 'Positive',
    criticality: 'high',
    lastInteraction: '2026-10-21',
    openActions: 5,
    overdueActions: 2,
    totalInteractions: 26,
    tier: 'key',
    contractValue: '$1.5M',
  },
  {
    id: 'c8',
    kind: 'customer',
    title: 'Continental Manufacturing',
    function: 'Quality',
    location: 'Frankfurt, Germany',
    region: 'EMEA',
    owner: 'Arjun Nair',
    stakeholder: 'Hans Mueller',
    stakeholderTitle: 'Quality Director',
    stakeholderEmail: 'hans.mueller@continental.de',
    sentiment: 'Neutral',
    previousSentiment: 'Concerned',
    criticality: 'medium',
    lastInteraction: '2026-10-19',
    openActions: 2,
    overdueActions: 0,
    totalInteractions: 18,
    tier: 'standard',
    contractValue: '$720K',
  },
];

// ============================================================================
// ADDITIONAL STAKEHOLDERS
// ============================================================================

export const stakeholders = [
  // Atlas Textiles
  { id: 's1', customerId: 'c1', name: 'Arjun Mehta', title: 'VP Operations', isPrimary: true, criticality: 'executive' },
  { id: 's2', customerId: 'c1', name: 'Priyanka Iyer', title: 'Operations Manager', isPrimary: false, criticality: 'high' },
  { id: 's3', customerId: 'c1', name: 'Raj Krishnan', title: 'Process Lead', isPrimary: false, criticality: 'medium' },
  // Northstar Infrastructure
  { id: 's4', customerId: 'c3', name: 'Vikram Shah', title: 'CTO', isPrimary: true, criticality: 'executive' },
  { id: 's5', customerId: 'c3', name: 'Aisha Patel', title: 'IT Director', isPrimary: false, criticality: 'high' },
  { id: 's6', customerId: 'c3', name: 'Karan Malhotra', title: 'Infrastructure Lead', isPrimary: false, criticality: 'medium' },
  // Pacific Retail
  { id: 's7', customerId: 'c7', name: 'Michael Tan', title: 'VP Logistics', isPrimary: true, criticality: 'executive' },
  { id: 's8', customerId: 'c7', name: 'Jennifer Wong', title: 'Supply Chain Manager', isPrimary: false, criticality: 'high' },
];

// ============================================================================
// FEEDBACK RECORDS - July to October 2026
// ============================================================================

export const feedbackRecords: RecordItem[] = [
  // July 2026
  { id: 'f1', kind: 'feedback', title: 'Excellent response to urgent production query', customerId: 'c1', sentiment: 'Positive', category: 'Appreciation', date: '2026-07-05', owner: 'Priya Sharma', description: 'The operations team responded within 2 hours to our critical production scheduling query. This helped us avoid a potential 4-hour delay.' },
  { id: 'f2', kind: 'feedback', title: 'Monthly reporting format needs improvement', customerId: 'c2', sentiment: 'Concerned', category: 'Suggestion', date: '2026-07-08', owner: 'Rahul Desai', description: 'The current monthly financial reports are comprehensive but could benefit from executive summary dashboards.' },
  { id: 'f3', kind: 'feedback', title: 'System downtime affecting productivity', customerId: 'c3', sentiment: 'Critical', category: 'Escalation', date: '2026-07-12', owner: 'Ananya Rao', description: 'Experienced 6 hours of unplanned system downtime. This is the third incident this quarter. Need immediate action plan.' },
  { id: 'f4', kind: 'feedback', title: 'New vendor onboarding process working well', customerId: 'c4', sentiment: 'Positive', category: 'Appreciation', date: '2026-07-15', owner: 'Sneha Patel', description: 'The streamlined vendor onboarding process reduced our time-to-production by 40%. Great improvement.' },
  { id: 'f5', kind: 'feedback', title: 'Request for additional HR analytics', customerId: 'c5', sentiment: 'Neutral', category: 'New Requirement', date: '2026-07-18', owner: 'Vikram Mehta', description: 'Would like to see attrition prediction and talent pipeline analytics in the HR dashboard.' },
  { id: 'f6', kind: 'feedback', title: 'Proactive communication appreciated', customerId: 'c6', sentiment: 'Positive', category: 'Appreciation', date: '2026-07-22', owner: 'Priya Sharma', description: 'Thank you for the proactive heads-up about the planned maintenance window. Helped us plan accordingly.' },
  
  // August 2026
  { id: 'f7', kind: 'feedback', title: 'Quality metrics dashboard launch successful', customerId: 'c8', sentiment: 'Positive', category: 'Appreciation', date: '2026-08-02', owner: 'Arjun Nair', description: 'The new quality metrics dashboard provides exactly the visibility we needed. Team adoption has been excellent.' },
  { id: 'f8', kind: 'feedback', title: 'Invoice processing delays', customerId: 'c2', sentiment: 'Concerned', category: 'Concern', date: '2026-08-05', owner: 'Rahul Desai', description: 'Invoices are taking 15+ days to process compared to the agreed 5-day SLA. This is impacting our vendor relationships.' },
  { id: 'f9', kind: 'feedback', title: 'Successful ERP migration support', customerId: 'c1', sentiment: 'Positive', category: 'Appreciation', date: '2026-08-10', owner: 'Priya Sharma', description: 'The support during our ERP migration was exceptional. Zero data loss and minimal downtime.' },
  { id: 'f10', kind: 'feedback', title: 'Supply chain visibility gaps', customerId: 'c7', sentiment: 'Concerned', category: 'Concern', date: '2026-08-14', owner: 'Arjun Nair', description: 'We are unable to track shipments in real-time. This lack of visibility is causing customer service issues.' },
  { id: 'f11', kind: 'feedback', title: 'Infrastructure scaling concerns', customerId: 'c3', sentiment: 'Critical', category: 'Escalation', date: '2026-08-18', owner: 'Ananya Rao', description: 'Current infrastructure cannot handle our projected growth. Need urgent capacity planning discussion.' },
  { id: 'f12', kind: 'feedback', title: 'Training program effectiveness', customerId: 'c5', sentiment: 'Positive', category: 'Appreciation', date: '2026-08-22', owner: 'Vikram Mehta', description: 'The leadership development program you designed has shown measurable improvement in our mid-management competencies.' },
  { id: 'f13', kind: 'feedback', title: 'Procurement cycle time reduction', customerId: 'c4', sentiment: 'Positive', category: 'Appreciation', date: '2026-08-25', owner: 'Sneha Patel', description: 'Procurement cycle time reduced from 45 days to 28 days. This is making a real difference to our operations.' },
  
  // September 2026
  { id: 'f14', kind: 'feedback', title: 'Communication gaps during incidents', customerId: 'c1', sentiment: 'Concerned', category: 'Concern', date: '2026-09-03', owner: 'Priya Sharma', description: 'During the recent incident, we were not updated for 4 hours. Please improve incident communication protocols.' },
  { id: 'f15', kind: 'feedback', title: 'Budget forecasting accuracy improved', customerId: 'c2', sentiment: 'Positive', category: 'Appreciation', date: '2026-09-07', owner: 'Rahul Desai', description: 'The Q3 budget forecast was within 2% variance. Best accuracy we have seen in 3 years.' },
  { id: 'f16', kind: 'feedback', title: 'Repeated access issues unresolved', customerId: 'c3', sentiment: 'Critical', category: 'Escalation', date: '2026-09-11', owner: 'Ananya Rao', description: 'This is the fourth time we are raising the same access management issue. Previous commitments not honored.' },
  { id: 'f17', kind: 'feedback', title: 'Compliance reporting streamlined', customerId: 'c6', sentiment: 'Positive', category: 'Appreciation', date: '2026-09-15', owner: 'Priya Sharma', description: 'The automated compliance reporting has saved us 40 hours per month. Excellent initiative.' },
  { id: 'f18', kind: 'feedback', title: 'Vendor payment terms concerns', customerId: 'c7', sentiment: 'Concerned', category: 'Concern', date: '2026-09-18', owner: 'Arjun Nair', description: 'Several key vendors are complaining about payment terms. This could affect our supply chain reliability.' },
  { id: 'f19', kind: 'feedback', title: 'Performance review system enhancement', customerId: 'c5', sentiment: 'Neutral', category: 'Suggestion', date: '2026-09-22', owner: 'Vikram Mehta', description: 'The current performance review system could benefit from 360-degree feedback integration.' },
  { id: 'f20', kind: 'feedback', title: 'Quality certification support', customerId: 'c8', sentiment: 'Positive', category: 'Appreciation', date: '2026-09-26', owner: 'Arjun Nair', description: 'Your support in achieving ISO 9001:2015 recertification was invaluable. The auditors were impressed.' },
  
  // October 2026
  { id: 'f21', kind: 'feedback', title: 'Service recovery plan effective', customerId: 'c1', sentiment: 'Neutral', category: 'General Feedback', date: '2026-10-02', owner: 'Priya Sharma', description: 'The service recovery plan shows promise but we need to see sustained improvement over the next quarter.' },
  { id: 'f22', kind: 'feedback', title: 'Financial dashboard enhancements delivered', customerId: 'c2', sentiment: 'Positive', category: 'Appreciation', date: '2026-10-06', owner: 'Rahul Desai', description: 'The new executive summary dashboard is exactly what we requested. Great job on the quick turnaround.' },
  { id: 'f23', kind: 'feedback', title: 'Persistent infrastructure issues', customerId: 'c3', sentiment: 'Critical', category: 'Escalation', date: '2026-10-10', owner: 'Ananya Rao', description: 'Despite multiple escalations, core infrastructure issues remain unresolved. Requesting executive intervention.' },
  { id: 'f24', kind: 'feedback', title: 'Strategic sourcing workshop productive', customerId: 'c4', sentiment: 'Positive', category: 'Appreciation', date: '2026-10-14', owner: 'Sneha Patel', description: 'The strategic sourcing workshop identified $2M in potential savings. Looking forward to implementation.' },
  { id: 'f25', kind: 'feedback', title: 'Talent acquisition support needed', customerId: 'c5', sentiment: 'Neutral', category: 'New Requirement', date: '2026-10-17', owner: 'Vikram Mehta', description: 'Need support for specialized technical recruitment. Current channels are not yielding quality candidates.' },
  { id: 'f26', kind: 'feedback', title: 'Operational excellence recognition', customerId: 'c6', sentiment: 'Positive', category: 'Appreciation', date: '2026-10-20', owner: 'Priya Sharma', description: 'Your team has been instrumental in our operational excellence journey. The improvements are visible in our KPIs.' },
  { id: 'f27', kind: 'feedback', title: 'Logistics tracking improvement needed', customerId: 'c7', sentiment: 'Concerned', category: 'Concern', date: '2026-10-22', owner: 'Arjun Nair', description: 'Still waiting for the promised logistics tracking solution. Our customers are asking for better visibility.' },
  { id: 'f28', kind: 'feedback', title: 'Process documentation appreciated', customerId: 'c8', sentiment: 'Positive', category: 'Appreciation', date: '2026-10-25', owner: 'Arjun Nair', description: 'The comprehensive process documentation has significantly reduced our onboarding time for new team members.' },
  { id: 'f29', kind: 'feedback', title: 'Resolution delays impacting business', customerId: 'c1', sentiment: 'Concerned', category: 'Concern', date: '2026-10-28', owner: 'Priya Sharma', description: 'The delayed resolution of outstanding issues is affecting our production planning. Need urgent attention.' },
  { id: 'f30', kind: 'feedback', title: 'Year-end planning support excellent', customerId: 'c2', sentiment: 'Positive', category: 'Appreciation', date: '2026-10-30', owner: 'Rahul Desai', description: 'The support for year-end financial planning has been exceptional. Everything is on track.' },
];

// ============================================================================
// ACTION ITEMS
// ============================================================================

export const actionItems: RecordItem[] = [
  // Atlas Textiles (c1) - 4 open, 2 overdue
  { id: 'a1', kind: 'action', title: 'Implement incident communication protocol v2.0', customerId: 'c1', owner: 'Priya Sharma', due: '2026-10-15', status: 'Delayed', priority: 'High', closure: '', description: 'Update incident communication SOP with 30-minute notification requirement', confirmationRequired: true, confirmed: false, progress: 60 },
  { id: 'a2', kind: 'action', title: 'Complete service recovery plan milestones', customerId: 'c1', owner: 'Priya Sharma', due: '2026-10-20', status: 'Delayed', priority: 'Critical', closure: '', description: 'Deliver Phase 2 of service recovery with documented improvements', confirmationRequired: true, confirmed: false, progress: 45 },
  { id: 'a3', kind: 'action', title: 'Deploy production monitoring dashboard', customerId: 'c1', owner: 'Ananya Rao', due: '2026-11-05', status: 'In Progress', priority: 'High', closure: '', description: 'Real-time production metrics visible to Atlas operations team', confirmationRequired: false, confirmed: false, progress: 70 },
  { id: 'a4', kind: 'action', title: 'Schedule quarterly business review', customerId: 'c1', owner: 'Priya Sharma', due: '2026-11-10', status: 'Open', priority: 'Medium', closure: '', description: 'Q4 2026 QBR with Atlas leadership team', confirmationRequired: false, confirmed: false, progress: 0 },
  
  // Meridian Living (c2) - 1 open
  { id: 'a5', kind: 'action', title: 'Deliver executive reporting templates', customerId: 'c2', owner: 'Rahul Desai', due: '2026-11-08', status: 'In Progress', priority: 'Medium', closure: '', description: 'New executive summary templates as per August feedback', confirmationRequired: true, confirmed: false, progress: 80 },
  
  // Northstar Infrastructure (c3) - 6 open, 3 overdue
  { id: 'a6', kind: 'action', title: 'Resolve recurring access management issues', customerId: 'c3', owner: 'Ananya Rao', due: '2026-09-30', status: 'Delayed', priority: 'Critical', closure: '', description: 'Implement automated access provisioning to prevent recurrence', confirmationRequired: true, confirmed: false, progress: 40, isEscalated: true },
  { id: 'a7', kind: 'action', title: 'Complete infrastructure capacity assessment', customerId: 'c3', owner: 'Ananya Rao', due: '2026-10-10', status: 'Delayed', priority: 'Critical', closure: '', description: 'Detailed capacity planning for next 18 months', confirmationRequired: true, confirmed: false, progress: 55, isEscalated: true },
  { id: 'a8', kind: 'action', title: 'Deploy high-availability configuration', customerId: 'c3', owner: 'Ananya Rao', due: '2026-10-25', status: 'Delayed', priority: 'Critical', closure: '', description: 'HA setup to prevent future downtime incidents', confirmationRequired: true, confirmed: false, progress: 30 },
  { id: 'a9', kind: 'action', title: 'Establish executive escalation channel', customerId: 'c3', owner: 'Priya Sharma', due: '2026-11-01', status: 'In Progress', priority: 'High', closure: '', description: 'Direct escalation path to GCC leadership for critical issues', confirmationRequired: false, confirmed: false, progress: 50 },
  { id: 'a10', kind: 'action', title: 'Present infrastructure roadmap', customerId: 'c3', owner: 'Ananya Rao', due: '2026-11-15', status: 'Open', priority: 'High', closure: '', description: 'Strategic infrastructure roadmap presentation to Northstar CTO', confirmationRequired: false, confirmed: false, progress: 20 },
  { id: 'a11', kind: 'action', title: 'Implement monitoring alerting system', customerId: 'c3', owner: 'Ananya Rao', due: '2026-11-20', status: 'Open', priority: 'Medium', closure: '', description: 'Proactive alerting for infrastructure issues', confirmationRequired: false, confirmed: false, progress: 0 },
  
  // Evergreen Consumer (c4) - 2 open
  { id: 'a12', kind: 'action', title: 'Implement strategic sourcing recommendations', customerId: 'c4', owner: 'Sneha Patel', due: '2026-11-25', status: 'In Progress', priority: 'High', closure: '', description: 'Execute Phase 1 of $2M savings initiative from workshop', confirmationRequired: true, confirmed: false, progress: 35 },
  { id: 'a13', kind: 'action', title: 'Vendor consolidation analysis', customerId: 'c4', owner: 'Sneha Patel', due: '2026-12-01', status: 'Open', priority: 'Medium', closure: '', description: 'Analysis of vendor consolidation opportunities', confirmationRequired: false, confirmed: false, progress: 0 },
  
  // Horizon Industries (c5) - 3 open, 1 overdue
  { id: 'a14', kind: 'action', title: 'Integrate 360-degree feedback module', customerId: 'c5', owner: 'Vikram Mehta', due: '2026-10-28', status: 'Delayed', priority: 'Medium', closure: '', description: 'Add 360-degree feedback to performance review system', confirmationRequired: false, confirmed: false, progress: 65 },
  { id: 'a15', kind: 'action', title: 'Develop technical recruitment strategy', customerId: 'c5', owner: 'Vikram Mehta', due: '2026-11-12', status: 'In Progress', priority: 'High', closure: '', description: 'New recruitment channels for specialized technical roles', confirmationRequired: false, confirmed: false, progress: 40 },
  { id: 'a16', kind: 'action', title: 'HR analytics dashboard Phase 2', customerId: 'c5', owner: 'Vikram Mehta', due: '2026-11-30', status: 'Open', priority: 'Medium', closure: '', description: 'Attrition prediction and talent pipeline analytics', confirmationRequired: true, confirmed: false, progress: 10 },
  
  // Summit Energy (c6) - 1 open
  { id: 'a17', kind: 'action', title: 'Document operational excellence best practices', customerId: 'c6', owner: 'Priya Sharma', due: '2026-11-18', status: 'In Progress', priority: 'Low', closure: '', description: 'Create shareable best practices documentation', confirmationRequired: false, confirmed: false, progress: 55 },
  
  // Pacific Retail (c7) - 5 open, 2 overdue
  { id: 'a18', kind: 'action', title: 'Deploy logistics tracking solution', customerId: 'c7', owner: 'Arjun Nair', due: '2026-10-18', status: 'Delayed', priority: 'High', closure: '', description: 'Real-time shipment tracking for customer visibility', confirmationRequired: true, confirmed: false, progress: 50 },
  { id: 'a19', kind: 'action', title: 'Resolve vendor payment term issues', customerId: 'c7', owner: 'Rahul Desai', due: '2026-10-25', status: 'Delayed', priority: 'High', closure: '', description: 'Address vendor complaints about payment terms', confirmationRequired: false, confirmed: false, progress: 70 },
  { id: 'a20', kind: 'action', title: 'Supply chain visibility dashboard', customerId: 'c7', owner: 'Arjun Nair', due: '2026-11-08', status: 'In Progress', priority: 'High', closure: '', description: 'End-to-end supply chain visibility solution', confirmationRequired: true, confirmed: false, progress: 45 },
  { id: 'a21', kind: 'action', title: 'Carrier performance review', customerId: 'c7', owner: 'Arjun Nair', due: '2026-11-15', status: 'Open', priority: 'Medium', closure: '', description: 'Quarterly review of carrier performance metrics', confirmationRequired: false, confirmed: false, progress: 0 },
  { id: 'a22', kind: 'action', title: 'Implement demand forecasting', customerId: 'c7', owner: 'Sneha Patel', due: '2026-11-28', status: 'Open', priority: 'Medium', closure: '', description: 'AI-based demand forecasting for inventory optimization', confirmationRequired: false, confirmed: false, progress: 15 },
  
  // Continental Manufacturing (c8) - 2 open
  { id: 'a23', kind: 'action', title: 'Quality KPI automation', customerId: 'c8', owner: 'Arjun Nair', due: '2026-11-10', status: 'In Progress', priority: 'Medium', closure: '', description: 'Automate quality KPI calculation and reporting', confirmationRequired: false, confirmed: false, progress: 60 },
  { id: 'a24', kind: 'action', title: 'Process documentation update', customerId: 'c8', owner: 'Arjun Nair', due: '2026-11-22', status: 'Open', priority: 'Low', closure: '', description: 'Annual update of process documentation', confirmationRequired: false, confirmed: false, progress: 25 },
  
  // Closed actions for history
  { id: 'a25', kind: 'action', title: 'ERP migration support completion', customerId: 'c1', owner: 'Priya Sharma', due: '2026-08-15', status: 'Closed', priority: 'Critical', closure: 'Successfully migrated all production data with zero data loss. Signed off by Atlas IT team.', confirmationRequired: true, confirmed: true, progress: 100 },
  { id: 'a26', kind: 'action', title: 'Quality metrics dashboard delivery', customerId: 'c8', owner: 'Arjun Nair', due: '2026-07-30', status: 'Closed', priority: 'High', closure: 'Dashboard deployed and training completed for 25 users.', confirmationRequired: true, confirmed: true, progress: 100 },
  { id: 'a27', kind: 'action', title: 'Compliance automation implementation', customerId: 'c6', owner: 'Priya Sharma', due: '2026-09-10', status: 'Closed', priority: 'High', closure: 'Automated compliance reporting saving 40 hours/month. Customer confirmed satisfaction.', confirmationRequired: true, confirmed: true, progress: 100 },
  { id: 'a28', kind: 'action', title: 'Invoice processing SLA improvement', customerId: 'c2', owner: 'Rahul Desai', due: '2026-09-25', status: 'Closed', priority: 'High', closure: 'Reduced processing time from 15 days to 4 days. New SLA met consistently.', confirmationRequired: true, confirmed: true, progress: 100 },
];

// ============================================================================
// MEETINGS
// ============================================================================

export const meetingRecords: RecordItem[] = [
  // Upcoming meetings
  { id: 'm1', kind: 'meeting', title: 'Q4 Quarterly Business Review', customerId: 'c1', date: '2026-11-02', time: '10:00', status: 'Scheduled', owner: 'Priya Sharma', type: 'Quarterly Business Review', location: 'Mumbai Office', participants: ['Priya Sharma', 'Arjun Mehta', 'Priyanka Iyer'] },
  { id: 'm2', kind: 'meeting', title: 'Infrastructure Roadmap Discussion', customerId: 'c3', date: '2026-11-03', time: '14:00', status: 'Scheduled', owner: 'Ananya Rao', type: 'Strategic Planning', location: 'Virtual - Teams', participants: ['Ananya Rao', 'Vikram Shah', 'Aisha Patel'] },
  { id: 'm3', kind: 'meeting', title: 'Monthly Financial Review', customerId: 'c2', date: '2026-11-05', time: '11:00', status: 'Scheduled', owner: 'Rahul Desai', type: 'Monthly Check-in', location: 'Virtual - Zoom', participants: ['Rahul Desai', 'Emma Wilson'] },
  { id: 'm4', kind: 'meeting', title: 'Strategic Sourcing Follow-up', customerId: 'c4', date: '2026-11-07', time: '09:00', status: 'Scheduled', owner: 'Sneha Patel', type: 'Service Review', location: 'New York Office', participants: ['Sneha Patel', 'Sarah Chen'] },
  { id: 'm5', kind: 'meeting', title: 'Supply Chain Review', customerId: 'c7', date: '2026-11-08', time: '15:00', status: 'Scheduled', owner: 'Arjun Nair', type: 'Issue Resolution', location: 'Virtual - Teams', participants: ['Arjun Nair', 'Michael Tan', 'Jennifer Wong'] },
  { id: 'm6', kind: 'meeting', title: 'HR Services Check-in', customerId: 'c5', date: '2026-11-10', time: '10:30', status: 'Scheduled', owner: 'Vikram Mehta', type: 'Monthly Check-in', location: 'Pune Office', participants: ['Vikram Mehta', 'Neha Kapoor'] },
  
  // Past meetings
  { id: 'm7', kind: 'meeting', title: 'Service Recovery Review', customerId: 'c1', date: '2026-10-17', time: '14:00', status: 'Completed', owner: 'Priya Sharma', type: 'Issue Resolution', location: 'Mumbai Office', participants: ['Priya Sharma', 'Arjun Mehta'], summary: 'Reviewed service recovery progress. Customer acknowledged improvements but wants to see sustained performance.' },
  { id: 'm8', kind: 'meeting', title: 'Escalation Review Meeting', customerId: 'c3', date: '2026-10-25', time: '11:00', status: 'Completed', owner: 'Ananya Rao', type: 'Escalation Review', location: 'Virtual - Teams', participants: ['Ananya Rao', 'Priya Sharma', 'Vikram Shah', 'Aisha Patel'], summary: 'Discussed ongoing infrastructure concerns. Agreed on executive escalation path and committed to infrastructure roadmap presentation by Nov 15.' },
  { id: 'm9', kind: 'meeting', title: 'Year-end Planning', customerId: 'c2', date: '2026-10-22', time: '10:00', status: 'Completed', owner: 'Rahul Desai', type: 'Strategic Planning', location: 'Virtual - Zoom', participants: ['Rahul Desai', 'Emma Wilson'], summary: 'Completed year-end financial planning. All deliverables on track.' },
  { id: 'm10', kind: 'meeting', title: 'Operations Excellence Workshop', customerId: 'c6', date: '2026-10-24', time: '09:00', status: 'Completed', owner: 'Priya Sharma', type: 'Service Review', location: 'Dubai Office', participants: ['Priya Sharma', 'Omar Hassan'], summary: 'Reviewed operational improvements. Customer highly satisfied with progress.' },
];

// ============================================================================
// ESCALATIONS
// ============================================================================

export const escalationRecords: RecordItem[] = [
  { id: 'e1', kind: 'escalation', title: 'Recurring system downtime unresolved', customerId: 'c3', severity: 'critical', status: 'In Progress', assignedTo: 'Ananya Rao', owner: 'Priya Sharma', category: 'Service', date: '2026-09-12', description: 'Fourth downtime incident this quarter despite prior commitments. CTO has escalated to executive level. Requires immediate recovery plan and root-cause analysis.' },
  { id: 'e2', kind: 'escalation', title: 'Service recovery milestones slipping', customerId: 'c1', severity: 'high', status: 'Under Review', assignedTo: 'Priya Sharma', owner: 'Priya Sharma', category: 'Timeline', date: '2026-10-18', description: 'Phase 2 of the service recovery plan is delayed. Atlas leadership wants assurance of sustained performance before the QBR.' },
  { id: 'e3', kind: 'escalation', title: 'Logistics tracking rollout delayed', customerId: 'c7', severity: 'high', status: 'Open', assignedTo: 'Arjun Nair', owner: 'Arjun Nair', category: 'Timeline', date: '2026-10-20', description: 'Real-time shipment tracking deployment is behind schedule, impacting customer visibility commitments.' },
  { id: 'e4', kind: 'escalation', title: 'Access management repeat complaints', customerId: 'c3', severity: 'medium', status: 'Resolved', assignedTo: 'Ananya Rao', owner: 'Ananya Rao', category: 'Service', date: '2026-08-28', description: 'Repeated access provisioning issues. Automated provisioning implemented and confirmed working by the customer.', resolutionNotes: 'Automated access provisioning deployed; no further recurrences in 30 days.' },
];

// ============================================================================
// COMBINED DEMO DATA (LEGACY FORMAT)
// ============================================================================

export const demo: RecordItem[] = [
  ...customers,
  ...feedbackRecords,
  ...actionItems,
  ...meetingRecords,
  ...escalationRecords,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const overdue = (r: RecordItem): boolean => {
  if (r.kind !== 'action') return false;
  if (r.status === 'Closed' || r.status === 'Cancelled') return false;
  if (!r.due) return false;
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return r.due < today;
};

export const getCustomerById = (id: string): RecordItem | undefined => {
  return customers.find(c => c.id === id);
};

export const getCustomerName = (id?: string): string => {
  if (!id) return 'Unknown Customer';
  return customers.find(c => c.id === id)?.title || 'Unknown Customer';
};

export const getOwnerInitials = (name?: string): string => {
  if (!name) return '??';
  return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getDaysUntil = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const today = new Date();
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSentimentColor = (sentiment?: string): string => {
  switch (sentiment) {
    case 'Positive': return 'teal';
    case 'Concerned': return 'amber';
    case 'Critical': return 'rose';
    default: return 'gray';
  }
};

export const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'Critical': return 'rose';
    case 'High': return 'amber';
    case 'Medium': return 'blue';
    default: return 'gray';
  }
};

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

export const getMonthlyFeedbackStats = (feedback:RecordItem[], now=new Date()) => {
  return Array.from({length:6},(_,i)=>{
    const date=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-5+i,1));
    const key=date.toISOString().slice(0,7);const rows=feedback.filter(r=>r.date?.startsWith(key));
    return {month:date.toLocaleDateString('en-US',{month:'short',year:'2-digit',timeZone:'UTC'}),Positive:rows.filter(r=>r.sentiment==='Positive').length,Neutral:rows.filter(r=>r.sentiment==='Neutral').length,Concerned:rows.filter(r=>r.sentiment==='Concerned').length,Critical:rows.filter(r=>r.sentiment==='Critical').length,total:rows.length};
  });
};
export const getFeedbackByCategory=(feedback:RecordItem[])=>[...new Set(feedback.map(r=>r.category||'General Feedback'))].map(category=>({category,count:feedback.filter(r=>(r.category||'General Feedback')===category).length})).sort((a,b)=>b.count-a.count);
export const getFeedbackByFunction=(feedback:RecordItem[],customers:RecordItem[])=>[...new Set(customers.map(c=>c.function||'Unassigned'))].map(fn=>({function:fn,count:feedback.filter(f=>(customers.find(c=>c.id===f.customerId)?.function||'Unassigned')===fn).length}));
export const getActionsByStatus=(actions:RecordItem[])=>['Open','In Progress','Delayed','Closed'].map(status=>({status,count:actions.filter(a=>a.status===status).length}));
export const getCustomerRiskMetrics=(customers:RecordItem[],actions:RecordItem[])=>customers.map(c=>{
  const linked=actions.filter(a=>a.customerId===c.id);const late=linked.filter(overdue).length;
  return {id:c.id,name:c.title,sentiment:c.sentiment,overdueActions:late,openActions:linked.filter(a=>a.status!=='Closed'&&a.status!=='Cancelled').length,lastInteraction:c.lastInteraction,riskScore:(c.sentiment==='Critical'?30:c.sentiment==='Concerned'?20:0)+late*10};
}).filter(c=>c.riskScore>0).sort((a,b)=>b.riskScore-a.riskScore);
