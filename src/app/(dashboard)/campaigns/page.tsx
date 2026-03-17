"use client";

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import {
    Plus, Megaphone, Clock, X, Info, AlertCircle, RotateCw,
    BarChart3, CheckCircle2, Eye, MousePointerClick, XCircle,
    Send, Users, Tag, ChevronRight, Loader2, CheckSquare, Square
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CampaignContact {
    id: string;
    phone: string;
    name: string;
    status: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
    failReason?: string;
    sentAt: string;
}

interface Analytics {
    campaign: any;
    stats: { total: number; sent: number; delivered: number; read: number; clicked: number; failed: number };
    contacts: {
        sent: CampaignContact[];
        delivered: CampaignContact[];
        read: CampaignContact[];
        clicked: CampaignContact[];
        failed: CampaignContact[];
    };
}

type Tab = 'all' | 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    sent:      { label: 'Sent',       color: 'text-sky-600',    bg: 'bg-sky-50',    ring: 'ring-sky-500/20',    icon: Send },
    delivered: { label: 'Delivered',  color: 'text-emerald-600',bg: 'bg-emerald-50',ring: 'ring-emerald-500/20', icon: CheckCircle2 },
    read:      { label: 'Read',       color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-500/20',  icon: Eye },
    clicked:   { label: 'Clicked',    color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-500/20',  icon: MousePointerClick },
    failed:    { label: 'Failed',     color: 'text-rose-600',   bg: 'bg-rose-50',   ring: 'ring-rose-500/20',    icon: XCircle },
};

// ─── Helper ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.color} ${cfg.bg} ring-1 ring-inset ${cfg.ring}`}>
            <Icon className="h-3 w-3" /> {cfg.label}
        </span>
    );
}

function CampaignStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        completed:  'bg-blue-50 text-blue-700 ring-blue-600/20',
        processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        scheduled:  'bg-slate-100 text-slate-600 ring-slate-500/20',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${map[status] || map.scheduled}`}>
            {status}
        </span>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isResending, setIsResending] = useState<string | null>(null);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        templateId: '',
        scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [templateParams, setTemplateParams] = useState<{ [key: string]: string }>({});
    const [headerMediaUrl, setHeaderMediaUrl] = useState('');

    // Analytics drawer
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
    const [tagInput, setTagInput] = useState('');
    const [tagsModalOpen, setTagsModalOpen] = useState(false);
    const [isTagging, setIsTagging] = useState(false);

    useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const { data } = await api.get('/campaigns');
            setCampaigns(data);
        } catch (err) {
            console.error(err);
        }
    };

    const openAnalytics = async (campId: string) => {
        setAnalyticsOpen(true);
        setAnalyticsLoading(true);
        setAnalytics(null);
        setActiveTab('all');
        setSelectedPhones(new Set());
        try {
            const { data } = await api.get(`/campaigns/${campId}/analytics`);
            setAnalytics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Build contact list for current tab
    const tabContacts = useCallback((): CampaignContact[] => {
        if (!analytics) return [];
        if (activeTab === 'all') {
            return [
                ...analytics.contacts.sent,
                ...analytics.contacts.delivered,
                ...analytics.contacts.read,
                ...analytics.contacts.clicked,
                ...analytics.contacts.failed,
            ];
        }
        return analytics.contacts[activeTab] || [];
    }, [analytics, activeTab]);

    const togglePhone = (phone: string) => {
        setSelectedPhones(prev => {
            const next = new Set(prev);
            next.has(phone) ? next.delete(phone) : next.add(phone);
            return next;
        });
    };

    const toggleAll = () => {
        const contacts = tabContacts();
        if (selectedPhones.size === contacts.length) {
            setSelectedPhones(new Set());
        } else {
            setSelectedPhones(new Set(contacts.map(c => c.phone)));
        }
    };

    const handleAddTags = async () => {
        if (!analytics || !tagInput.trim()) return;
        const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length === 0) return;
        const count = selectedPhones.size; // capture before clearing
        setIsTagging(true);
        try {
            await api.post(`/campaigns/${analytics.campaign.id}/contacts/add-tags`, {
                phones: Array.from(selectedPhones),
                tags,
            });
            setTagsModalOpen(false);
            setTagInput('');
            setSelectedPhones(new Set());
            alert(`Tags added successfully to ${count} contacts!`);
        } catch (err) {
            console.error(err);
            alert('Failed to add tags');
        } finally {
            setIsTagging(false);
        }
    };

    const handleResendFailed = async (campId: string) => {
        if (!confirm('Resend message to all failed contacts?')) return;
        setIsResending(campId);
        try {
            await api.post(`/campaigns/${campId}/resend-failed`);
            alert('Retry campaign launched!');
            fetchCampaigns();
        } catch (err) {
            console.error(err);
            alert('Failed to resend');
        } finally {
            setIsResending(null);
        }
    };

    const fetchTemplates = async () => {
        try {
            const { data } = await api.get('/templates');
            setTemplates(data.filter((t: any) => t.status === 'approved' || true));
        } catch (err) {
            console.error(err);
        }
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setNewCampaign({ ...newCampaign, templateId: val });
        const t = templates.find(t => t.id === val);
        setSelectedTemplate(t || null);
        setTemplateParams({});
        setHeaderMediaUrl('');
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const components: any[] = [];
            if (selectedTemplate) {
                const header = selectedTemplate.components?.find((c: any) => c.type === 'HEADER');
                if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format) && headerMediaUrl) {
                    components.push({
                        type: 'header',
                        parameters: [{ type: header.format.toLowerCase(), [header.format.toLowerCase()]: { link: headerMediaUrl } }]
                    });
                }
                const body = selectedTemplate.components?.find((c: any) => c.type === 'BODY')?.text || '';
                const matches = body.match(/\{\{(\d+)\}\}/g) || [];
                const uniqueVars = Array.from(new Set(matches)).sort() as string[];
                if (uniqueVars.length > 0) {
                    components.push({
                        type: 'body',
                        parameters: uniqueVars.map((v: string) => ({ type: 'text', text: templateParams[v] || '' }))
                    });
                }
            }
            await api.post('/campaigns', {
                ...newCampaign,
                templateParams: components.length > 0 ? components : undefined,
                headerMediaUrl: headerMediaUrl || undefined
            });
            setIsModalOpen(false);
            fetchCampaigns();
            setNewCampaign({ name: '', templateId: '', scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
            setSelectedTemplate(null);
            setTemplateParams({});
            setHeaderMediaUrl('');
        } catch (err) {
            console.error(err);
            alert('Failed to create campaign');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Aggregate summary across all campaigns
    const globalStats = campaigns.reduce((acc, c) => {
        acc.total++;
        if (c.stats) {
            acc.sent += c.stats.sent || 0;
            acc.delivered += c.stats.delivered || 0;
            acc.read += c.stats.read || 0;
            acc.clicked += c.stats.clicked || 0;
            acc.failed += c.stats.failed || 0;
        }
        return acc;
    }, { total: 0, sent: 0, delivered: 0, read: 0, clicked: 0, failed: 0 });

    const contacts = tabContacts();
    const allSelected = contacts.length > 0 && selectedPhones.size === contacts.length;

    const tabs: { key: Tab; label: string; count: number; color: string }[] = analytics ? [
        { key: 'all',       label: 'All',       count: analytics.stats.total,     color: 'text-slate-700' },
        { key: 'sent',      label: 'Sent',      count: analytics.stats.sent,      color: 'text-sky-600' },
        { key: 'delivered', label: 'Delivered', count: analytics.stats.delivered, color: 'text-emerald-600' },
        { key: 'read',      label: 'Read',      count: analytics.stats.read,      color: 'text-violet-600' },
        { key: 'clicked',   label: 'Clicked',   count: analytics.stats.clicked,   color: 'text-orange-600' },
        { key: 'failed',    label: 'Failed',    count: analytics.stats.failed,    color: 'text-rose-600' },
    ] : [];

    return (
        <div className="animate-in fade-in duration-500">
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Broadcast Campaigns</h1>
                    <p className="text-sm text-slate-500">Send mass messages to your targeted contacts.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Campaign
                </button>
            </div>

            {/* ── Global Summary Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: 'Total Campaigns', value: globalStats.total, icon: Megaphone,         color: 'text-slate-700', bg: 'bg-slate-100' },
                    { label: 'Total Sent',       value: globalStats.sent,      icon: Send,          color: 'text-sky-600',    bg: 'bg-sky-100' },
                    { label: 'Delivered',        value: globalStats.delivered, icon: CheckCircle2,  color: 'text-emerald-600',bg: 'bg-emerald-100' },
                    { label: 'Read',             value: globalStats.read,      icon: Eye,           color: 'text-violet-600', bg: 'bg-violet-100' },
                    { label: 'Clicked',          value: globalStats.clicked,   icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { label: 'Failed',           value: globalStats.failed,    icon: XCircle,       color: 'text-rose-600',   bg: 'bg-rose-100' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <div className={`text-xl font-bold ${color}`}>{value}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-tight">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Campaign Cards Grid ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(camp => (
                    <div key={camp.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{camp.name}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="h-3 w-3" /> {format(new Date(camp.scheduledAt), 'PPp')}
                                        </p>
                                    </div>
                                </div>
                                <CampaignStatusBadge status={camp.status} />
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Template</span>
                                    <span className="font-medium text-slate-700">{camp.template?.templateName || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Target Tags</span>
                                    <span className="font-medium text-slate-700">
                                        {camp.targetTags?.length ? camp.targetTags.join(', ') : 'All Contacts'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Compact stats strip */}
                        {camp.stats && (
                            <div className="border-t border-slate-100 bg-slate-50 px-5 py-2">
                                <div className="grid grid-cols-4 divide-x divide-slate-200 text-center">
                                    {[
                                        { key: 'sent',      label: 'Sent',      val: camp.stats.sent,      color: 'text-sky-600' },
                                        { key: 'delivered', label: 'Delivered', val: camp.stats.delivered, color: 'text-emerald-600' },
                                        { key: 'read',      label: 'Read',      val: camp.stats.read ?? 0, color: 'text-violet-600' },
                                        { key: 'failed',    label: 'Failed',    val: camp.stats.failed,    color: 'text-rose-600' },
                                    ].map(({ key, label, val, color }) => (
                                        <div key={key} className="px-1">
                                            <div className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</div>
                                            <div className={`font-bold text-sm ${color}`}>{val ?? 0}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
                            <button
                                onClick={() => openAnalytics(camp.id)}
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <BarChart3 className="h-3.5 w-3.5" />
                                View Analytics
                                <ChevronRight className="h-3 w-3" />
                            </button>

                            {camp.status === 'completed' && (camp.stats?.failed ?? 0) > 0 && (
                                <button
                                    onClick={() => handleResendFailed(camp.id)}
                                    disabled={isResending === camp.id}
                                    className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isResending === camp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                                    Resend Failed
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    <Megaphone className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-medium text-slate-900">No campaigns yet</p>
                    <p className="mt-1 text-sm">Create your first broadcast to reach your audience.</p>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                Analytics Drawer
            ════════════════════════════════════════════════════════════════════ */}
            {analyticsOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => { setAnalyticsOpen(false); setAnalytics(null); }}
                    />

                    {/* Drawer */}
                    <div className="ml-auto relative z-10 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        {analytics ? analytics.campaign.name : 'Campaign Analytics'}
                                    </h2>
                                    {analytics && (
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(analytics.campaign.scheduledAt), 'PPp')}
                                            <CampaignStatusBadge status={analytics.campaign.status} />
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setAnalyticsOpen(false); setAnalytics(null); }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {analyticsLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            </div>
                        ) : analytics ? (
                            <>
                                {/* Stats row */}
                                <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {[
                                            { label: 'Total',     value: analytics.stats.total,     color: 'text-slate-700', bg: 'bg-slate-100' },
                                            { label: 'Sent',      value: analytics.stats.sent,      color: 'text-sky-600',    bg: 'bg-sky-100' },
                                            { label: 'Delivered', value: analytics.stats.delivered, color: 'text-emerald-600',bg: 'bg-emerald-100' },
                                            { label: 'Read',      value: analytics.stats.read,      color: 'text-violet-600', bg: 'bg-violet-100' },
                                            { label: 'Clicked',   value: analytics.stats.clicked,   color: 'text-orange-600', bg: 'bg-orange-100' },
                                            { label: 'Failed',    value: analytics.stats.failed,    color: 'text-rose-600',   bg: 'bg-rose-100' },
                                        ].map(({ label, value, color, bg }) => (
                                            <div key={label} className={`rounded-xl ${bg} p-3 text-center`}>
                                                <div className={`text-2xl font-black ${color}`}>{value}</div>
                                                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress bar */}
                                    {analytics.stats.total > 0 && (
                                        <div className="mt-3 h-2 rounded-full overflow-hidden bg-slate-100 flex">
                                            {analytics.stats.read > 0 && (
                                                <div title="Read" className="bg-violet-500 transition-all" style={{ width: `${(analytics.stats.read / analytics.stats.total) * 100}%` }} />
                                            )}
                                            {((analytics.stats.delivered - analytics.stats.read) > 0) && (
                                                <div title="Delivered" className="bg-emerald-500 transition-all" style={{ width: `${((analytics.stats.delivered - analytics.stats.read) / analytics.stats.total) * 100}%` }} />
                                            )}
                                            {((analytics.stats.sent - analytics.stats.delivered) > 0) && (
                                                <div title="Sent" className="bg-sky-400 transition-all" style={{ width: `${((analytics.stats.sent - analytics.stats.delivered) / analytics.stats.total) * 100}%` }} />
                                            )}
                                            {analytics.stats.failed > 0 && (
                                                <div title="Failed" className="bg-rose-400 transition-all" style={{ width: `${(analytics.stats.failed / analytics.stats.total) * 100}%` }} />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="px-6 pt-3 border-b border-slate-100 shrink-0 overflow-x-auto">
                                    <div className="flex gap-1 min-w-max">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => { setActiveTab(tab.key); setSelectedPhones(new Set()); }}
                                                className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                                                    activeTab === tab.key
                                                        ? `border-emerald-500 ${tab.color} bg-emerald-50`
                                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                {tab.label}
                                                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                                                    activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}>{tab.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bulk action bar */}
                                {selectedPhones.size > 0 && (
                                    <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <span className="text-xs font-bold text-emerald-700">
                                            <Users className="h-3.5 w-3.5 inline mr-1" />
                                            {selectedPhones.size} contact{selectedPhones.size > 1 ? 's' : ''} selected
                                        </span>
                                        <button
                                            onClick={() => setTagsModalOpen(true)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Tag className="h-3.5 w-3.5" />
                                            Add Tags
                                        </button>
                                    </div>
                                )}

                                {/* Contact list */}
                                <div className="flex-1 overflow-y-auto">
                                    {contacts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                            <Users className="h-10 w-10 mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No contacts in this category</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-white border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-2.5 text-left w-8">
                                                        <button onClick={toggleAll} className="text-slate-400 hover:text-emerald-600">
                                                            {allSelected
                                                                ? <CheckSquare className="h-4 w-4 text-emerald-600" />
                                                                : <Square className="h-4 w-4" />}
                                                        </button>
                                                    </th>
                                                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                                                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                                                    <th className="px-2 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-2 py-2.5 pr-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {contacts.map((c) => (
                                                    <tr
                                                        key={c.id}
                                                        onClick={() => togglePhone(c.phone)}
                                                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedPhones.has(c.phone) ? 'bg-emerald-50' : ''}`}
                                                    >
                                                        <td className="px-6 py-3">
                                                            {selectedPhones.has(c.phone)
                                                                ? <CheckSquare className="h-4 w-4 text-emerald-600" />
                                                                : <Square className="h-4 w-4 text-slate-300" />}
                                                        </td>
                                                        <td className="px-2 py-3 font-medium text-slate-800">{c.name}</td>
                                                        <td className="px-2 py-3 text-slate-500 font-mono text-xs">{c.phone}</td>
                                                        <td className="px-2 py-3">
                                                            <StatusBadge status={c.status} />
                                                            {c.failReason && (
                                                                <p className="text-[10px] text-rose-500 mt-0.5 truncate max-w-[120px]" title={c.failReason}>
                                                                    {c.failReason}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-3 pr-6 text-xs text-slate-400 whitespace-nowrap">
                                                            {format(new Date(c.sentAt), 'MMM d, HH:mm')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                <AlertCircle className="h-6 w-6 mr-2" /> Failed to load analytics.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tags Modal ─────────────────────────────────────────────────── */}
            {tagsModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-150">
                        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-emerald-600" /> Add Tags to {selectedPhones.size} Contact{selectedPhones.size > 1 ? 's' : ''}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Enter one or more tags separated by commas.</p>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. vip, summer-sale, interested"
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50 mb-4"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddTags(); }}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setTagsModalOpen(false); setTagInput(''); }}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTags}
                                disabled={isTagging || !tagInput.trim()}
                                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isTagging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                                {isTagging ? 'Saving...' : 'Apply Tags'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Campaign Modal ─────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Create Campaign</h2>
                                <p className="text-xs text-slate-500 mt-1">Configure a new broadcast message.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Summer Sale 2024"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Template</label>
                                <select
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50"
                                    value={newCampaign.templateId}
                                    onChange={handleTemplateChange}
                                >
                                    <option value="">Choose a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.templateName}</option>
                                    ))}
                                </select>
                                {templates.length === 0 && (
                                    <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                                        <Info className="h-3 w-3" /> No approved templates found.
                                    </p>
                                )}
                            </div>

                            {selectedTemplate && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Variables</h4>
                                    {selectedTemplate.components?.some((c: any) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">Header Media URL <Info className="h-3 w-3 text-slate-400" /></label>
                                            <input type="url" placeholder="https://example.com/media.png" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50" value={headerMediaUrl} onChange={e => setHeaderMediaUrl(e.target.value)} required />
                                        </div>
                                    )}
                                    {(() => {
                                        const body = selectedTemplate.components?.find((c: any) => c.type === 'BODY')?.text || '';
                                        const matches = body.match(/\{\{(\d+)\}\}/g) || [];
                                        const uniqueVars = Array.from(new Set(matches)).sort() as string[];
                                        if (uniqueVars.length === 0 && !selectedTemplate.components?.some((c: any) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format))) {
                                            return <p className="text-[10px] text-slate-400 italic">No dynamic variables needed for this template.</p>;
                                        }
                                        return uniqueVars.map((v: string) => (
                                            <div key={v}>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Variable {v}</label>
                                                <input type="text" placeholder={`Value for ${v}`} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50" value={templateParams[v] || ''} onChange={e => setTemplateParams({ ...templateParams, [v]: e.target.value })} required />
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Schedule Send Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50"
                                    value={newCampaign.scheduledAt}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50">
                                    {isSaving ? 'Creating...' : 'Launch Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
