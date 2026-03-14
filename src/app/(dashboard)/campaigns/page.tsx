"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Megaphone, PlayCircle, Clock, X, Info, AlertCircle, RotateCw } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        templateId: '',
        scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });
    const [isResending, setIsResending] = useState<string | null>(null);

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
            setTemplates(data.filter((t: any) => t.status === 'approved' || true)); // Use true for dev
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/campaigns', newCampaign);
            setIsModalOpen(false);
            fetchCampaigns();
            setNewCampaign({
                name: '',
                templateId: '',
                scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm")
            });
        } catch (err) {
            console.error(err);
            alert('Failed to create campaign');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
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
                                {camp.status === 'completed' ? (
                                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wide uppercase text-blue-700 ring-1 ring-inset ring-blue-600/20">Completed</span>
                                ) : camp.status === 'processing' ? (
                                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold tracking-wide uppercase text-amber-700 ring-1 ring-inset ring-amber-600/20">Processing</span>
                                ) : (
                                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wide uppercase text-slate-600 ring-1 ring-inset ring-slate-500/20">Scheduled</span>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Template Used</span>
                                    <span className="font-medium text-slate-700">{camp.template?.templateName || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Target Tags</span>
                                    <span className="font-medium text-slate-700">{camp.targetTags?.length ? camp.targetTags.join(', ') : 'All Contacts'}</span>
                                </div>
                            </div>
                        </div>

                        {camp.status === 'completed' && camp.stats && (
                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 divide-y divide-slate-200">
                                <div className="grid grid-cols-3 divide-x divide-slate-200 text-center pb-3">
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sent</div>
                                        <div className="mt-1 font-bold text-slate-900">{camp.stats.sent}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Delivered</div>
                                        <div className="mt-1 font-bold text-emerald-600">{camp.stats.delivered}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Failed</div>
                                        <div className="mt-1 font-bold text-rose-600">{camp.stats.failed}</div>
                                    </div>
                                </div>

                                {camp.stats.failed > 0 && (
                                    <div className="pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> Failure Reasons
                                            </span>
                                            <button
                                                onClick={() => handleResendFailed(camp.id)}
                                                disabled={isResending === camp.id}
                                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                {isResending === camp.id ? 'Launching...' : (
                                                    <><RotateCw className="h-3 w-3" /> Resend to Failed</>
                                                )}
                                            </button>
                                        </div>
                                        <div className="max-h-24 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                            {(camp.failureHistory || []).slice(0, 5).map((f: any, idx: number) => (
                                                <div key={idx} className="text-[10px] bg-white p-2 rounded border border-rose-100 text-slate-600">
                                                    <span className="font-bold">{f.phone}</span>: {f.reason}
                                                </div>
                                            ))}
                                            {(camp.failureHistory?.length || 0) > 5 && (
                                                <div className="text-[9px] text-center text-slate-400 italic">...and {(camp.failureHistory?.length || 0) - 5} more</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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

            {/* Create Campaign Modal */}
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

                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-5">
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
                                    onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
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
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
                                >
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
