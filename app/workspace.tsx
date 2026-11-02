'use client';

import { reminders } from '../lib/reminders';
import { DeviceAccess } from '../components/device-access';
import { JobStatus } from '../components/job-status';
import { WorkspaceAccess } from '../components/workspace-access';
import type { Membership } from '../lib/policy';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, Building2, MessagesSquare, MessageSquareText, ListTodo, FileText,
  ChartNoAxesCombined, CalendarDays, Bell, Settings, Search, Plus, ChevronDown,
  ArrowUpRight, ArrowRight, ArrowLeft, MoreHorizontal, PanelLeftClose, Check, Clock,
  TriangleAlert, X, Download, ShieldCheck, CheckCircle2, Users, Activity, Sparkles,
  TrendingUp, TrendingDown, AlertCircle, Target, Filter, Calendar, User, Mail,
  Phone, MapPin, Briefcase, Eye, Edit2, Trash2, Copy, ExternalLink, Mic, Paperclip,
  ChevronRight, Star, Zap, BarChart3, PieChart, ArrowDownRight, RefreshCw, Grip,
  Circle, CircleDot, Square, CheckSquare, Flag, Hash, Bookmark, Archive, Send,
  ShieldAlert, UserPlus, FileUp, Image as ImageIcon, File as FileIcon, CheckCheck
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  demo, overdue, customers, feedbackRecords, actionItems, meetingRecords,
  getOwnerInitials, getMonthlyFeedbackStats, getFeedbackByCategory,
  getFeedbackByFunction, getActionsByStatus, getCustomerRiskMetrics, gccLeaders as demoLeaders,
  businessFunctions, feedbackCategories, meetingTypes, stakeholders,
  type RecordItem
} from '../lib/data';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const navigation = [
  ['Overview', LayoutDashboard, 'dashboard'],
  ['Customer 360°', Building2, 'customers'],
  ['Meetings & Interactions', MessagesSquare, 'meetings'],
  ['Feedback Hub', MessageSquareText, 'feedback'],
  ['Action Tracker', ListTodo, 'actions'],
  ['Escalations', ShieldAlert, 'escalations'],
  ['Customer Briefs', FileText, 'briefs'],
  ['Analytics & Insights', ChartNoAxesCombined, 'analytics'],
  ['Calendar', CalendarDays, 'calendar'],
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const initials = (s: string) => s?.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() || '??';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatShortDate(dateStr);
};

