"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Bot, Plus, Trash2, Power, Zap, MessageSquare, Clock } from 'lucide-react';

export default function AutomationsPage() {
    const [automations, setAutomations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAutomation, setNewAutomation] = useState({
        type: 'keyword',
        triggerKeyword: '',
        replyText: '',
    });

    useEffect(() => {
        fetchAutomations();
    }, []);

    const fetchAutomations = async () => {
        try {
            const { data } = await api.get('/automations');
            setAutomations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/automations', newAutomation);
            setIsModalOpen(false);
            setNewAutomation({ type: 'keyword', triggerKeyword: '', replyText: '' });
            fetchAutomations();
        } catch (err) {
            console.error(err);
            alert('Failed to create automation');
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await api.put(`/automations/${id}`, { isActive: !current });
            fetchAutomations();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAutomation = async (id: string) => {
        if (!confirm('Delete this automation?')) return;
        try {
            await api.delete(`/automations/${id}`);
            fetchAutomations();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading automations...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Smart Automations</h1>
                    <p className="text-sm text-slate-500">Set up automatic replies and triggers for your WhatsApp chats.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Automation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automations.map((auto) => (
                    <div key={auto.id} className={`bg-white p-6 rounded-2xl border ${auto.isActive ? 'border-emerald-100 shadow-emerald-50' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-lg ${auto.type === 'welcome' ? 'bg-blue-50 text-blue-600' : auto.type === 'away' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                                {auto.type === 'welcome' ? <Zap className="h-5 w-5" /> : auto.type === 'away' ? <Clock className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatus(auto.id, auto.isActive)}
                                    className={`p-1 rounded-md transition-colors ${auto.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <Power className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => deleteAutomation(auto.id)}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-900 capitalize mb-1">{auto.type} Response</h3>
                        {auto.triggerKeyword && (
                            <p className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-block mb-3">
                                Trigger: "{auto.triggerKeyword}"
                            </p>
                        )}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                            <p className="text-sm text-slate-600 italic line-clamp-3">
                                "{auto.replyText}"
                            </p>
                        </div>
                    </div>
                ))}

                {automations.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                        <Bot className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No automations Yet</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                            Save time by automating common customer interactions and welcome messages.
                        </p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Create Automation</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Automation Type</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newAutomation.type}
                                    onChange={(e) => setNewAutomation({ ...newAutomation, type: e.target.value })}
                                >
                                    <option value="keyword">Keyword Trigger</option>
                                    <option value="welcome">Welcome Message</option>
                                    <option value="away">Away Reply</option>
                                </select>
                            </div>

                            {newAutomation.type === 'keyword' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Keyword</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 'price' or 'location'"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newAutomation.triggerKeyword}
                                        onChange={(e) => setNewAutomation({ ...newAutomation, triggerKeyword: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reply Text</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter the automated response message..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newAutomation.replyText}
                                    onChange={(e) => setNewAutomation({ ...newAutomation, replyText: e.target.value })}
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-md transition-all"
                                >
                                    Save Automation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
