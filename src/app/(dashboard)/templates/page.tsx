"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Zap, Plus, ExternalLink, Trash2, RefreshCw, Type, Image as ImageIcon, MessageSquare, Phone, Globe, X, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        templateName: '',
        category: 'UTILITY',
        language: 'en_US',
        headerType: 'NONE' as 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT',
        headerText: '',
        bodyText: '',
        footerText: '',
        buttons: [] as any[],
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/templates');
            setTemplates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addButton = () => {
        if (newTemplate.buttons.length >= 3) return;
        setNewTemplate({
            ...newTemplate,
            buttons: [...newTemplate.buttons, { type: 'QUICK_REPLY', text: '' }]
        });
    };

    const removeButton = (index: number) => {
        setNewTemplate({
            ...newTemplate,
            buttons: newTemplate.buttons.filter((_, i) => i !== index)
        });
    };

    const updateButton = (index: number, updates: any) => {
        const newButtons = [...newTemplate.buttons];
        newButtons[index] = { ...newButtons[index], ...updates };
        setNewTemplate({ ...newTemplate, buttons: newButtons });
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate required fields
        if (!newTemplate.templateName.trim()) {
            alert('Template name is required'); return;
        }
        if (!newTemplate.bodyText.trim()) {
            alert('Body text is required'); return;
        }
        if (newTemplate.headerType === 'TEXT' && !newTemplate.headerText.trim()) {
            alert('Header text is required when header type is TEXT'); return;
        }
        try {
            const components: any[] = [];

            // 1. Header
            if (newTemplate.headerType !== 'NONE') {
                components.push({
                    type: 'HEADER',
                    format: newTemplate.headerType,
                    ...(newTemplate.headerType === 'TEXT' ? { text: newTemplate.headerText } : {})
                });
            }

            // 2. Body
            components.push({
                type: 'BODY',
                text: newTemplate.bodyText,
            });

            // 3. Footer
            if (newTemplate.footerText) {
                components.push({
                    type: 'FOOTER',
                    text: newTemplate.footerText,
                });
            }

            // 4. Buttons
            if (newTemplate.buttons.length > 0) {
                components.push({
                    type: 'BUTTONS',
                    buttons: newTemplate.buttons.map(btn => {
                        const b: any = { type: btn.type, text: btn.text };
                        if (btn.type === 'URL') b.url = btn.url;
                        if (btn.type === 'PHONE_NUMBER') b.phone_number = btn.phone_number;
                        return b;
                    })
                });
            }

            const payload = {
                templateName: newTemplate.templateName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'),
                category: newTemplate.category,
                language: newTemplate.language,
                components
            };
            await api.post('/templates', payload);
            setIsModalOpen(false);
            // Reset ALL fields
            setNewTemplate({ templateName: '', category: 'MARKETING', language: 'en_US', headerType: 'NONE', headerText: '', bodyText: '', footerText: '', buttons: [] });
            fetchTemplates();
        } catch (err: any) {
            console.error(err);
            // Show full Meta error message if available
            const metaMsg = err.response?.data?.message;
            alert(metaMsg || 'Failed to create template. Check the browser console for details.');
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm('Warning: This will permanently delete the template from WhatsHub AND Meta. Any campaigns using this template will also be deleted. Continue?')) return;
        try {
            await api.delete(`/templates/${id}`);
            fetchTemplates();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to delete template';
            alert(msg);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/templates/sync');
            fetchTemplates();
        } catch (err) {
            console.error(err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Message Templates</h1>
                    <p className="text-sm text-slate-500">Manage pre-approved WhatsApp message templates.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Status'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Create Template
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Template Name</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Category</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Language</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Status</th>
                            <th className="px-6 py-4 text-right font-medium uppercase tracking-wider text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            // Skeleton loading rows
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-4 rounded bg-slate-200" />
                                            <div className="h-4 w-36 rounded-md bg-slate-200" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded-md bg-slate-200" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded-md bg-slate-200" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-slate-200" /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <div className="h-6 w-6 rounded bg-slate-200" />
                                            <div className="h-6 w-6 rounded bg-slate-200" />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            templates.map((tpl) => (
                                <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-emerald-500" />
                                        {tpl.templateName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 capitalize">{tpl.category.toLowerCase()}</td>
                                    <td className="px-6 py-4 text-slate-600 uppercase font-mono">{tpl.language}</td>
                                    <td className="px-6 py-4">
                                        {tpl.status === 'approved' ? (
                                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Approved</span>
                                        ) : tpl.status === 'rejected' ? (
                                            <span className="inline-flex rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">Rejected</span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">Pending Review</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded">
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => deleteTemplate(tpl.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-50 rounded">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
                {!loading && templates.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Zap className="mx-auto h-12 w-12 text-emerald-200 mb-3" />
                        <p className="font-medium text-slate-900">No templates found.</p>
                        <p className="text-sm">Create and submit templates to Meta for approval before broadcasting.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">Create Advanced Template</h2>
                                <p className="text-sm text-slate-500">Design your WhatsApp message with headers, footers, and buttons.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Form Side */}
                            <form onSubmit={handleCreateTemplate} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                {/* Basic Info */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <div className="p-1.5 bg-emerald-50 rounded-lg"><Zap className="h-4 w-4" /></div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Template Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. order_confirmation"
                                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
                                                value={newTemplate.templateName}
                                                onChange={(e) => setNewTemplate({ ...newTemplate, templateName: e.target.value })}
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1.5 italic">Auto-sanitized: lowercase, numbers, underscores only.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                    value={newTemplate.category}
                                                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                                >
                                                    <option value="MARKETING">Marketing</option>
                                                    <option value="UTILITY">Utility</option>
                                                    <option value="AUTHENTICATION">Authentication</option>
                                                </select>
                                                {newTemplate.category === 'MARKETING' && (
                                                    <p className="text-[10px] text-amber-500 mt-1.5 font-medium">⚠️ Marketing templates require variable placeholders like <code className="bg-amber-50 px-1 rounded">{'{{1}}'}</code> in the body text.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Language</label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                    value={newTemplate.language}
                                                    onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                                                >
                                                    <option value="en_US">English (US)</option>
                                                    <option value="hi_IN">Hindi (IN)</option>
                                                    <option value="mr_IN">Marathi (IN)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Header Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <div className="p-1.5 bg-blue-50 rounded-lg"><Type className="h-4 w-4" /></div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Header (Optional)</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                            {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewTemplate({ ...newTemplate, headerType: type as any })}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${newTemplate.headerType === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    {type === 'NONE' ? 'Off' : type}
                                                </button>
                                            ))}
                                        </div>
                                        {newTemplate.headerType === 'TEXT' && (
                                            <input
                                                type="text"
                                                maxLength={60}
                                                placeholder="Enter header text..."
                                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                                value={newTemplate.headerText}
                                                onChange={(e) => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                                            />
                                        )}
                                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(newTemplate.headerType) && (
                                            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                                                <ImageIcon className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs text-slate-500 uppercase font-bold">Media Header</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Provide link at broadcast time.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Body Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg"><MessageSquare className="h-4 w-4" /></div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Message Body</h3>
                                    </div>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Hello {{1}}, we have a special offer..."
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={newTemplate.bodyText}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, bodyText: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-400 italic">Use {"{{1}}"}, {"{{2}}"} for placeholders.</p>
                                </section>

                                {/* Footer Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                                        <div className="p-1.5 bg-slate-50 rounded-lg"><Zap className="h-4 w-4" /></div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Footer (Optional)</h3>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={60}
                                        placeholder="e.g. Reply STOP to opt out"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-500/10 transition-all text-slate-500"
                                        value={newTemplate.footerText}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, footerText: e.target.value })}
                                    />
                                </section>

                                {/* Buttons Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-rose-600">
                                            <div className="p-1.5 bg-rose-50 rounded-lg"><Smartphone className="h-4 w-4" /></div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider">Interactive Buttons</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addButton}
                                            disabled={(newTemplate.buttons ?? []).length >= 3}
                                            className="text-[10px] font-bold uppercase px-3 py-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-30 flex items-center gap-1 transition-all"
                                        >
                                            <Plus className="h-3 w-3" /> Add Button
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {(newTemplate.buttons ?? []).map((btn, i) => (
                                            <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative animate-in slide-in-from-top-2 duration-200">
                                                <button onClick={() => removeButton(i)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500">
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <select
                                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold focus:outline-none focus:border-rose-500"
                                                        value={btn.type}
                                                        onChange={(e) => updateButton(i, { type: e.target.value })}
                                                    >
                                                        <option value="QUICK_REPLY">Quick Reply</option>
                                                        <option value="URL">Visit Website</option>
                                                        <option value="PHONE_NUMBER">Call Number</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Button Label"
                                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold focus:outline-none focus:border-rose-500"
                                                        value={btn.text}
                                                        onChange={(e) => updateButton(i, { text: e.target.value })}
                                                    />
                                                </div>
                                                {btn.type === 'URL' && (
                                                    <input
                                                        type="text"
                                                        placeholder="https://example.com"
                                                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] focus:outline-none focus:border-rose-500 font-mono"
                                                        value={btn.url || ''}
                                                        onChange={(e) => updateButton(i, { url: e.target.value })}
                                                    />
                                                )}
                                                {btn.type === 'PHONE_NUMBER' && (
                                                    <input
                                                        type="text"
                                                        placeholder="+1234567890"
                                                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] focus:outline-none focus:border-rose-500 font-mono"
                                                        value={btn.phone_number || ''}
                                                        onChange={(e) => updateButton(i, { phone_number: e.target.value })}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Footer & Action */}
                                <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-black transition-all uppercase tracking-wider"
                                    >
                                        Submit to Meta
                                    </button>
                                </div>
                            </form>

                            {/* Preview Side */}
                            <div className="w-[380px] bg-slate-50 p-8 border-l border-slate-100 hidden lg:flex flex-col items-center">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">WhatsApp Preview</h3>

                                <div className="w-full max-w-[280px] bg-[#E5DDD5] rounded-[30px] p-2 border-[8px] border-slate-900 shadow-2xl relative aspect-[9/18.5]">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-2xl z-10"></div>

                                    <div className="mt-8 space-y-2 p-1">
                                        {/* Message Bubble */}
                                        <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden flex flex-col">
                                            {/* Header Preview */}
                                            {newTemplate.headerType !== 'NONE' && (
                                                <div className="w-full aspect-video bg-slate-100 border-b border-slate-50 flex items-center justify-center p-4">
                                                    {newTemplate.headerType === 'TEXT' ? (
                                                        <span className="text-[11px] font-bold text-slate-800 text-center leading-tight line-clamp-3">
                                                            {newTemplate.headerText || 'Header Text'}
                                                        </span>
                                                    ) : (
                                                        <ImageIcon className="h-10 w-10 text-slate-300" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Body Preview */}
                                            <div className="p-3">
                                                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {newTemplate.bodyText || 'Your message body will appear here...'}
                                                </p>
                                                {newTemplate.footerText && (
                                                    <p className="text-[9px] text-slate-400 mt-1.5 uppercase tracking-wide">
                                                        {newTemplate.footerText}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="px-3 pb-2 self-end">
                                                <span className="text-[8px] text-slate-300 font-medium">10:00 AM</span>
                                            </div>
                                        </div>

                                        {/* Buttons Preview */}
                                        {newTemplate.buttons.map((btn, i) => (
                                            <div key={i} className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm text-center flex items-center justify-center gap-2 border border-white/40">
                                                {btn.type === 'URL' && <Globe className="h-3 w-3 text-blue-500" />}
                                                {btn.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3 text-emerald-500" />}
                                                <span className="text-[10px] font-bold text-blue-600 truncate px-2">
                                                    {btn.text || 'Button text'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-10 flex gap-4 text-slate-300">
                                    <Smartphone className="h-5 w-5" />
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