const getDaysUntil = (dateStr?: string) => {
  if (!dateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getCurrentGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Attachment helpers (demo: files stored as base64 data URLs)
type Attachment = { id?:string; name: string; type: string; size: number; dataUrl?: string };

const readFileAsDataUrl = (file: File): Promise<Attachment> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: reader.result as string,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageAttachment = (a: Attachment) => a.type?.startsWith('image/');

// ============================================================================
// BADGE COMPONENT
// ============================================================================

function Badge({ value, size = 'default', variant }: { value?: string; size?: 'small' | 'default'; variant?: string }) {
  const className = useMemo(() => {
    const base = size === 'small' ? 'badge badge-sm' : 'badge';
    const v = (variant || value || '').toLowerCase().replace(/\s+/g, '-');
    return `${base} ${v}`;
  }, [value, size, variant]);
  
  return <span className={className}><span className="badge-dot" /> {value || 'Neutral'}</span>;
}

// ============================================================================
// PRIORITY INDICATOR
// ============================================================================

function PriorityBadge({ priority }: { priority?: string }) {
  const config = {
    Critical: { color: 'rose', icon: Flag },
    High: { color: 'amber', icon: ArrowUpRight },
    Medium: { color: 'blue', icon: Circle },
    Low: { color: 'gray', icon: ArrowDownRight },
  };
  const p = config[priority as keyof typeof config] || config.Medium;
  const Icon = p.icon;
  return (
    <span className={`priority-badge priority-${p.color}`}>
      <Icon size={10} /> {priority || 'Medium'}
    </span>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel,
  status,
  onClick 
}: {
  label: string;
  value: string | number;
  icon: typeof LayoutDashboard;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  status?: 'default' | 'warning' | 'success' | 'danger';
  onClick?: () => void;
}) {
  return (
    <button className={`stat-card ${status || ''}`} onClick={onClick}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <Icon size={18} className="stat-card-icon" />
      </div>
      <div className="stat-card-value">
        {value}
        {trendLabel && (
          <span className={`stat-trend ${trend || ''}`}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trendLabel}
          </span>
        )}
      </div>
      {status === 'warning' && <span className="stat-card-status">Needs attention</span>}
      {status === 'success' && <span className="stat-card-status success">On track</span>}
    </button>
  );
}

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

function Avatar({ 
  name, 
  size = 'default',
  variant = 0,
  image
}: { 
  name: string; 
  size?: 'xs' | 'small' | 'default' | 'large' | 'xl';
  variant?: number;
  image?: string;
}) {
  const sizeClass = `avatar avatar-${size}`;
  const toneClass = `tone-${variant % 4}`;
  
  if (image) {
    return <img src={image} alt={name} className={`${sizeClass} ${toneClass}`} />;
  }
  
  return <span className={`${sizeClass} ${toneClass}`}>{initials(name)}</span>;
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  onAction
}: {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon size={32} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="btn-primary" onClick={onAction}>
          <Plus size={16} /> {action}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

function Skeleton({ variant = 'text', count = 1 }: { variant?: 'text' | 'card' | 'row'; count?: number }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${variant}`} />
      ))}
    </div>
  );
}

// ============================================================================
// SEVERITY BADGE (ESCALATIONS)
// ============================================================================

function SeverityBadge({ severity }: { severity?: string }) {
  const config: Record<string, { color: string; label: string }> = {
    critical: { color: 'rose', label: 'Critical' },
    high: { color: 'amber', label: 'High' },
    medium: { color: 'blue', label: 'Medium' },
  };
  const s = config[(severity || 'high').toLowerCase()] || config.high;
  return (
    <span className={`priority-badge priority-${s.color}`}>
      <ShieldAlert size={10} /> {s.label}
    </span>
  );
}

// ============================================================================
// ATTACHMENT UPLOADER
// ============================================================================

function AttachmentUploader({
  attachments,
  onChange, recordId, sample,
}: {
  recordId?:string; sample:boolean;
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
}) {
  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      if(attachments.length+files.length>10)throw Error('Maximum 10 attachments per record.');
      const read:Attachment[]=[];
      for(const file of Array.from(files)) {
        if(file.size>5*1024*1024)throw Error('Maximum file size is 5 MB.');
        if(sample){read.push(await readFileAsDataUrl(file));continue;}
        if(!recordId)throw Error('Save this record first, then reopen it to attach evidence.');
        const data=new FormData();data.set('file',file);data.set('recordId',recordId);
        const res=await fetch('/api/files',{method:'POST',body:data});const result=await res.json() as Attachment & {error?:string};
        if(!res.ok)throw Error(result.error);read.push(result);
      }
      onChange([...attachments,...read]);
    }catch(e){alert((e as Error).message);}
  };

  return (
    <div className="attachment-uploader">
      <label className="attachment-upload-btn">
        <Paperclip size={14} /> Attach files
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,application/pdf"
          style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.currentTarget.value = ''; }}
        />
      </label>
      {attachments.length > 0 && (
        <div className="attachment-chips">
          {attachments.map((a, i) => (
            <span key={i} className="attachment-chip">
              {isImageAttachment(a) ? <ImageIcon size={12} /> : <FileIcon size={12} />}
              <span className="attachment-chip-name" title={a.name}>{a.name}</span>
              <small>{formatFileSize(a.size)}</small>
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => onChange(attachments.filter((_, idx) => idx !== i))}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ATTACHMENT LIST (DETAIL VIEWS)
// ============================================================================

function AttachmentList({ attachments }: { attachments?: unknown }) {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  const list = attachments as Attachment[];
  return (
    <div className="attachment-list">
      {list.map((a, i) => (
        <a
          key={i}
          href={a.id ? `/api/files?id=${encodeURIComponent(a.id)}` : a.dataUrl}
          download={a.name}
          className="attachment-list-item"
          target="_blank"
          rel="noopener noreferrer"
        >
          {isImageAttachment(a) ? (
            <img src={a.id ? undefined : a.dataUrl} alt={a.name} className="attachment-thumb" />
          ) : (
            <span className="attachment-thumb file"><FileIcon size={18} /></span>
          )}
          <span className="attachment-list-info">
            <strong title={a.name}>{a.name}</strong>
            <small>{formatFileSize(a.size)}</small>
          </span>
          <Download size={14} />
        </a>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN WORKSPACE COMPONENT
// ============================================================================

export default function Workspace({ signedIn, userName }: { signedIn: boolean; userName: string }) {
  // State management
  const [rows, setRows] = useState<RecordItem[]>(signedIn ? [] : demo);
  const [page, setPage] = useState('Overview');
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [functionFilter, setFunctionFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [tab, setTab] = useState('Overview');
  const [modal, setModal] = useState<string | null>(null);
  const [edit, setEdit] = useState<RecordItem | null>(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!signedIn);
  const [board, setBoard] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMore,setMobileMore]=useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [sample, setSample] = useState(!signedIn);
  const [loadError, setLoadError] = useState('');
  const [serverAlerts,setServerAlerts]=useState<ReturnType<typeof reminders>>([]);
  const [searchPage,setSearchPage]=useState(1);
  const [searchResults,setSearchResults]=useState<{rows:RecordItem[];total:number}>({rows:[],total:0});
  const [searchBusy,setSearchBusy]=useState(false);
  const [members, setMembers] = useState<Membership[]>([]);
  const [member, setMember] = useState<Membership | null>(null);
  const gccLeaders = sample ? demoLeaders : members.filter(m=>m.active).map(m=>({id:m.email,name:m.name,email:m.email,role:m.role,department:m.functions.join(', ')}));
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [captureMode, setCaptureMode] = useState<'quick' | 'detailed'>('quick');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Feature state: modal-local collections synced into saved record
  const [modalStakeholders, setModalStakeholders] = useState<{ name: string; title: string; criticality: string }[]>([]);
  const [modalParticipants, setModalParticipants] = useState<string[]>([]);
  const [modalAttachments, setModalAttachments] = useState<Attachment[]>([]);
  // Notifications marked read (in addition to the legacy "mark all" flag)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [notifyPrefs, setNotifyPrefs] = useState<Record<string, boolean>>({
    overdue: true,
    meetings: true,
    critical: true,
    escalations: true,
  });

  // Data derivations
  const allCustomers = useMemo<RecordItem[]>(() => rows.filter(r => r.kind === 'customer').map(c=>{
    const feedback=rows.filter(r=>r.kind==='feedback'&&r.customerId===c.id).sort((a,b)=>(b.date||'').localeCompare(a.date||'') || (b.version||'').localeCompare(a.version||''));
    const latest=feedback[0];return {...c,sentiment:latest?.sentiment||c.sentiment,lastInteraction:latest?.date||c.lastInteraction};
  }), [rows]);
  const getCustomerName = (id?: string) => allCustomers.find(c=>c.id===id)?.title || 'Customer';
  const allActions = useMemo(() => rows.filter(r => r.kind === 'action'), [rows]);
  const allFeedback = useMemo(() => rows.filter(r => r.kind === 'feedback'), [rows]);
  const allMeetings = useMemo(() => rows.filter(r => r.kind === 'meeting').sort((a, b) => (a.date || '').localeCompare(b.date || '')), [rows]);
  
  const overdueActions = useMemo(() => allActions.filter(overdue), [allActions]);
  const openActions = useMemo(() => allActions.filter(r => r.status !== 'Closed' && r.status !== 'Cancelled'), [allActions]);
  const criticalCustomers = useMemo(() => allCustomers.filter(c => c.sentiment === 'Critical'), [allCustomers]);
  const concernedCustomers = useMemo(() => allCustomers.filter(c => c.sentiment === 'Concerned'), [allCustomers]);
  
  const selectedCustomer = useMemo(() => allCustomers.find(r => r.id === selected), [allCustomers, selected]);
  
  const upcomingMeetings = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return allMeetings.filter(m => m.date && m.date >= today && m.status === 'Scheduled');
  }, [allMeetings]);

  const allEscalations = useMemo(
    () => rows.filter(r => r.kind === 'escalation').sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [rows]
  );
  const openEscalations = useMemo(
    () => allEscalations.filter(e => e.status !== 'Resolved' && e.status !== 'Closed'),
    [allEscalations]
  );

  const criticalFeedback = useMemo(
    () => allFeedback.filter(f => f.sentiment === 'Critical'),
    [allFeedback]
  );

  // Generated notification feed from actionable signals
  const generatedNotifications=useMemo(()=>(sample?reminders(rows,new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'})):serverAlerts).filter(n=>notifyPrefs[n.category]),[sample,rows,serverAlerts,notifyPrefs]);
  useEffect(()=>{
    if(!signedIn||!loaded)return;
    let active=true;
    const refresh=async()=>{try{const r=await fetch('/api/notifications');if(r.ok&&active)setServerAlerts(await r.json() as ReturnType<typeof reminders>);}catch{/* Retry on the next poll. */}};
    void refresh();const interval=setInterval(refresh,60000);return()=>{active=false;clearInterval(interval);};
  },[signedIn,loaded,rows]);
  useEffect(()=>{setSearchPage(1);},[query,ownerFilter,functionFilter,sentimentFilter,dateRangeFilter]);
  useEffect(()=>{
    if(sample||page!=='Search')return;
    const controller=new AbortController();setSearchBusy(true);
    const timer=setTimeout(async()=>{try{
      const params=new URLSearchParams({q:query,ownerEmail:ownerFilter,function:functionFilter,sentiment:sentimentFilter,from:dateRangeFilter.start,to:dateRangeFilter.end,page:String(searchPage)});
      const response=await fetch('/api/search?'+params,{signal:controller.signal});if(!response.ok)throw Error('Search is temporarily unavailable.');
      setSearchResults(await response.json() as {rows:RecordItem[];total:number});
    }catch(e){if(!controller.signal.aborted)setToast((e as Error).message);}finally{if(!controller.signal.aborted)setSearchBusy(false);}},200);
    return()=>{clearTimeout(timer);controller.abort();};
  },[sample,page,query,ownerFilter,functionFilter,sentimentFilter,dateRangeFilter,searchPage,rows]);

  const unreadCount = useMemo(
    () => (notificationsRead ? 0 : generatedNotifications.filter(n => !readNotifications.has(n.id)).length),
    [generatedNotifications, readNotifications, notificationsRead]
  );

  // Metrics calculations
  const metrics = useMemo(() => {
    const totalFeedback = allFeedback.length;
    const positiveFeedback = allFeedback.filter(f => f.sentiment === 'Positive').length;
    const closedActions = allActions.filter(a => a.status === 'Closed').length;
    
    return {
      totalCustomers: allCustomers.length,
      totalInteractions: allFeedback.length,
      openCommitments: openActions.length,
      overdueCommitments: overdueActions.length,
      positiveRate: totalFeedback ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
      closureRate: allActions.length ? Math.round((closedActions / allActions.length) * 100) : 0,
      criticalRelationships: criticalCustomers.length,
      concernedRelationships: concernedCustomers.length,
    };
  }, [allCustomers, allFeedback, allActions, openActions, overdueActions, criticalCustomers, concernedCustomers]);

  // Chart data
  const sentimentChartData = useMemo(() => getMonthlyFeedbackStats(allFeedback), [allFeedback]);
  const categoryChartData = useMemo(() => getFeedbackByCategory(allFeedback), [allFeedback]);
  const functionChartData = useMemo(() => getFeedbackByFunction(allFeedback, allCustomers), [allFeedback, allCustomers]);
  const actionStatusData = useMemo(() => getActionsByStatus(allActions), [allActions]);
  const riskMetrics = useMemo(() => getCustomerRiskMetrics(allCustomers, allActions), [allCustomers, allActions]);

  // Leader-wise connects data
  const leaderConnects = useMemo(() => {
    const leaderMap = new Map<string, { customers: Set<string>; interactions: number; openActions: number }>();
    allCustomers.forEach(c => {
      if (!c.owner) return;
      if (!leaderMap.has(c.owner)) {
        leaderMap.set(c.owner, { customers: new Set(), interactions: 0, openActions: 0 });
      }
      leaderMap.get(c.owner)!.customers.add(c.id);
    });
    allFeedback.forEach(f => {
      if (!f.owner) return;
      if (!leaderMap.has(f.owner)) {
        leaderMap.set(f.owner, { customers: new Set(), interactions: 0, openActions: 0 });
      }
      leaderMap.get(f.owner)!.interactions++;
    });
    openActions.forEach(a => {
      if (!a.owner) return;
      if (!leaderMap.has(a.owner)) {
        leaderMap.set(a.owner, { customers: new Set(), interactions: 0, openActions: 0 });
      }
      leaderMap.get(a.owner)!.openActions++;
    });
    return Array.from(leaderMap.entries())
      .map(([leader, data]) => ({
        leader,
        customers: data.customers.size,
        interactions: data.interactions,
        openActions: data.openActions,
      }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [allCustomers, allFeedback, openActions]);

  // Action ageing data
  const actionAgeingData = useMemo(() => {
    const today = new Date();
    const ranges = [
      { range: '0-7 days', min: 0, max: 7, severity: 'green' },
      { range: '8-14 days', min: 8, max: 14, severity: 'amber' },
      { range: '15-30 days', min: 15, max: 30, severity: 'amber' },
      { range: '30+ days', min: 31, max: Infinity, severity: 'red' },
    ];
    return ranges.map(r => {
      const count = openActions.filter(a => {
        if (!a.due) return false;
        const dueDate = new Date(a.due);
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= r.min && daysDiff <= r.max;
      }).length;
      return { ...r, count };
    });
  }, [openActions]);

  // Persisted membership and per-user notification state.
  const refreshWorkspace = useCallback(async () => {
    if (!signedIn) return;
    const res=await fetch('/api/workspace'); const data=await res.json() as {error?:string;members:Membership[];member:Membership;preferences?:{read:string[];prefs:Record<string,boolean>}};
    if(!res.ok) throw Error(data.error);
    setMembers(data.members); setMember(data.member);
    if(data.preferences){setReadNotifications(new Set(data.preferences.read));setNotifyPrefs(data.preferences.prefs);}
  },[signedIn]);
  useEffect(()=>{refreshWorkspace().catch(e=>setToast(e.message));},[refreshWorkspace]);
  const savePreferences = async (read:Set<string>, prefs:Record<string,boolean>) => {
    if(!signedIn) return;
    const r=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'preferences',data:{read:[...read],prefs}})});
    if(!r.ok) setToast('Could not save notification preferences. Please retry.');
  };
  // Effects
  useEffect(() => {
    if (signedIn) {
      fetch('/api/records')
        .then(async r => {
          if (!r.ok) throw Error(((await r.json()) as { error: string }).error);
          return r.json() as Promise<RecordItem[]>;
        })
        .then(r => {
          setRows(r);
          setSample(false);
          setLoadError('');
          setLoaded(true);
        })
        .catch(e => {
          setLoadError(e.message);
          setLoaded(false);
        });
    }
  }, [signedIn]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        if (modal) setModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  // Navigation handlers
  const navigateTo = useCallback((p: string) => {
    setPage(p);
    setSelected(null);
    setFilter('All');
    setSentimentFilter('All');
    setOwnerFilter('All');
    setFunctionFilter('All');
    setDateRangeFilter({ start: '', end: '' });
    setQuery('');
    setTab('Overview');
  }, []);

  const openCustomerProfile = useCallback((id: string) => {
    setSelected(id);
    setPage('Customer 360°');
    setTab('Overview');
  }, []);

  const openModal = useCallback((kind: string, record?: RecordItem) => {
    setEdit(record || null);
    setModal(kind);
    setCaptureMode('quick');
    setVoiceText(record?.title || '');
    // Hydrate modal-local collections from the record being edited
    setModalStakeholders(
      Array.isArray(record?.additionalStakeholders)
        ? (record!.additionalStakeholders as { name: string; title: string; criticality: string }[])
        : []
    );
    setModalParticipants(
      Array.isArray(record?.participants) ? (record!.participants as string[]) : []
    );
    setModalAttachments(
      Array.isArray(record?.attachments) ? (record!.attachments as Attachment[]) : []
    );
  }, []);

  // Notification read helpers
  const isNotifRead = useCallback(
    (id: string) => notificationsRead || readNotifications.has(id),
    [notificationsRead, readNotifications]
  );

  const markNotifRead = useCallback((id: string) => {
    setReadNotifications(prev => {
      const next = new Set(prev);
      next.add(id);
      void savePreferences(next,notifyPrefs);
      return next;
    });
  }, [notifyPrefs, signedIn]);

  const markAllNotifsRead = useCallback(() => {
    setReadNotifications(new Set(generatedNotifications.map(n => n.id)));
    void savePreferences(new Set(generatedNotifications.map(n=>n.id)),notifyPrefs);
  }, [generatedNotifications,notifyPrefs,signedIn]);

  // Notifications grouped by type for the Notifications page
  const notificationGroups = useMemo(() => {
    const groups: {
      key: string;
      label: string;
      icon: typeof Bell;
      iconTone: 'warning' | 'info';
      items: typeof generatedNotifications;
    }[] = [
      { key: 'commitments', label: 'Commitments', icon: TriangleAlert, iconTone: 'warning', items: [] },
      { key: 'meetings', label: 'Meetings', icon: CalendarDays, iconTone: 'info', items: [] },
      { key: 'feedback', label: 'Feedback', icon: MessageSquareText, iconTone: 'warning', items: [] },
    ];
    const byKey = {
      overdue: groups[0],
      escalations: groups[0],
      meetings: groups[1],
      critical: groups[2],
    } as const;
    generatedNotifications.forEach(n => {
      byKey[n.category]?.items.push(n);
    });
    return groups.filter(g => g.items.length > 0);
  }, [generatedNotifications]);

  // Filtering
  const filterRecords = useCallback((list: RecordItem[]) => {
    return list.filter(r => {
      const searchStr = `${r.title} ${getCustomerName(r.customerId)} ${r.owner} ${r.function} ${r.category || ''} ${r.stakeholder || ''}`.toLowerCase();
      const matchesQuery = !query || searchStr.includes(query.toLowerCase());
      const matchesFilter = filter === 'All' || 
        (filter === 'Overdue' ? overdue(r) : (r.sentiment === filter || r.status === filter || r.priority === filter));
      const matchesSentiment = sentimentFilter === 'All' || r.sentiment === sentimentFilter;
      const matchesOwner = ownerFilter === 'All' || r.owner === ownerFilter || r.ownerEmail === ownerFilter;
      const matchesFunction = functionFilter === 'All' || r.function === functionFilter || 
        (r.customerId && allCustomers.find(c => c.id === r.customerId)?.function === functionFilter);
      const matchesDateRange = (!dateRangeFilter.start || !r.date || r.date >= dateRangeFilter.start) &&
        (!dateRangeFilter.end || !r.date || r.date <= dateRangeFilter.end);
      return matchesQuery && matchesFilter && matchesSentiment && matchesOwner && matchesFunction && matchesDateRange;
    });
  }, [query, filter, sentimentFilter, ownerFilter, functionFilter, dateRangeFilter, allCustomers]);

  // Voice input handler using Web Speech API
  const startVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToast('Voice input not supported in this browser');
      return;
    }
    const speechWindow = window as unknown as {webkitSpeechRecognition?: new () => SpeechRecognizer; SpeechRecognition?: new () => SpeechRecognizer};
    const SpeechRecognition = speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;
    if(!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => {
      setIsRecording(false);
      setToast('Voice input error. Please try again.');
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.start();
  }, []);

  // Save handler
  const handleSave = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      ...edit,
      ...Object.fromEntries(fd.entries()),
      ...(selected && modal !== 'customer' ? { customerId: selected } : {}),
      ownerEmail: sample ? undefined : String(fd.get('ownerEmail') || edit?.ownerEmail || member?.email || ''),
      owner: sample ? String(fd.get('owner') || '') : (members.find(m=>m.email===fd.get('ownerEmail'))?.name || edit?.owner || member?.name),
      sensitive: fd.get('sensitive') === 'on',
      allowedEmails: String(fd.get('allowedEmails') || '').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean),
      confirmationRequired: fd.get('confirmationRequired') === 'on',
      confirmed: fd.get('confirmed') === 'on',
      ...(modal === 'customer' ? { additionalStakeholders: modalStakeholders } : {}),
      ...(modal === 'meeting' ? { participants: modalParticipants } : {}),
      ...(modal === 'action' || modal === 'feedback' ? { attachments: modalAttachments } : {}),
    } as RecordItem;

    // Validation
    if (modal === 'action' && data.status === 'Closed') {
      if (!data.closure) {
        setToast('Please add closure notes before closing this action.');
        return;
      }
      if (data.confirmationRequired && !data.confirmed) {
        setToast('Customer confirmation is required to close this action.');
        return;
      }
    }

    setBusy(true);
    try {
      let result: RecordItem;
      if (sample) {
        result = { ...data, id: edit?.id || crypto.randomUUID(), kind: modal! };
        setToast('Saved for this preview session. Sign in for persistent storage.');
      } else {
        const res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: edit?.id || undefined, version:edit?.version, kind: modal, data }),
        });
        result = await res.json();
        if (!res.ok) throw Error(String((result as any).error));
        setToast('Successfully saved to your workspace');
      }
      setRows(old => [...old.filter(r => r.id !== result.id), result]);
      setModal(null);
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [edit, modal, sample, selected, modalStakeholders, modalParticipants, modalAttachments, member, members]);

  // Seed demo data
  const seedDemoData = useCallback(async () => {
    setBusy(true);
    try {
      const response=await fetch('/api/seed',{method:'POST'});
      const result=await response.json() as {error?:string}; if(!response.ok) throw Error(result.error);
      const data=await fetch('/api/records'); if(!data.ok) throw Error('Import finished; refresh to load records.');
      setRows(await data.json()); setSample(false);
      setToast('Demo workspace created with fictional data');
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  // ============================================================================
  // RENDER: CUSTOMER TABLE
  // ============================================================================

  const renderCustomerTable = (list: RecordItem[]) => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer / Business Unit</th>
            <th>Relationship Owner</th>
            <th>Function</th>
            <th>Sentiment</th>
            <th>Open Actions</th>
            <th>Last Interaction</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => (
            <tr key={c.id} onClick={() => openCustomerProfile(c.id)} className="table-row-clickable">
              <td>
                <div className="customer-cell">
                  <Avatar name={c.title} size="small" variant={i} />
                  <div>
                    <strong>{c.title}</strong>
                    <small>{c.location}</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="owner-cell">
                  <Avatar name={c.owner || ''} size="xs" variant={i + 1} />
                  <span>{c.owner}</span>
                </div>
              </td>
              <td><span className="function-badge">{c.function}</span></td>
              <td><Badge value={c.sentiment} /></td>
              <td>
                <span className="action-count">
                  {openActions.filter(a => a.customerId === c.id).length}
                  {overdueActions.some(a => a.customerId === c.id) && (
                    <span className="overdue-indicator">
                      <Clock size={12} /> overdue
                    </span>
                  )}
                </span>
              </td>
              <td><span className="date-text">{getRelativeTime(c.lastInteraction as string)}</span></td>
              <td><ArrowUpRight size={16} className="row-arrow" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && (
        <EmptyState
          icon={Building2}
          title="No customers found"
          description="Try adjusting your filters or add a new customer to get started."
          action="Add Customer"
          onAction={() => openModal('customer')}
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: CUSTOMER CARDS
  // ============================================================================

  const renderCustomerCards = (list: RecordItem[]) => (
    <div className="customer-cards-grid">
      {list.map((c, i) => (
        <button key={c.id} className="customer-card" onClick={() => openCustomerProfile(c.id)}>
          <div className="customer-card-header">
            <Avatar name={c.title} size="default" variant={i} />
            <Badge value={c.sentiment} size="small" />
          </div>
          <h3>{c.title}</h3>
          <p>{c.function} · {c.location}</p>
          <div className="customer-card-footer">
            <div className="customer-card-stat">
              <span className="stat-label">Open Actions</span>
              <span className="stat-value">{openActions.filter(a => a.customerId === c.id).length}</span>
            </div>
            <div className="customer-card-stat">
              <span className="stat-label">Last Contact</span>
              <span className="stat-value">{getRelativeTime(c.lastInteraction as string)}</span>
            </div>
          </div>
          <div className="customer-card-owner">
            <Avatar name={c.owner || ''} size="xs" variant={i + 1} />
            <span>{c.owner}</span>
          </div>
        </button>
      ))}
      {!list.length && (
        <EmptyState
          icon={Building2}
          title="No customers found"
          description="Try adjusting your filters or add a new customer to get started."
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: ACTION LIST
  // ============================================================================

  const renderActionList = (list: RecordItem[]) => (
    <div className={board ? 'kanban-board' : 'action-list'}>
      {(board ? ['Open', 'In Progress', 'Delayed', 'Closed'] : ['All']).map(status => (
        <div key={status} className={board ? 'kanban-column' : ''}>
          {board && (
            <div className="kanban-column-header">
              <h3>{status}</h3>
              <span className="count">{list.filter(a => a.status === status).length}</span>
            </div>
          )}
          {list.filter(a => status === 'All' || a.status === status).map(a => (
            <button 
              key={a.id} 
              className={`action-item ${overdue(a) ? 'overdue' : ''}`}
              onClick={() => openModal('action', a)}
            >
              <div className="action-item-check">
                {a.status === 'Closed' ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>
              <div className="action-item-content">
                <strong>{a.title}</strong>
                <div className="action-item-meta">
                  <span>{getCustomerName(a.customerId)}</span>
                  <span className="separator">·</span>
                  <span>{a.owner}</span>
                </div>
              </div>
              <div className="action-item-badges">
                <PriorityBadge priority={a.priority} />
                {Array.isArray(a.attachments) && (a.attachments as Attachment[]).length > 0 && (
                  <span className="attachment-count-badge">
                    <Paperclip size={11} /> {(a.attachments as Attachment[]).length}
                  </span>
                )}
                {overdue(a) ? (
                  <span className="due-badge overdue">
                    <Clock size={12} /> Overdue
                  </span>
                ) : (
                  <span className="due-badge">{formatShortDate(a.due)}</span>
                )}
              </div>
              <Badge value={a.status} size="small" />
              {overdue(a) && (
                <span
                  role="button"
                  tabIndex={0}
                  className="escalate-btn"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    openModal('escalation', {
                      id: '',
                      kind: 'escalation',
                      title: a.title,
                      customerId: a.customerId,
                      severity: a.priority === 'Critical' ? 'critical' : 'high',
                      status: 'Open',
                      description: a.description,
                      owner: a.owner,
                      assignedTo: a.owner,
                      actionId: a.id,
                    } as RecordItem);
                  }}
                  onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.click(); }}
                >
                  <ShieldAlert size={12} /> Escalate
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
      {!list.length && (
        <EmptyState
          icon={ListTodo}
          title="No actions found"
          description="All caught up! Create a new action to track commitments."
          action="Create Action"
          onAction={() => openModal('action')}
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: FEEDBACK LIST
  // ============================================================================

  const renderFeedbackList = (list: RecordItem[]) => (
    <div className="feedback-grid">
      {list.map(f => (
        <button key={f.id} className="feedback-card" onClick={() => openModal('feedback', f)}>
          <div className="feedback-card-header">
            <span className="feedback-category">{f.category}</span>
            <Badge value={f.sentiment} size="small" />
          </div>
          <h3>{f.title}</h3>
          <p>{f.description?.slice(0, 120)}{(f.description?.length || 0) > 120 ? '...' : ''}</p>
          <div className="feedback-card-footer">
            <span className="feedback-customer">{getCustomerName(f.customerId)}</span>
            <span className="feedback-date">{formatShortDate(f.date)}</span>
          </div>
          {Array.isArray(f.attachments) && (f.attachments as Attachment[]).length > 0 && (
            <span className="attachment-count-badge">
              <Paperclip size={11} /> {(f.attachments as Attachment[]).length}
            </span>
          )}
          <div className="feedback-card-owner">
            <Avatar name={f.owner || ''} size="xs" />
            <span>{f.owner}</span>
          </div>
          <span role="button" tabIndex={0} className="escalate-btn" onClick={ev=>{ev.stopPropagation();openModal('action',{id:'',kind:'action',title:f.title,customerId:f.customerId,feedbackId:f.id,status:'Open'});}} onKeyDown={ev=>{if(ev.key==='Enter')ev.currentTarget.click();}}>Create follow-up action</span>
          {f.sentiment === 'Critical' && (
            <span
              role="button"
              tabIndex={0}
              className="escalate-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                openModal('escalation', {
                  id: '',
                  kind: 'escalation',
                  title: f.title,
                  customerId: f.customerId,
                  severity: 'critical',
                  status: 'Open',
                  description: f.description,
                  owner: f.owner,
                  feedbackId: f.id,
                } as RecordItem);
              }}
              onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.click(); }}
            >
              <ShieldAlert size={12} /> Escalate
            </span>
          )}
        </button>
      ))}
      {!list.length && (
        <EmptyState
          icon={MessageSquareText}
          title="No feedback found"
          description="Capture customer feedback to build institutional memory."
          action="Capture Feedback"
          onAction={() => openModal('feedback')}
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: MEETINGS LIST
  // ============================================================================

  const renderMeetingsList = (list: RecordItem[]) => (
    <div className="meetings-list">
      {list.map(m => {
        const daysUntil = getDaysUntil(m.date);
        const isPast = daysUntil < 0;
        return (
          <button key={m.id} className={`meeting-item ${isPast ? 'past' : ''}`} onClick={() => openModal('meeting', m)}>
            <div className="meeting-date-box">
              <span className="month">{m.date?.slice(5, 7) === '11' ? 'NOV' : 'OCT'}</span>
              <span className="day">{m.date?.slice(8)}</span>
            </div>
            <div className="meeting-content">
              <strong>{m.title}</strong>
              <div className="meeting-meta">
                <span>{getCustomerName(m.customerId)}</span>
                <span className="separator">·</span>
                <span>{m.type || 'Meeting'}</span>
                <span className="separator">·</span>
                <span>{m.location || 'TBD'}</span>
              </div>
              {Array.isArray(m.participants) && (m.participants as string[]).length > 0 && (
                <div className="meeting-participants">
                  <span className="meeting-participants-avatars">
                    {(m.participants as string[]).slice(0, 4).map((p, pi) => (
                      <span key={pi} title={p}><Avatar name={p} size="xs" variant={pi} /></span>
                    ))}
                  </span>
                  <span className="meeting-participants-count">
                    <Users size={12} /> {(m.participants as string[]).length} participant{(m.participants as string[]).length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="meeting-status">
              <Badge value={m.status} size="small" />
              {daysUntil > 0 && daysUntil <= 3 && (
                <span className="meeting-soon">In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
              )}
            </div>
            {m.status==='Completed' && <span role="button" tabIndex={0} onClick={ev=>{ev.stopPropagation();openModal('feedback',{id:'',kind:'feedback',title:'',customerId:m.customerId,meetingId:m.id,date:m.date});}} onKeyDown={ev=>{if(ev.key==='Enter')ev.currentTarget.click();}}>Capture feedback</span>}
            <button 
              className="meeting-brief-link"
              onClick={(e) => {
                e.stopPropagation();
                openCustomerProfile(m.customerId!);
                setTab('Brief');
              }}
            >
              <FileText size={14} /> Brief
            </button>
          </button>
        );
      })}
      {!list.length && (
        <EmptyState
          icon={CalendarDays}
          title="No meetings scheduled"
          description="Schedule customer meetings to maintain relationship momentum."
          action="Schedule Meeting"
          onAction={() => openModal('meeting')}
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: ESCALATION LIST
  // ============================================================================

  const renderEscalationList = (list: RecordItem[]) => (
    <div className="escalation-list">
      {list.map(e => (
        <button key={e.id} className="escalation-item" onClick={() => openModal('escalation', e)}>
          <div className="escalation-item-main">
            <div className="escalation-item-title">
              <SeverityBadge severity={e.severity as string} />
              <strong>{e.title}</strong>
            </div>
            {e.description && (
              <p className="escalation-item-desc">
                {(e.description as string).slice(0, 140)}{(e.description as string).length > 140 ? '…' : ''}
              </p>
            )}
            <div className="escalation-item-meta">
              <span><Building2 size={12} /> {getCustomerName(e.customerId)}</span>
              <span className="separator">·</span>
              <span><User size={12} /> {(e.assignedTo as string) || e.owner || 'Unassigned'}</span>
              <span className="separator">·</span>
              <span><Clock size={12} /> {getRelativeTime(e.date)}</span>
            </div>
          </div>
          <Badge value={e.status} size="small" />
        </button>
      ))}
      {!list.length && (
        <EmptyState
          icon={ShieldAlert}
          title="No escalations found"
          description="No escalations match the current filters. Raise one from a critical feedback item or an overdue action."
          action="Raise Escalation"
          onAction={() => openModal('escalation')}
        />
      )}
    </div>
  );

  // ============================================================================
  // RENDER: CUSTOMER PROFILE
  // ============================================================================

  const renderCustomerProfile = () => {
    if (!selectedCustomer) return null;

    const customerFeedback = allFeedback.filter(f => f.customerId === selectedCustomer.id)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const customerActions = allActions.filter(a => a.customerId === selectedCustomer.id);
    const customerMeetings = allMeetings.filter(m => m.customerId === selectedCustomer.id);
    const customerOpenActions = customerActions.filter(a => a.status !== 'Closed' && a.status !== 'Cancelled');
    const customerOverdueActions = customerActions.filter(overdue);
    const customerStakeholders = (sample ? stakeholders : []).filter(s => s.customerId === selectedCustomer.id);
    const recordStakeholders = Array.isArray(selectedCustomer.additionalStakeholders)
      ? (selectedCustomer.additionalStakeholders as { name: string; title: string; criticality: string }[])
      : [];

    return (
      <>
        {/* Profile Header */}
        <div className="profile-header">
          <button className="back-button" onClick={() => setSelected(null)}>
            <ArrowLeft size={16} /> All Customers
          </button>
        </div>

        <div className="profile-summary-card">
          <div className="profile-summary-main">
            <Avatar name={selectedCustomer.title} size="xl" variant={0} />
            <div className="profile-summary-info">
              <div className="profile-name-row">
                <h1>{selectedCustomer.title}</h1>
                <Badge value={selectedCustomer.sentiment} />
              </div>
              <div className="profile-meta">
                <span><Briefcase size={14} /> {selectedCustomer.function}</span>
                <span><MapPin size={14} /> {selectedCustomer.location}</span>
                <span><User size={14} /> {selectedCustomer.owner}</span>
              </div>
              {selectedCustomer.stakeholder && (
                <div className="profile-stakeholder">
                  Primary Stakeholder: <strong>{selectedCustomer.stakeholder}</strong>
                  {selectedCustomer.stakeholderTitle && <span> · {selectedCustomer.stakeholderTitle as string}</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-summary-stats">
            <div className="profile-stat">
              <span className="value">{customerOpenActions.length}</span>
              <span className="label">Open Actions</span>
            </div>
            <div className="profile-stat warning">
              <span className="value">{customerOverdueActions.length}</span>
              <span className="label">Overdue</span>
            </div>
            <div className="profile-stat">
              <span className="value">{customerFeedback.length}</span>
              <span className="label">Interactions</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-secondary" onClick={() => openModal('customer', selectedCustomer)}>
              <Edit2 size={16} /> Edit
            </button>
            <button className="btn-secondary" onClick={() => openModal('meeting')}>
              <CalendarDays size={16} /> Schedule Meeting
            </button>
            <button className="btn-primary" onClick={() => setTab('Brief')}>
              <FileText size={16} /> Prepare Brief
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          {['Overview', 'Timeline', 'Feedback', 'Actions', 'Stakeholders', 'Analytics', 'Brief'].map(t => (
            <button 
              key={t} 
              className={`profile-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {tab === 'Overview' && (
            <div className="profile-overview">
              <div className="profile-grid">
                {/* Relationship Summary */}
                <section className="profile-section">
                  <h2>Relationship Summary</h2>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-card-icon sentiment">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4>Current Sentiment</h4>
                        <Badge value={selectedCustomer.sentiment} />
                        {selectedCustomer.previousSentiment && selectedCustomer.previousSentiment !== selectedCustomer.sentiment && (
                          <span className="sentiment-change">
                            Previously: {selectedCustomer.previousSentiment}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-card-icon interactions">
                        <MessagesSquare size={20} />
                      </div>
                      <div>
                        <h4>Total Interactions</h4>
                        <span className="summary-value">{customerFeedback.length}</span>
                        <span className="summary-note">Last: {getRelativeTime(selectedCustomer.lastInteraction as string)}</span>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className={`summary-card-icon ${customerOverdueActions.length ? 'warning' : 'success'}`}>
                        <ListTodo size={20} />
                      </div>
                      <div>
                        <h4>Open Commitments</h4>
                        <span className="summary-value">{customerOpenActions.length}</span>
                        {customerOverdueActions.length > 0 && (
                          <span className="summary-warning">{customerOverdueActions.length} overdue</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Recent Activity */}
                <section className="profile-section">
                  <div className="section-header">
                    <h2>Recent Activity</h2>
                    <button className="text-btn" onClick={() => setTab('Timeline')}>
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="activity-list">
                    {customerFeedback.slice(0, 3).map(f => (
                      <div key={f.id} className="activity-item">
                        <div className="activity-dot" />
                        <div className="activity-content">
                          <span className="activity-date">{formatShortDate(f.date)}</span>
                          <h4>{f.title}</h4>
                          <div className="activity-meta">
                            <Badge value={f.sentiment} size="small" />
                            <span>{f.owner}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Open Commitments */}
                <section className="profile-section full-width">
                  <div className="section-header">
                    <h2>Open Commitments</h2>
                    <button className="text-btn" onClick={() => setTab('Actions')}>
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  {renderActionList(customerOpenActions.slice(0, 5))}
                </section>
              </div>
            </div>
          )}

          {tab === 'Timeline' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Interaction Timeline</h2>
                <button className="btn-primary" onClick={() => openModal('feedback')}>
                  <Plus size={16} /> Add Interaction
                </button>
              </div>
              <div className="timeline">
                {customerFeedback.map((f, i) => (
                  <div key={f.id} className="timeline-item">
                    <div className="timeline-line" />
                    <div className="timeline-dot">
                      {f.sentiment === 'Positive' ? <CheckCircle2 size={16} /> :
                       f.sentiment === 'Critical' ? <AlertCircle size={16} /> :
                       f.sentiment === 'Concerned' ? <Clock size={16} /> :
                       <Circle size={16} />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-date">{formatDate(f.date)}</span>
                        <Badge value={f.category} size="small" variant="category" />
                      </div>
                      <h4>{f.title}</h4>
                      {f.description && <p>{f.description}</p>}
                      <AttachmentList attachments={f.attachments} />
                      <div className="timeline-footer">
                        <Badge value={f.sentiment} size="small" />
                        <span className="timeline-owner">
                          <Avatar name={f.owner || ''} size="xs" /> {f.owner}
                        </span>
                        <button className="timeline-action" onClick={() => openModal('feedback', f)}>
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'Feedback' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Feedback History</h2>
                <div className="section-actions">
                  <select 
                    value={sentimentFilter} 
                    onChange={e => setSentimentFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Concerned">Concerned</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <button className="btn-primary" onClick={() => openModal('feedback')}>
                    <Plus size={16} /> Capture Feedback
                  </button>
                </div>
              </div>
              {renderFeedbackList(filterRecords(customerFeedback))}
            </section>
          )}

          {tab === 'Actions' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Actions & Commitments</h2>
                <div className="section-actions">
                  <button 
                    className={`view-toggle ${board ? '' : 'active'}`}
                    onClick={() => setBoard(false)}
                  >
                    List
                  </button>
                  <button 
                    className={`view-toggle ${board ? 'active' : ''}`}
                    onClick={() => setBoard(true)}
                  >
                    Board
                  </button>
                  <button className="btn-primary" onClick={() => openModal('action')}>
                    <Plus size={16} /> Create Action
                  </button>
                </div>
              </div>
              {renderActionList(customerActions)}
            </section>
          )}

          {tab === 'Stakeholders' && (
            <section className="profile-section">
              <div className="section-header">
                <h2>Customer Stakeholders <span className="count-chip">{(selectedCustomer.stakeholder ? 1 : 0) + customerStakeholders.filter(s => !s.isPrimary).length + recordStakeholders.length}</span></h2>
                <button className="btn-secondary" onClick={() => openModal('customer', selectedCustomer)}>
                  <Plus size={16} /> Manage Stakeholders
                </button>
              </div>
              <div className="stakeholders-grid">
                {/* Primary Stakeholder */}
                {selectedCustomer.stakeholder && (
                  <div className="stakeholder-card primary">
                    <div className="stakeholder-badge">Primary</div>
                    <Avatar name={selectedCustomer.stakeholder} size="large" variant={0} />
                    <h3>{selectedCustomer.stakeholder}</h3>
                    <p>{selectedCustomer.stakeholderTitle as string}</p>
                    {selectedCustomer.stakeholderEmail && (
                      <a href={`mailto:${selectedCustomer.stakeholderEmail}`} className="stakeholder-contact">
                        <Mail size={14} /> {selectedCustomer.stakeholderEmail as string}
                      </a>
                    )}
                  </div>
                )}
                {/* Additional Stakeholders (seed data) */}
                {customerStakeholders.filter(s => !s.isPrimary).map((s, i) => (
                  <div key={s.id} className="stakeholder-card">
                    <Avatar name={s.name} size="large" variant={i + 1} />
                    <h3>{s.name}</h3>
                    <p>{s.title}</p>
                    <span className={`criticality-badge ${s.criticality}`}>{s.criticality}</span>
                  </div>
                ))}
                {/* Additional Stakeholders (added via Customer modal) */}
                {recordStakeholders.map((s, i) => (
                  <div key={`rs-${i}`} className="stakeholder-card">
                    <Avatar name={s.name} size="large" variant={i + 2} />
                    <h3>{s.name}</h3>
                    <p>{s.title}</p>
                    <span className={`criticality-badge ${s.criticality}`}>{s.criticality}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'Analytics' && (
            <section className="profile-section">
              <h2>Customer Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Sentiment Trend</h3>
                  <p className="analytics-note">Based on recorded feedback over time</p>
                  <div className="chart-container small">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getMonthlyFeedbackStats(customerFeedback)}>
                        <defs>
                          <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#178b79" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#178b79" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#e9eeed" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Positive" stroke="#148574" strokeWidth={2} fill="url(#fillGreen)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Feedback by Category</h3>
                  <div className="category-bars">
                    {categoryChartData.slice(0, 5).map(c => (
                      <div key={c.category} className="category-bar">
                        <span className="category-label">{c.category}</span>
                        <div className="category-bar-track">
                          <div 
                            className="category-bar-fill" 
                            style={{ width: `${(c.count / Math.max(...categoryChartData.map(x => x.count))) * 100}%` }}
                          />
                        </div>
                        <span className="category-count">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>Action Completion</h3>
                  <div className="completion-stats">
                    <div className="completion-stat">
                      <span className="completion-value">
                        {customerActions.length ? Math.round((customerActions.filter(a => a.status === 'Closed').length / customerActions.length) * 100) : 0}%
                      </span>
                      <span className="completion-label">Closure Rate</span>
                    </div>
                    <div className="completion-breakdown">
                      {['Open', 'In Progress', 'Delayed', 'Closed'].map(status => (
                        <div key={status} className="breakdown-item">
                          <span className={`breakdown-dot ${status.toLowerCase().replace(' ', '-')}`} />
                          <span>{status}</span>
                          <span className="breakdown-count">{customerActions.filter(a => a.status === status).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === 'Brief' && (
            <section className="customer-brief">
              <div className="brief-header">
                <div>
                  <span className="brief-label">CUSTOMER BRIEF · MEETING PREPARATION</span>
                  <h2>Ready for Your Next Conversation</h2>
                </div>
                <div className="brief-actions">
                  <button className="btn-secondary" onClick={() => window.print()}>
                    <Download size={16} /> Print / Save PDF
                  </button>
                  <button className="btn-primary" onClick={() => openModal('meeting')}>
                    <CalendarDays size={16} /> Schedule Meeting
                  </button>
                </div>
              </div>

              {/* Brief Content */}
              <div className="brief-content">
                <div className="brief-summary">
                  <div className="brief-customer">
                    <Avatar name={selectedCustomer.title} size="large" variant={0} />
                    <div>
                      <h3>{selectedCustomer.title}</h3>
                      <p>{selectedCustomer.stakeholder} · {selectedCustomer.owner}</p>
                      <div className="brief-meta">
                        <Badge value={selectedCustomer.sentiment} />
                        <span>Last interaction: {getRelativeTime(selectedCustomer.lastInteraction as string)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Commitments */}
                <div className="brief-section">
                  <h3><ListTodo size={18} /> Open Commitments ({customerOpenActions.length})</h3>
                  {customerOpenActions.length > 0 ? (
                    <div className="brief-list">
                      {customerOpenActions.map(a => (
                        <div key={a.id} className={`brief-item ${overdue(a) ? 'overdue' : ''}`}>
                          <div className="brief-item-main">
                            <strong>{a.title}</strong>
                            <span className="brief-item-owner">{a.owner}</span>
                          </div>
                          <div className="brief-item-meta">
                            <PriorityBadge priority={a.priority} />
                            <span className={overdue(a) ? 'overdue-text' : ''}>
                              {overdue(a) ? 'Overdue since' : 'Due'}: {formatShortDate(a.due)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="brief-empty">No open commitments — all caught up!</p>
                  )}
                </div>

                {/* Key Concerns */}
                <div className="brief-section">
                  <h3><AlertCircle size={18} /> Key Concerns</h3>
                  {customerFeedback.filter(f => f.sentiment === 'Concerned' || f.sentiment === 'Critical').length > 0 ? (
                    <div className="brief-list">
                      {customerFeedback
                        .filter(f => f.sentiment === 'Concerned' || f.sentiment === 'Critical')
                        .slice(0, 5)
                        .map(f => (
                          <div key={f.id} className="brief-item concern">
                            <strong>{f.title}</strong>
                            <span className="brief-item-date">{formatShortDate(f.date)}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="brief-empty">No concerns recorded in the available feedback.</p>
                  )}
                </div>

                {/* Recent Appreciations */}
                <div className="brief-section">
                  <h3><Star size={18} /> Recent Appreciations</h3>
                  {customerFeedback.filter(f => f.category === 'Appreciation').length > 0 ? (
                    <div className="brief-list">
                      {customerFeedback
                        .filter(f => f.category === 'Appreciation')
                        .slice(0, 3)
                        .map(f => (
                          <div key={f.id} className="brief-item appreciation">
                            <strong>{f.title}</strong>
                            <span className="brief-item-date">{formatShortDate(f.date)}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="brief-empty">No recent appreciations recorded.</p>
                  )}
                </div>

                {/* Recent Interactions */}
                <div className="brief-section">
                  <h3><MessagesSquare size={18} /> Last 5 Interactions</h3>
                  <div className="brief-timeline">
                    {customerFeedback.slice(0, 5).map(f => (
                      <div key={f.id} className="brief-timeline-item">
                        <span className="brief-timeline-date">{formatShortDate(f.date)}</span>
                        <span className="brief-timeline-title">{f.title}</span>
                        <Badge value={f.sentiment} size="small" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meeting Preparation Checklist */}
                <div className="brief-section checklist-section">
                  <h3><CheckSquare size={18} /> Meeting Preparation Checklist</h3>
                  <div className="brief-checklist">
                    {[
                      'Review all open commitments with their owners',
                      'Acknowledge any unresolved concerns',
                      'Prepare closure evidence for completed actions',
                      'Confirm understanding of customer expectations',
                      'Identify topics for discussion',
                      'Review recent appreciations to acknowledge',
                    ].map((item, i) => (
                      <label key={i} className="checklist-item">
                        <input type="checkbox" />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="brief-footer">
                <ShieldCheck size={14} />
                <span>Generated from your workspace data · Not AI-generated content</span>
              </div>
            </section>
          )}
        </div>
      </>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <a className="brand" href="/">
          W<span>WELSPUN<small>GLOBAL CAPABILITY CENTER</small></span>
        </a>
        
        <div className="workspace-label">
          <span className="product-symbol">◈</span>
          <div>
            Customer 360°
            <small>Relationship intelligence</small>
          </div>
          <ChevronDown size={14} />
        </div>

        <div className="nav-caption">WORKSPACE</div>
        
        <nav>
          {navigation.map(([label, Icon]) => (
            <button
              key={label}
              title={label}
              onClick={() => navigateTo(label)}
              className={page === label ? 'active' : ''}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Action Tracker' && openActions.length > 0 && (
                <em>{openActions.length}</em>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-caption">MANAGE</div>
          
          <button onClick={() => navigateTo('Notifications')}>
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
          </button>
          
          <button onClick={() => navigateTo('Administration')}>
            <Settings size={18} />
            <span>Administration</span>
          </button>

          <div className="memory">
            <span>
              ONE CUSTOMER.<br />
              ONE MEMORY.<br />
              <b>ONE GCC VIEW.</b>
            </span>
            <span className="memory-mark">◈</span>
          </div>

          <button className="user" onClick={() => navigateTo('Administration')}>
            <Avatar name={userName} size="small" />
            <span>
              <strong>{userName}</strong>
              <small>Leadership workspace</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="breadcrumb">
            <button aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}>
              <PanelLeftClose size={18} />
            </button>
            <span>Workspace</span>
            <span>/</span>
            <strong>{page}</strong>
            {selectedCustomer && (
              <>
                <span>/</span>
                <strong>{selectedCustomer.title}</strong>
              </>
            )}
          </div>
          
          <div className="header-tools">
            <label className="global-search">
              <Search size={16} />
              <input
                aria-label="Search workspace"
                placeholder="Search customers, feedback, actions..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  if (e.target.value) {
                    setSelected(null);
                    setPage('Search');
                  }
                }}
              />
              <kbd>⌘K</kbd>
            </label>
            
            <button className="quick-add" onClick={() => openModal('feedback')}>
              <Plus size={16} />
            </button>
            
            <button 
              className="bell" 
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              onClick={() => navigateTo('Notifications')}
            >
              <Bell size={19} />
              {unreadCount > 0 && <i className="bell-count">{unreadCount > 9 ? '9+' : unreadCount}</i>}
            </button>
            
            <span className="divider" />
            <Avatar name={userName} size="small" />
          </div>
        </header>

        {/* Main Content Area */}
        <main>
          {/* Demo Banner */}
          <div className="demo-banner">
            <span>
              <span className="live-dot" />
              {sample || rows.some(r => r.fictional) ? 'Fictional demo workspace' : 'Private workspace'}
              <span className="banner-detail">
                · {sample ? 'Explore with illustrative data' : 'Shared with authorized workspace members'}
              </span>
            </span>
            {!signedIn ? (
              <a href="/signin-with-chatgpt?return_to=%2F" target="_top">
                Sign in to save your work <ArrowRight size={13} />
              </a>
            ) : !rows.length && member?.role === 'admin' ? (
              <button disabled={busy || !loaded} onClick={seedDemoData}>
                Load fictional demo data
              </button>
            ) : (
              <span className="banner-detail">Welspun GCC</span>
            )}
          </div>

          {!loaded ? (
            <div className="loading-state">
              <Skeleton variant="card" count={4} />
            </div>
          ) : (
            <>
              {/* ============================================ */}
              {/* OVERVIEW / DASHBOARD PAGE */}
              {/* ============================================ */}
              {page === 'Overview' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">YOUR RELATIONSHIPS, IN FOCUS</span>
                      <div className="page-header-row">
                        <div>
                          <h1>{getCurrentGreeting()}, {userName === 'Executive' ? 'Executive' : userName.split(' ')[0]}<span className="greeting-dot">.</span></h1>
                          <p>Here's what is happening across your customer relationships.</p>
                        </div>
                        <div className="page-header-actions">
                          <span className="date-pill">
                            <CalendarDays size={15} /> {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <button className="btn-primary" onClick={() => openModal('feedback')}>
                            <Plus size={17} /> Capture Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI Stats */}
                  <div className="section-label">
                    <h2>Relationship Pulse</h2>
                    <span><span className="live-dot" /> Live workspace overview</span>
                  </div>

                  <div className="stats-grid">
                    <StatCard
                      label="Active Customers"
                      value={metrics.totalCustomers}
                      icon={Building2}
                      trendLabel="Across GCC"
                      onClick={() => navigateTo('Customer 360°')}
                    />
                    <StatCard
                      label="Customer Interactions"
                      value={metrics.totalInteractions}
                      icon={MessagesSquare}
                      trendLabel="Total recorded"
                      onClick={() => navigateTo('Feedback Hub')}
                    />
                    <StatCard
                      label="Open Commitments"
                      value={metrics.openCommitments}
                      icon={ListTodo}
                      trendLabel={`${metrics.overdueCommitments} overdue`}
                      status={metrics.overdueCommitments > 0 ? 'warning' : 'default'}
                      onClick={() => navigateTo('Action Tracker')}
                    />
                    <StatCard
                      label="Positive Feedback"
                      value={`${metrics.positiveRate}%`}
                      icon={Activity}
                      trend={metrics.positiveRate >= 50 ? 'up' : 'down'}
                      trendLabel="of all feedback"
                      status={metrics.positiveRate >= 60 ? 'success' : 'default'}
                      onClick={() => { navigateTo('Feedback Hub'); setFilter('Positive'); }}
                    />
                  </div>

                  {/* Dashboard Grid */}
                  <div className="dashboard-grid">
                    {/* Sentiment Chart */}
                    <section className="card sentiment-card">
                      <div className="card-header">
                        <div>
                          <h2>Customer Sentiment</h2>
                          <p>How your relationships feel over time</p>
                        </div>
                        <span className="soft-pill">Last 6 months</span>
                      </div>
                      <div className="chart-legend">
                        <span><i className="legend-dot teal" /> Positive</span>
                        <span><i className="legend-dot amber" /> Concerned</span>
                        <span><i className="legend-dot gray" /> Neutral</span>
                      </div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sentimentChartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#178b79" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#178b79" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#e9eeed" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Positive" stroke="#148574" strokeWidth={2.5} fill="url(#fillPositive)" />
                            <Area type="monotone" dataKey="Concerned" stroke="#d7a353" strokeWidth={2} fill="transparent" />
                            <Area type="monotone" dataKey="Neutral" stroke="#aebbbd" strokeWidth={2} fill="transparent" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="card-footer">
                        <ShieldCheck size={14} />
                        Based on recorded feedback, never inferred.
                        <button className="text-btn" onClick={() => navigateTo('Analytics & Insights')}>
                          Explore insights <ArrowRight size={14} />
                        </button>
                      </div>
                    </section>

                    {/* Relationship Intelligence */}
                    <section className="intelligence-card">
                      <div className="intelligence-header">
                        <span className="spark-icon"><Sparkles size={18} /></span>
                        <span>
                          Relationship Intelligence
                          <small>THE SIGNAL BEHIND THE NUMBERS</small>
                        </span>
                      </div>

                      <button className="insight-item" onClick={() => { navigateTo('Action Tracker'); setFilter('Overdue'); }}>
                        <span className="insight-icon amber"><Clock size={17} /></span>
                        <div>
                          <strong>{metrics.overdueCommitments} commitment{metrics.overdueCommitments !== 1 ? 's' : ''} need attention</strong>
                          <p>Overdue actions can impact trust. Close the loop with your customers.</p>
                          <span className="insight-link">Review commitments <ArrowRight size={13} /></span>
                        </div>
                      </button>

                      <button className="insight-item" onClick={() => { navigateTo('Customer 360°'); setFilter('Critical'); }}>
                        <span className="insight-icon rose"><TriangleAlert size={17} /></span>
                        <div>
                          <strong>{metrics.criticalRelationships} relationship{metrics.criticalRelationships !== 1 ? 's' : ''} at critical sentiment</strong>
                          <p>Prioritize leadership check-ins and align on recovery plans.</p>
                          <span className="insight-link">View relationships <ArrowRight size={13} /></span>
                        </div>
                      </button>

                      {metrics.concernedRelationships > 0 && (
                        <button className="insight-item" onClick={() => { navigateTo('Customer 360°'); setFilter('Concerned'); }}>
                          <span className="insight-icon blue"><Activity size={17} /></span>
                          <div>
                            <strong>{metrics.concernedRelationships} relationship{metrics.concernedRelationships !== 1 ? 's' : ''} showing concern</strong>
                            <p>Monitor these relationships to prevent escalation.</p>
                            <span className="insight-link">View details <ArrowRight size={13} /></span>
                          </div>
                        </button>
                      )}

                      <div className="intelligence-footer">
                        <span className="live-dot" /> Rule-based insights · From your workspace data
                      </div>
                    </section>
                  </div>

                  {/* Lower Grid */}
                  <div className="lower-grid">
                    {/* Relationships to Watch */}
                    <section className="card">
                      <div className="card-header">
                        <div>
                          <h2>
                            Relationships to Watch
                            <span className="count-badge">{allCustomers.filter(c => ['Concerned', 'Critical'].includes(c.sentiment || '')).length}</span>
                          </h2>
                          <p>A little attention today. Stronger relationships tomorrow.</p>
                        </div>
                        <button className="text-btn" onClick={() => navigateTo('Customer 360°')}>
                          All customers <ArrowRight size={14} />
                        </button>
                      </div>
                      {renderCustomerTable(allCustomers.filter(c => ['Concerned', 'Critical'].includes(c.sentiment || '')))}
                    </section>

                    {/* Upcoming Meetings */}
                    <section className="card meetings-widget">
                      <div className="card-header">
                        <h2>On the Horizon</h2>
                        <CalendarDays size={17} />
                      </div>
                      {upcomingMeetings.slice(0, 4).map(m => (
                        <button
                          key={m.id}
                          className="meeting-preview"
                          onClick={() => { openCustomerProfile(m.customerId!); setTab('Brief'); }}
                        >
                          <div className="meeting-preview-date">
                            <small>{m.date?.slice(5, 7) === '11' ? 'NOV' : 'OCT'}</small>
                            <b>{m.date?.slice(8)}</b>
                          </div>
                          <span>
                            <strong>{getCustomerName(m.customerId)}</strong>
                            <small>{m.title}</small>
                            <span className="meeting-brief-link">
                              Open customer brief <ArrowUpRight size={12} />
                            </span>
                          </span>
                        </button>
                      ))}
                      <button className="widget-footer" onClick={() => navigateTo('Calendar')}>
                        View calendar <ArrowRight size={14} />
                      </button>
                    </section>
                  </div>

                  <div className="bottom-note">
                    <ShieldCheck size={14} />
                    Built on every conversation. Ready for the next one.
                    <span>One customer. One memory. One GCC view.</span>
                  </div>
                </>
              )}

              {/* ============================================ */}
              {/* CUSTOMER 360° PAGE */}
              {/* ============================================ */}
              {page === 'Customer 360°' && (
                selectedCustomer ? (
                  renderCustomerProfile()
                ) : (
                  <>
                    <div className="page-header">
                      <div className="page-header-content">
                        <span className="eyebrow">CUSTOMER RELATIONSHIP INTELLIGENCE</span>
                        <div className="page-header-row">
                          <div>
                            <h1>Customer 360°</h1>
                            <p>Every conversation connected. Every commitment accounted for.</p>
                          </div>
                          <button className="btn-primary" onClick={() => openModal('customer')}>
                            <Plus size={16} /> Add Customer
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                      <div className="search-filter">
                        <Search size={16} />
                        <input
                          placeholder="Search customers, owners, locations..."
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                        />
                      </div>
                      <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                        <option value="All">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Concerned">Concerned</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <div className="view-toggles">
                        <button 
                          className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                          onClick={() => setViewMode('table')}
                        >
                          <BarChart3 size={16} /> Table
                        </button>
                        <button 
                          className={`view-toggle ${viewMode === 'card' ? 'active' : ''}`}
                          onClick={() => setViewMode('card')}
                        >
                          <Grip size={16} /> Cards
                        </button>
                      </div>
                      <span className="filter-count">
                        {filterRecords(allCustomers).length} customers
                      </span>
                    </div>

                    <section className="card">
                      {viewMode === 'table' 
                        ? renderCustomerTable(filterRecords(allCustomers))
                        : renderCustomerCards(filterRecords(allCustomers))
                      }
                    </section>
                  </>
                )
              )}

              {/* ============================================ */}
              {/* ACTION TRACKER PAGE */}
              {/* ============================================ */}
              {page === 'Action Tracker' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">COMMITMENT MANAGEMENT</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Action Tracker</h1>
                          <p>Track commitments, ensure accountability, build trust.</p>
                        </div>
                        <button className="btn-primary" onClick={() => openModal('action')}>
                          <Plus size={16} /> Create Action
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="quick-stats">
                    <button 
                      className={`quick-stat ${filter === 'All' ? 'active' : ''}`}
                      onClick={() => setFilter('All')}
                    >
                      <span className="quick-stat-value">{allActions.length}</span>
                      <span className="quick-stat-label">Total</span>
                    </button>
                    <button 
                      className={`quick-stat ${filter === 'Open' ? 'active' : ''}`}
                      onClick={() => setFilter('Open')}
                    >
                      <span className="quick-stat-value">{allActions.filter(a => a.status === 'Open').length}</span>
                      <span className="quick-stat-label">Open</span>
                    </button>
                    <button 
                      className={`quick-stat ${filter === 'In Progress' ? 'active' : ''}`}
                      onClick={() => setFilter('In Progress')}
                    >
                      <span className="quick-stat-value">{allActions.filter(a => a.status === 'In Progress').length}</span>
                      <span className="quick-stat-label">In Progress</span>
                    </button>
                    <button 
                      className={`quick-stat warning ${filter === 'Overdue' ? 'active' : ''}`}
                      onClick={() => setFilter('Overdue')}
                    >
                      <span className="quick-stat-value">{overdueActions.length}</span>
                      <span className="quick-stat-label">Overdue</span>
                    </button>
                    <button 
                      className={`quick-stat success ${filter === 'Closed' ? 'active' : ''}`}
                      onClick={() => setFilter('Closed')}
                    >
                      <span className="quick-stat-value">{allActions.filter(a => a.status === 'Closed').length}</span>
                      <span className="quick-stat-label">Closed</span>
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="filters-bar">
                    <div className="search-filter">
                      <Search size={16} />
                      <input
                        placeholder="Search actions, owners, customers..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                      <option value="All">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <div className="view-toggles">
                      <button 
                        className={`view-toggle ${!board ? 'active' : ''}`}
                        onClick={() => setBoard(false)}
                      >
                        List
                      </button>
                      <button 
                        className={`view-toggle ${board ? 'active' : ''}`}
                        onClick={() => setBoard(true)}
                      >
                        Board
                      </button>
                    </div>
                  </div>

                  <section className="card">
                    {renderActionList(filterRecords(allActions))}
                  </section>
                </>
              )}

              {/* ============================================ */}
              {/* FEEDBACK HUB PAGE */}
              {/* ============================================ */}
              {page === 'Feedback Hub' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">RELATIONSHIP MEMORY</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Feedback Hub</h1>
                          <p>Every conversation captured. Every insight preserved.</p>
                        </div>
                        <button className="btn-primary" onClick={() => openModal('feedback')}>
                          <Plus size={16} /> Capture Feedback
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="filters-bar">
                    <div className="search-filter">
                      <Search size={16} />
                      <input
                        placeholder="Search feedback..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                      <option value="All">All Categories</option>
                      {feedbackCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)} className="filter-select">
                      <option value="All">All Sentiments</option>
                      <option value="Positive">Positive</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Concerned">Concerned</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <span className="filter-count">
                      {filterRecords(allFeedback).length} records
                    </span>
                  </div>

                  {renderFeedbackList(filterRecords(allFeedback))}
                </>
              )}

              {/* ============================================ */}
              {/* MEETINGS & CALENDAR PAGES */}
              {/* ============================================ */}
              {(page === 'Meetings & Interactions' || page === 'Calendar') && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">MEETING MANAGEMENT</span>
                      <div className="page-header-row">
                        <div>
                          <h1>{page}</h1>
                          <p>Schedule, prepare, and follow up on customer meetings.</p>
                        </div>
                        <button className="btn-primary" onClick={() => openModal('meeting')}>
                          <Plus size={16} /> Schedule Meeting
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="filters-bar">
                    <div className="search-filter">
                      <Search size={16} />
                      <input
                        placeholder="Search meetings..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                      <option value="All">All Status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <section className="card">
                    {renderMeetingsList(filterRecords(allMeetings))}
                  </section>
                </>
              )}

              {/* ============================================ */}
              {/* CUSTOMER BRIEFS PAGE */}
              {/* ============================================ */}
              {page === 'Customer Briefs' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">MEETING PREPARATION</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Customer Briefs</h1>
                          <p>Be prepared for every conversation. Know what matters.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="briefs-grid">
                    {allCustomers.map((c, i) => {
                      const customerOpenActions = openActions.filter(a => a.customerId === c.id);
                      const customerOverdue = overdueActions.filter(a => a.customerId === c.id);
                      return (
                        <button
                          key={c.id}
                          className="brief-card"
                          onClick={() => { openCustomerProfile(c.id); setTab('Brief'); }}
                        >
                          <div className="brief-card-header">
                            <Avatar name={c.title} size="default" variant={i} />
                            <Badge value={c.sentiment} size="small" />
                          </div>
                          <h3>{c.title}</h3>
                          <p>{c.stakeholder} · {c.owner}</p>
                          <div className="brief-card-stats">
                            <span className={customerOverdue.length > 0 ? 'warning' : ''}>
                              {customerOpenActions.length} open actions
                              {customerOverdue.length > 0 && ` · ${customerOverdue.length} overdue`}
                            </span>
                          </div>
                          <div className="brief-card-action">
                            <FileText size={14} /> Prepare Brief <ArrowRight size={14} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ============================================ */}
              {/* ANALYTICS PAGE */}
              {/* ============================================ */}
              {page === 'Analytics & Insights' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">EXECUTIVE INSIGHTS</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Analytics & Insights</h1>
                          <p>Data-driven visibility into your customer relationships.</p>
                        </div>
                        <span className="date-pill">
                          <CalendarDays size={15} /> Last 6 months
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KPI Row */}
                  <div className="stats-grid four-col">
                    <StatCard label="Total Customers" value={metrics.totalCustomers} icon={Building2} />
                    <StatCard label="Total Interactions" value={metrics.totalInteractions} icon={MessagesSquare} />
                    <StatCard 
                      label="Action Closure Rate" 
                      value={`${metrics.closureRate}%`} 
                      icon={Target}
                      status={metrics.closureRate >= 70 ? 'success' : 'warning'}
                    />
                    <StatCard 
                      label="Positive Feedback" 
                      value={`${metrics.positiveRate}%`} 
                      icon={Activity}
                      status={metrics.positiveRate >= 60 ? 'success' : 'default'}
                    />
                  </div>

                  <div className="analytics-grid">
                    {/* Sentiment Trend */}
                    <section className="analytics-card wide">
                      <h3>Sentiment Trend Over Time</h3>
                      <p>Monthly breakdown of customer feedback sentiment</p>
                      <div className="chart-container medium">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sentimentChartData}>
                            <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#e9eeed" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a969a' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Positive" fill="#178b79" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Concerned" fill="#d7a353" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Critical" fill="#c07a6e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Neutral" fill="#aebbbd" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    {/* Action Status */}
                    <section className="analytics-card">
                      <h3>Action Status Distribution</h3>
                      <p>Current status of all tracked commitments</p>
                      <div className="status-breakdown">
                        {actionStatusData.map(s => (
                          <div key={s.status} className="status-item">
                            <div className="status-item-header">
                              <span className={`status-dot ${s.status.toLowerCase().replace(' ', '-')}`} />
                              <span>{s.status}</span>
                              <span className="status-count">{s.count}</span>
                            </div>
                            <div className="status-bar">
                              <div 
                                className={`status-bar-fill ${s.status.toLowerCase().replace(' ', '-')}`}
                                style={{ width: `${allActions.length ? (s.count / allActions.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Feedback by Function */}
                    <section className="analytics-card">
                      <h3>Feedback by Function</h3>
                      <p>Distribution across business functions</p>
                      <div className="function-bars">
                        {functionChartData.map(f => (
                          <div key={f.function} className="function-bar">
                            <span className="function-label">{f.function}</span>
                            <div className="function-bar-track">
                              <div 
                                className="function-bar-fill"
                                style={{ width: `${(f.count / Math.max(...functionChartData.map(x => x.count))) * 100}%` }}
                              />
                            </div>
                            <span className="function-count">{f.count}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Feedback Categories */}
                    <section className="analytics-card">
                      <h3>Top Feedback Categories</h3>
                      <p>Most common types of customer feedback</p>
                      <div className="category-list">
                        {categoryChartData.slice(0, 6).map((c, i) => (
                          <div key={c.category} className="category-item">
                            <span className="category-rank">{i + 1}</span>
                            <span className="category-name">{c.category}</span>
                            <span className="category-count">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* At-Risk Customers */}
                    <section className="analytics-card wide">
                      <h3>Customers Requiring Attention</h3>
                      <p>Based on sentiment and overdue commitments</p>
                      <div className="risk-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Sentiment</th>
                              <th>Overdue Actions</th>
                              <th>Last Contact</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {riskMetrics.slice(0, 5).map(r => (
                              <tr key={r.id}>
                                <td><strong>{r.name}</strong></td>
                                <td><Badge value={r.sentiment} size="small" /></td>
                                <td>
                                  <span className={r.overdueActions ? 'overdue-count' : ''}>
                                    {r.overdueActions} overdue
                                  </span>
                                </td>
                                <td>{getRelativeTime(r.lastInteraction)}</td>
                                <td>
                                  <button 
                                    className="text-btn"
                                    onClick={() => openCustomerProfile(r.id)}
                                  >
                                    View <ArrowRight size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Leader-wise Customer Connects */}
                    <section className="analytics-card">
                      <h3>Leader-wise Customer Connects</h3>
                      <p>Interactions by GCC relationship owner</p>
                      <div className="leader-connects">
                        {leaderConnects.map((l, i) => (
                          <div key={l.leader} className="leader-connect-row">
                            <div className="leader-info">
                              <Avatar name={l.leader} size="small" variant={i} />
                              <div>
                                <strong>{l.leader}</strong>
                                <small>{l.customers} customers</small>
                              </div>
                            </div>
                            <div className="leader-stats">
                              <span className="leader-stat">{l.interactions} interactions</span>
                              <span className="leader-stat">{l.openActions} open actions</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Action Ageing Analysis */}
                    <section className="analytics-card">
                      <h3>Action Ageing Analysis</h3>
                      <p>Open action items by age</p>
                      <div className="ageing-chart">
                        {actionAgeingData.map(a => (
                          <div key={a.range} className="ageing-bar">
                            <span className="ageing-label">{a.range}</span>
                            <div className="ageing-bar-track">
                              <div 
                                className={`ageing-bar-fill ${a.severity}`}
                                style={{ width: `${openActions.length ? (a.count / openActions.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="ageing-count">{a.count}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* ============================================ */}
              {/* ESCALATIONS PAGE */}
              {/* ============================================ */}
              {page === 'Escalations' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">CRITICAL ISSUE MANAGEMENT</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Escalations</h1>
                          <p>Critical issues requiring leadership attention and resolution.</p>
                        </div>
                        <button className="btn-primary" onClick={() => openModal('escalation')}>
                          <Plus size={16} /> Raise Escalation
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="quick-stats">
                    <button
                      className={`quick-stat ${filter === 'All' ? 'active' : ''}`}
                      onClick={() => setFilter('All')}
                    >
                      <span className="quick-stat-value">{allEscalations.length}</span>
                      <span className="quick-stat-label">Total</span>
                    </button>
                    <button
                      className={`quick-stat warning ${filter === 'Open' ? 'active' : ''}`}
                      onClick={() => setFilter('Open')}
                    >
                      <span className="quick-stat-value">{allEscalations.filter(e => e.status === 'Open').length}</span>
                      <span className="quick-stat-label">Open</span>
                    </button>
                    <button
                      className={`quick-stat ${filter === 'Under Review' ? 'active' : ''}`}
                      onClick={() => setFilter('Under Review')}
                    >
                      <span className="quick-stat-value">{allEscalations.filter(e => e.status === 'Under Review').length}</span>
                      <span className="quick-stat-label">Under Review</span>
                    </button>
                    <button
                      className={`quick-stat ${filter === 'In Progress' ? 'active' : ''}`}
                      onClick={() => setFilter('In Progress')}
                    >
                      <span className="quick-stat-value">{allEscalations.filter(e => e.status === 'In Progress').length}</span>
                      <span className="quick-stat-label">In Progress</span>
                    </button>
                    <button
                      className={`quick-stat success ${filter === 'Resolved' ? 'active' : ''}`}
                      onClick={() => setFilter('Resolved')}
                    >
                      <span className="quick-stat-value">{allEscalations.filter(e => e.status === 'Resolved').length}</span>
                      <span className="quick-stat-label">Resolved</span>
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="filters-bar">
                    <div className="search-filter">
                      <Search size={16} />
                      <input
                        placeholder="Search escalations, customers, assignees..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </div>
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                      <option value="All">All Status</option>
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <span className="filter-count">
                      {filterRecords(allEscalations).length} escalations
                    </span>
                  </div>

                  <section className="card">
                    {renderEscalationList(filterRecords(allEscalations))}
                  </section>
                </>
              )}

              {/* ============================================ */}
              {/* NOTIFICATIONS PAGE */}
              {/* ============================================ */}
              {page === 'Notifications' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">STAY INFORMED</span>
                      <div className="page-header-row">
                        <div>
                          <h1>
                            Notifications
                            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                          </h1>
                          <p>Alerts and reminders for your attention.</p>
                        </div>
                        <button 
                          className="btn-secondary"
                          disabled={unreadCount === 0}
                          onClick={markAllNotifsRead}
                        >
                          {unreadCount === 0 ? 'All caught up' : 'Mark all as read'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {notificationGroups.length > 0 ? (
                    notificationGroups.map(group => {
                      const GroupIcon = group.icon;
                      return (
                        <section key={group.key} className="card notifications-card">
                          <h3>
                            <GroupIcon size={15} /> {group.label}
                            <span className="group-count">{group.items.length}</span>
                          </h3>
                          <div className="notifications-list">
                            {group.items.map(n => {
                              const read = isNotifRead(n.id);
                              return (
                                <button
                                  key={n.id}
                                  className={`notification-item${read ? ' read' : ''}`}
                                  onClick={() => {
                                    markNotifRead(n.id);
                                    if (n.kind === 'meeting') {
                                      openCustomerProfile(n.record.customerId!);
                                      setTab('Brief');
                                    } else {
                                      openModal(n.kind, n.record);
                                    }
                                  }}
                                >
                                  <span className={`notification-icon ${group.iconTone}`}>
                                    <GroupIcon size={18} />
                                  </span>
                                  <div className="notification-content">
                                    <strong>{n.title}</strong>
                                    <span>{n.message}</span>
                                  </div>
                                  {!read && <span className="notification-dot" />}
                                  <ArrowRight size={16} />
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })
                  ) : (
                    <section className="card notifications-card">
                      <EmptyState
                        icon={Bell}
                        title="You're all caught up!"
                        description="No overdue commitments, upcoming meetings, or alerts right now."
                      />
                    </section>
                  )}
                </>
              )}

              {/* ============================================ */}
              {/* ADMINISTRATION PAGE */}
              {/* ============================================ */}
              {page === 'Administration' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">WORKSPACE SETTINGS</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Administration</h1>
                          <p>Manage your workspace, data, and preferences.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <section className="card admin-card">
                    <div className="admin-icon">
                      <ShieldCheck size={32} />
                    </div>
                    <WorkspaceAccess signedIn={signedIn} onChange={refreshWorkspace} />
                    {signedIn&&<DeviceAccess />}
                    {member?.role==='admin'&&<JobStatus />}
                    <h2>Governed Customer Workspace</h2>
                    <p>
                      Records are shared with explicitly authorized workspace members. Every create and update 
                      is recorded in the server audit log for compliance and accountability.
                    </p>

                    <div className="admin-section">
                      <h3>Access Model</h3>
                      <p>
                        Administrators grant membership. Function heads see assigned functions, relationship owners see assigned customers, and action owners see their commitments. Restricted records require an explicit grant.
                      </p>
                    </div>

                    <div className="admin-section">
                      <h3>Role-Based Access Control</h3>
                      <p>Access levels define what each user role can see and do in the system.</p>
                      <div className="rbac-roles">
                        <div className="rbac-role">
                          <div className="rbac-role-header">
                            <span className="rbac-role-icon ceo"><ShieldCheck size={16} /></span>
                            <div>
                              <strong>CEO / GCC Leadership</strong>
                              <small>Full visibility across all customers and functions</small>
                            </div>
                          </div>
                          <div className="rbac-permissions">
                            <span className="rbac-perm granted">View all customers</span>
                            <span className="rbac-perm granted">View all feedback</span>
                            <span className="rbac-perm granted">View all actions</span>
                            <span className="rbac-perm granted">View analytics</span>
                            <span className="rbac-perm granted">Manage escalations</span>
                          </div>
                        </div>
                        <div className="rbac-role">
                          <div className="rbac-role-header">
                            <span className="rbac-role-icon function"><Users size={16} /></span>
                            <div>
                              <strong>Function Head</strong>
                              <small>Visibility for their function and assigned customers</small>
                            </div>
                          </div>
                          <div className="rbac-permissions">
                            <span className="rbac-perm granted">View function customers</span>
                            <span className="rbac-perm granted">View function feedback</span>
                            <span className="rbac-perm granted">Manage function actions</span>
                            <span className="rbac-perm limited">Limited analytics</span>
                            <span className="rbac-perm granted">Escalate issues</span>
                          </div>
                        </div>
                        <div className="rbac-role">
                          <div className="rbac-role-header">
                            <span className="rbac-role-icon owner"><User size={16} /></span>
                            <div>
                              <strong>Relationship Owner</strong>
                              <small>Customer-specific visibility</small>
                            </div>
                          </div>
                          <div className="rbac-permissions">
                            <span className="rbac-perm granted">View assigned customers</span>
                            <span className="rbac-perm granted">Capture feedback</span>
                            <span className="rbac-perm granted">Manage own actions</span>
                            <span className="rbac-perm limited">Customer analytics only</span>
                            <span className="rbac-perm granted">Escalate issues</span>
                          </div>
                        </div>
                        <div className="rbac-role">
                          <div className="rbac-role-header">
                            <span className="rbac-role-icon action"><ListTodo size={16} /></span>
                            <div>
                              <strong>Action Owner</strong>
                              <small>Assigned action visibility only</small>
                            </div>
                          </div>
                          <div className="rbac-permissions">
                            <span className="rbac-perm limited">View related customer</span>
                            <span className="rbac-perm denied">No feedback access</span>
                            <span className="rbac-perm granted">Update assigned actions</span>
                            <span className="rbac-perm denied">No analytics</span>
                            <span className="rbac-perm denied">Cannot escalate</span>
                          </div>
                        </div>
                        <div className="rbac-role">
                          <div className="rbac-role-header">
                            <span className="rbac-role-icon admin"><Settings size={16} /></span>
                            <div>
                              <strong>System Admin</strong>
                              <small>Master data and system configuration</small>
                            </div>
                          </div>
                          <div className="rbac-permissions">
                            <span className="rbac-perm granted">Manage users</span>
                            <span className="rbac-perm granted">Manage master data</span>
                            <span className="rbac-perm granted">Configure system</span>
                            <span className="rbac-perm granted">View audit logs</span>
                            <span className="rbac-perm granted">Manage roles</span>
                          </div>
                        </div>
                      </div>
                      <p className="rbac-note">
                        <ShieldCheck size={12} /> Roles and restricted-record access are enforced by the server.
                      </p>
                    </div>

                    <div className="admin-section">
                      <h3>Master Data Management</h3>
                      <div className="admin-actions">
                        <button className="btn-secondary" onClick={() => navigateTo('Customer 360°')}>
                          <Building2 size={16} /> Manage Customers
                        </button>
                        <button className="btn-secondary" onClick={() => navigateTo('Action Tracker')}>
                          <ListTodo size={16} /> Manage Actions
                        </button>
                        <button className="btn-secondary" onClick={() => navigateTo('Feedback Hub')}>
                          <MessageSquareText size={16} /> Manage Feedback
                        </button>
                      </div>
                    </div>

                    <div className="admin-section">
                      <h3>Notification Preferences</h3>
                      <p>Choose which alerts appear in your notifications feed.</p>
                      <div className="notify-prefs">
                        {([
                          ['overdue', 'Overdue commitments'],
                          ['meetings', 'Upcoming meetings (next 3 days)'],
                          ['critical', 'Critical feedback alerts'],
                          ['escalations', 'Open escalations'],
                        ] as const).map(([key, label]) => (
                          <label key={key} className="notify-pref-row">
                            <span>{label}</span>
                            <input
                              type="checkbox"
                              checked={notifyPrefs[key]}
                              onChange={e =>
                                setNotifyPrefs(prev => {const next={ ...prev, [key]: e.target.checked }; void savePreferences(readNotifications,next); return next;})
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {signedIn && (
                      <div className="admin-section">
                        <h3>Account</h3>
                        <p>
                          <a href="/signout-with-chatgpt" target="_top" className="signout-link">
                            Sign out of your workspace
                          </a>
                        </p>
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* ============================================ */}
              {/* SEARCH RESULTS PAGE */}
              {/* ============================================ */}
              {page === 'Search' && (
                <>
                  <div className="page-header">
                    <div className="page-header-content">
                      <span className="eyebrow">SEARCH RESULTS</span>
                      <div className="page-header-row">
                        <div>
                          <h1>Search: "{query}"</h1>
                          <p>Results from across your workspace.</p>
                        </div>
                        <button className="btn-secondary" onClick={() => navigateTo('Overview')}>
                          <X size={16} /> Clear Search
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  <div className="advanced-filters">
                    <div className="filter-row">
                      <label className="filter-item">
                        <span>Owner</span>
                        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
                          <option value="All">All Owners</option>
                          {gccLeaders.map(l => (
                            <option key={l.id} value={sample ? l.name : l.email}>{l.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="filter-item">
                        <span>Function</span>
                        <select value={functionFilter} onChange={e => setFunctionFilter(e.target.value)}>
                          <option value="All">All Functions</option>
                          {businessFunctions.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </label>
                      <label className="filter-item">
                        <span>Sentiment</span>
                        <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
                          <option value="All">All Sentiments</option>
                          <option value="Positive">Positive</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Concerned">Concerned</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </label>
                      <label className="filter-item">
                        <span>From Date</span>
                        <input 
                          type="date" 
                          value={dateRangeFilter.start}
                          onChange={e => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                        />
                      </label>
                      <label className="filter-item">
                        <span>To Date</span>
                        <input 
                          type="date" 
                          value={dateRangeFilter.end}
                          onChange={e => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                        />
                      </label>
                    </div>
                    {(ownerFilter !== 'All' || functionFilter !== 'All' || sentimentFilter !== 'All' || dateRangeFilter.start || dateRangeFilter.end) && (
                      <button 
                        className="clear-filters-btn"
                        onClick={() => {
                          setOwnerFilter('All');
                          setFunctionFilter('All');
                          setSentimentFilter('All');
                          setDateRangeFilter({ start: '', end: '' });
                        }}
                      >
                        <X size={12} /> Clear filters
                      </button>
                    )}
                  </div>

                  <div className="search-results" aria-live="polite">
                    {searchBusy?<p>Searching authorized records…</p>:<>
                    {(sample?filterRecords(rows):searchResults.rows).map(r=><button className="btn-secondary" key={r.id} onClick={()=>r.kind==='customer'?openCustomerProfile(r.id):openModal(r.kind,r)}><strong>{r.kind}</strong> · {r.title} · {getCustomerName(r.customerId)}</button>)}
                    {!(sample?filterRecords(rows).length:searchResults.total)&&<EmptyState icon={Search} title="No results found" description="Try another keyword or filter." />}
                    {!sample&&<p><button disabled={searchPage<=1} onClick={()=>setSearchPage(p=>p-1)}>Previous</button> Page {searchPage} · {searchResults.total} matches <button disabled={searchPage*25>=searchResults.total} onClick={()=>setSearchPage(p=>p+1)}>Next</button></p>}
                    </>}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {mobileMore&&<nav className="mobile-more" aria-label="More modules">{[...navigation.map(n=>n[0]),'Notifications','Administration','Search'].map(name=><button key={name} onClick={()=>{navigateTo(name);setMobileMore(false);}}>{name}</button>)}<button onClick={()=>setMobileMore(false)}>Close menu</button></nav>}
      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <button onClick={() => navigateTo('Overview')} className={page === 'Overview' ? 'active' : ''}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        <button onClick={() => navigateTo('Customer 360°')} className={page === 'Customer 360°' ? 'active' : ''}>
          <Building2 size={20} />
          <span>Customers</span>
        </button>
        <button className="mobile-capture" onClick={() => openModal('feedback')}>
          <Plus size={24} />
          <span>Capture</span>
        </button>
        <button onClick={() => navigateTo('Action Tracker')} className={page === 'Action Tracker' ? 'active' : ''}>
          <ListTodo size={20} />
          <span>Actions</span>
        </button>
        <button onClick={() => setMobileMore(v=>!v)} aria-expanded={mobileMore} aria-label="More modules"><MoreHorizontal size={20} /><span>More</span></button>
      </nav>

      {/* ============================================ */}
      {/* MODAL */}
      {/* ============================================ */}
      {modal && (
        <div 
          className="modal-backdrop"
          onClick={e => {
            if (e.target === e.currentTarget) {
              if (confirm('Discard unsaved changes?')) setModal(null);
            }
          }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {modal === 'feedback' ? 'BUILD YOUR RELATIONSHIP MEMORY' :
                   modal === 'action' ? 'TRACK COMMITMENTS' :
                   modal === 'meeting' ? 'SCHEDULE INTERACTION' :
                   modal === 'escalation' ? 'ESCALATE CRITICAL ISSUE' :
                   'MANAGE CUSTOMER'}
                </span>
                <h2 id="modal-title">
                  {edit ? 'Update' : modal === 'feedback' ? 'Capture Feedback' : 'Create'} {modal !== 'feedback' ? modal : ''}
                </h2>
              </div>
              <button 
                className="modal-close"
                aria-label="Close" 
                onClick={() => {
                  if (confirm('Discard unsaved changes?')) setModal(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick/Detailed Mode Toggle for Feedback */}
            {modal === 'feedback' && !edit && (
              <div className="capture-mode-toggle">
                <button 
                  className={captureMode === 'quick' ? 'active' : ''}
                  onClick={() => setCaptureMode('quick')}
                >
                  <Zap size={14} /> Quick Capture
                </button>
                <button 
                  className={captureMode === 'detailed' ? 'active' : ''}
                  onClick={() => setCaptureMode('detailed')}
                >
                  <FileText size={14} /> Detailed
                </button>
              </div>
            )}

            <form onSubmit={handleSave}>
              {!sample && <fieldset><legend>Record visibility</legend>
                <label><input type="checkbox" name="sensitive" defaultChecked={!!edit?.sensitive} /> Restricted to creator and explicitly allowed members</label>
                <label className="form-label">Allowed member emails (comma separated)<input className="form-input" name="allowedEmails" defaultValue={Array.isArray(edit?.allowedEmails)?edit.allowedEmails.join(', '):''} /></label>
              </fieldset>}
              {/* Title / Summary Field */}
              <label className="form-label">
                {modal === 'customer' ? 'Customer / Business Unit Name' :
                 modal === 'feedback' ? 'What did you discuss?' :
                 modal === 'meeting' ? 'Meeting Title' :
                 modal === 'escalation' ? 'Escalation Title' :
                 'Action Title'}
                <div className="textarea-with-voice">
                  <textarea
                    autoFocus
                    required
                    name="title"
                    maxLength={4000}
                    value={voiceText}
                    onChange={e => setVoiceText(e.target.value)}
                    placeholder={
                      modal === 'feedback' 
                        ? 'Key takeaways, feedback, and what matters next…'
                        : modal === 'action'
                        ? 'Describe the commitment or action item...'
                        : 'Enter a descriptive title'
                    }
                    rows={modal === 'feedback' ? 4 : 2}
                    className="form-textarea"
                  />
                  {modal === 'feedback' && (
                    <button
                      type="button"
                      className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
                      onClick={startVoiceInput}
                      title={isRecording ? 'Recording...' : 'Voice input'}
                    >
                      <Mic size={16} />
                      {isRecording && <span className="recording-indicator" />}
                    </button>
                  )}
                </div>
              </label>

              {/* Customer Selection (for non-customer modals) */}
              {modal !== 'customer' && !selectedCustomer && (
                <label className="form-label">
                  Customer
                  <select 
                    required 
                    name="customerId" 
                    defaultValue={edit?.customerId || ''}
                    className="form-select"
                  >
                    <option value="" disabled>Select customer</option>
                    {allCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </label>
              )}

              {/* Customer-specific fields */}
              {modal === 'customer' && (
                <>
                  <div className="form-row">
                    <label className="form-label">
                      Business Function
                      <select 
                        name="function" 
                        defaultValue={edit?.function || 'Operations'}
                        className="form-select"
                      >
                        {businessFunctions.map(f => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </label>
                    <label className="form-label">
                      Location
                      <input 
                        name="location" 
                        defaultValue={edit?.location} 
                        placeholder="City, Country"
                        className="form-input"
                      />
                    </label>
                  </div>
                  <label className="form-label">
                    Primary Stakeholder
                    <input 
                      name="stakeholder" 
                      defaultValue={edit?.stakeholder}
                      placeholder="Full name"
                      className="form-input"
                    />
                  </label>

                  {/* Additional Stakeholders Management */}
                  <div className="form-label">
                    <span>Additional Stakeholders</span>
                    <div className="stakeholder-builder">
                      {modalStakeholders.map((s, idx) => (
                        <div key={idx} className="stakeholder-row">
                          <input
                            placeholder="Name"
                            value={s.name}
                            onChange={e => {
                              const updated = [...modalStakeholders];
                              updated[idx] = { ...s, name: e.target.value };
                              setModalStakeholders(updated);
                            }}
                            className="form-input"
                          />
                          <input
                            placeholder="Title"
                            value={s.title}
                            onChange={e => {
                              const updated = [...modalStakeholders];
                              updated[idx] = { ...s, title: e.target.value };
                              setModalStakeholders(updated);
                            }}
                            className="form-input"
                          />
                          <select
                            value={s.criticality}
                            onChange={e => {
                              const updated = [...modalStakeholders];
                              updated[idx] = { ...s, criticality: e.target.value };
                              setModalStakeholders(updated);
                            }}
                            className="form-select"
                          >
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="executive">Executive</option>
                          </select>
                          <button
                            type="button"
                            className="btn-icon-danger"
                            onClick={() => setModalStakeholders(modalStakeholders.filter((_, i) => i !== idx))}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn-add-row"
                        onClick={() => setModalStakeholders([...modalStakeholders, { name: '', title: '', criticality: 'medium' }])}
                      >
                        <UserPlus size={14} /> Add Stakeholder
                      </button>
                    </div>
                  </div>


                </>
              )}

              {/* Common owner/date fields */}
              <div className="form-row">
                <label className="form-label">
                  {modal === 'action' ? 'Action Owner' : 'Relationship / Meeting Owner'}
                  <select 
                    required={modal === 'action'}
                    name={sample ? "owner" : "ownerEmail"} 
                    defaultValue={sample ? edit?.owner || selectedCustomer?.owner || '' : edit?.ownerEmail || selectedCustomer?.ownerEmail || ''}
                    className="form-select"
                  >
                    <option value="">Select owner</option>
                    {gccLeaders.map(l => (
                      <option key={l.id} value={sample ? l.name : l.email}>{l.name}</option>
                    ))}
                  </select>
                </label>
                {modal !== 'customer' && (
                  <label className="form-label">
                    {modal === 'action' ? 'Due Date' : 'Date'}
                    <input 
                      required
                      type="date"
                      name={modal === 'action' ? 'due' : 'date'}
                      defaultValue={
                        edit?.due || 
                        edit?.date || 
                        (modal !== 'action' ? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : '')
                      }
                      className="form-input"
                    />
                  </label>
                )}
              </div>

              {/* Sentiment for customer and feedback */}
              {['customer', 'feedback'].includes(modal) && (
                <label className="form-label">
                  Overall Sentiment
                  <select 
                    name="sentiment" 
                    defaultValue={edit?.sentiment || 'Neutral'}
                    className="form-select"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Concerned">Concerned</option>
                    <option value="Critical">Critical</option>
                  </select>
                </label>
              )}

              {/* Feedback-specific fields */}
              {modal === 'feedback' && (captureMode === 'detailed' || edit) && (
                <>
                  <label className="form-label">
                    Category
                    <select 
                      name="category" 
                      defaultValue={edit?.category || 'General Feedback'}
                      className="form-select"
                    >
                      {feedbackCategories.map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-label">
                    Description
                    <textarea
                      name="description"
                      defaultValue={edit?.description}
                      placeholder="Additional context and details..."
                      rows={3}
                      className="form-textarea"
                    />
                  </label>
                </>
              )}

              {/* Meeting-specific fields */}
              {modal === 'meeting' && (
                <>
                  <div className="form-row">
                    <label className="form-label">
                      Meeting Type
                      <select 
                        name="type" 
                        defaultValue={edit?.type || 'General Discussion'}
                        className="form-select"
                      >
                        {meetingTypes.map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label className="form-label">
                      Status
                      <select 
                        name="status" 
                        defaultValue={edit?.status || 'Scheduled'}
                        className="form-select"
                      >
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                        <option>Rescheduled</option>
                      </select>
                    </label>
                  </div>
                  <label className="form-label">
                    Location
                    <input 
                      name="location" 
                      defaultValue={edit?.location}
                      placeholder="Office, Virtual - Teams, etc."
                      className="form-input"
                    />
                  </label>

                  {/* Meeting Participants */}
                  <div className="form-label">
                    <span>GCC Participants</span>
                    <div className="participant-picker">
                      {gccLeaders.map(leader => (
                        <label key={leader.id} className="participant-checkbox">
                          <input
                            type="checkbox"
                            checked={modalParticipants.includes(leader.name)}
                            onChange={e => {
                              if (e.target.checked) {
                                setModalParticipants([...modalParticipants, leader.name]);
                              } else {
                                setModalParticipants(modalParticipants.filter(p => p !== leader.name));
                              }
                            }}
                          />
                          <Avatar name={leader.name} size="xs" />
                          <span>{leader.name}</span>
                          <small>{leader.role}</small>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {modal==='meeting' && <><label className="form-label">Time<input type="time" name="time" defaultValue={edit?.time||'09:00'} className="form-input" /></label><label className="form-label">Customer participants<input name="customerParticipants" defaultValue={String(edit?.customerParticipants||'')} className="form-input" /></label><label className="form-label">Discussion summary<textarea name="summary" defaultValue={edit?.summary} className="form-textarea" /></label></>}
              {modal==='action' && <label className="form-label">Progress notes<textarea name="progressNotes" defaultValue={String(edit?.progressNotes||'')} className="form-textarea" /></label>}
              {/* Action-specific fields */}
              {modal === 'action' && (
                <>
                  <div className="form-row">
                    <label className="form-label">
                      Priority
                      <select 
                        name="priority" 
                        defaultValue={edit?.priority || 'Medium'}
                        className="form-select"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </label>
                    <label className="form-label">
                      Status
                      <select 
                        name="status" 
                        defaultValue={edit?.status || 'Open'}
                        className="form-select"
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Delayed</option>
                        <option>Closed</option>
                      </select>
                    </label>
                  </div>
                  <label className="form-label">
                    Description
                    <textarea
                      name="description"
                      defaultValue={edit?.description}
                      placeholder="What needs to be done..."
                      rows={2}
                      className="form-textarea"
                    />
                  </label>
                  <label className="form-label">
                    Closure Notes
                    <textarea
                      name="closure"
                      defaultValue={edit?.closure}
                      placeholder="Required when closing an action..."
                      rows={2}
                      className="form-textarea"
                    />
                  </label>
                  <div className="form-checkboxes">
                    <label className="form-checkbox">
                      <input 
                        type="checkbox" 
                        name="confirmationRequired"
                        defaultChecked={edit?.confirmationRequired}
                      />
                      <span>Customer confirmation required</span>
                    </label>
                    <label className="form-checkbox">
                      <input 
                        type="checkbox" 
                        name="confirmed"
                        defaultChecked={edit?.confirmed}
                      />
                      <span>Customer has confirmed closure</span>
                    </label>
                  </div>
                </>
              )}

              {/* Escalation-specific fields */}
              {modal === 'escalation' && (
                <>
                  <div className="form-row">
                    <label className="form-label">
                      Severity
                      <select
                        name="severity"
                        defaultValue={(edit?.severity as string) || 'high'}
                        className="form-select"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                      </select>
                    </label>
                    <label className="form-label">
                      Status
                      <select
                        name="status"
                        defaultValue={edit?.status || 'Open'}
                        className="form-select"
                      >
                        <option>Open</option>
                        <option>Under Review</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </label>
                  </div>
                  <label className="form-label">
                    Assigned To
                    <select
                      name="assignedTo"
                      defaultValue={(edit?.assignedTo as string) || ''}
                      className="form-select"
                    >
                      <option value="">Select assignee</option>
                      {gccLeaders.map(l => (
                        <option key={l.id} value={sample ? l.name : l.email}>{l.name} - {l.role}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-label">
                    Description
                    <textarea
                      name="description"
                      defaultValue={edit?.description}
                      placeholder="Describe the issue, impact, and why it needs escalation..."
                      rows={3}
                      className="form-textarea"
                    />
                  </label>
                </>
              )}

              {/* Attachments / Evidence (action + feedback) */}
              {(modal === 'action' || modal === 'feedback') && (
                <div className="form-label">
                  <span>Attachments / Evidence</span>
                  <AttachmentUploader
                    recordId={edit?.id}
                    sample={sample}
                    attachments={modalAttachments}
                    onChange={setModalAttachments}
                  />
                </div>
              )}

              <div className="modal-footer">
                <span className="modal-note">
                  {sample 
                    ? 'Preview changes last for this session.'
                    : 'Securely saved to your private workspace.'}
                </span>
                <button className="btn-primary" disabled={busy || (!sample && !loaded)}>
                  {busy ? 'Saving...' : `Save ${modal}`}
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Toast Notification */}
      {loadError && <div role="alert" className="toast">{loadError} <button onClick={()=>window.location.reload()}>Retry</button></div>}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast('')} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
