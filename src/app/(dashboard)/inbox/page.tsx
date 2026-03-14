"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/providers';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Search, Send, File, Image as ImageIcon, Check, CheckCheck, MessageSquare, ArrowRight, FileText, Zap, Paperclip } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function InboxPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const convoIdParam = searchParams.get('convoId');

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvo, setActiveConvo] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeConvoRef = useRef(activeConvo);

    useEffect(() => {
        activeConvoRef.current = activeConvo;
    }, [activeConvo]);

    useEffect(() => {
        fetchConversations();

        // Connect to WebSocket
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        socketRef.current = io(socketUrl);

        if (user?.shopId) {
            socketRef.current.emit('joinRoom', user.shopId);
        }

        socketRef.current.on('newMessage', (msg) => {
            // When a new message comes in, update state
            setMessages((prev) => {
                // if it belongs to active convo, append it
                if (activeConvoRef.current && msg.conversationId === activeConvoRef.current.id) {
                    return [...prev, msg];
                }
                return prev;
            });
            fetchConversations(); // refresh the sidebar list ordering and unread counts
        });

        socketRef.current.on('read', ({ conversationId }) => {
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                )
            );
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (activeConvo) {
            fetchMessages(activeConvo.id);
            // mark as read
            api.put(`/conversations/${activeConvo.id}/read`).then(() => fetchConversations());
        }
        fetchTemplates();
    }, [activeConvo]);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/templates');
            setTemplates(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/conversations');
            setConversations(res.data);

            // If we have an active convo, update its data from the fresh list
            if (activeConvo) {
                const updated = res.data.find((c: any) => c.id === activeConvo.id);
                if (updated) setActiveConvo(updated);
            } else if (convoIdParam) {
                // If it's the first load and we have a convoId in the URL, select it
                const targetConvo = res.data.find((c: any) => c.id === convoIdParam);
                if (targetConvo) {
                    setActiveConvo(targetConvo);
                    setShowMobileChat(true);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const res = await api.get(`/messages/conversation/${id}`);
            setMessages(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSendTemplate = async (template: any) => {
        setShowTemplatePicker(false);
        if (!activeConvo) return;

        try {
            await api.post(`/messages/conversation/${activeConvo.id}`, {
                type: 'template',
                content: template.name
            });
            fetchMessages(activeConvo.id);
            fetchConversations();
        } catch (e) {
            console.error('Failed to send template:', e);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConvo) return;

        const url = prompt("Enter public URL for this media (Meta requires a public link):");
        if (!url) return;

        let type = 'image';
        if (file.type.startsWith('video')) type = 'video';
        if (file.type.startsWith('application')) type = 'document';
        if (file.type.startsWith('audio')) type = 'audio';

        try {
            await api.post(`/messages/conversation/${activeConvo.id}`, {
                type,
                content: file.name,
                mediaUrl: url
            });
            fetchMessages(activeConvo.id);
            fetchConversations();
        } catch (e) {
            console.error('Failed to send media:', e);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMsg.trim() || !activeConvo) return;

        const content = inputMsg;
        setInputMsg('');

        // Optimistic UI update
        const tempMsg = {
            id: Date.now().toString(),
            direction: 'outbound',
            type: 'text',
            content,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, tempMsg]);

        try {
            await api.post(`/messages/conversation/${activeConvo.id}`, {
                type: 'text',
                content
            });
            fetchMessages(activeConvo.id);
            fetchConversations();
        } catch (e) {
            console.error('Failed to send:', e);
            // Ideally remove optimistic message or mark failed
        }
    };

    return (
        <div className="flex h-full md:h-[calc(100vh-8rem)] overflow-hidden md:rounded-2xl bg-white md:shadow-sm md:ring-1 md:ring-slate-200">

            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-1/3 flex-shrink-0 border-r border-slate-200 md:flex flex-col bg-slate-50 relative ${showMobileChat ? 'hidden' : 'flex'}`}>
                <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
                    <h2 className="text-xl font-bold text-slate-800">Inbox</h2>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto w-full">
                    {conversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => {
                                setActiveConvo(c);
                                setShowMobileChat(true);
                                router.push(`/inbox?convoId=${c.id}`, { scroll: false });
                            }}
                            className={`flex items-center gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeConvo?.id === c.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-slate-100 border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                                    {(c.contact?.name || c.contact?.phone || '??').substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">{c.contact?.name || c.contact?.phone}</h3>
                                    <span className="text-[10px] font-medium text-slate-400">{c.lastMessageAt ? format(new Date(c.lastMessageAt), 'HH:mm') : ''}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-500 truncate mr-2">{c.contact?.phone}</p>
                                    {c.unreadCount > 0 && (
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                                            {c.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-sm text-slate-400 font-medium">No active conversations.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 md:flex flex-col bg-[#e5ddd5]/20 relative ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                {activeConvo ? (
                    <>
                        {/* Chat Header - Sticky on mobile */}
                        <div className="h-16 flex-shrink-0 px-4 md:px-6 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center sticky top-0 z-20 shadow-sm">
                            <button
                                onClick={() => {
                                    setShowMobileChat(false);
                                    setActiveConvo(null);
                                    router.push('/inbox', { scroll: false });
                                }}
                                className="mr-2 p-2 hover:bg-slate-100 rounded-full md:hidden"
                                title="Back to list"
                            >
                                <ArrowRight className="h-5 w-5 rotate-180 text-slate-600" />
                            </button>
                            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mr-3 md:mr-4">
                                {activeConvo.contact?.name ? activeConvo.contact.name.substring(0, 2).toUpperCase() : 'WH'}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800">{activeConvo.contact?.name || activeConvo.contact?.phone}</h2>
                                <p className="text-xs text-emerald-600 font-medium">{activeConvo.contact?.phone}</p>
                            </div>

                            {/* Template Picker */}
                            <div className="ml-auto relative">
                                <button
                                    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center shadow-sm"
                                    title="Quick Templates"
                                >
                                    <Zap className="h-5 w-5 fill-emerald-600" />
                                </button>

                                {showTemplatePicker && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                                            <h4 className="text-xs font-bold text-slate-700">Quick Templates</h4>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {templates.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSendTemplate(t)}
                                                    className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                                                >
                                                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{t.content}</p>
                                                </button>
                                            ))}
                                            {templates.length === 0 && (
                                                <div className="p-4 text-center text-xs text-slate-400 font-medium">No templates found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 overscroll-contain">
                            {messages.map((m, i) => {
                                const isOutbound = m.direction === 'outbound';
                                return (
                                    <div key={m.id || i} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isOutbound ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white rounded-tl-sm text-slate-800 ring-1 ring-slate-100'
                                            }`}>
                                            {m.type === 'text' && <p className="text-sm">{m.content}</p>}
                                            {m.type === 'image' && <img src={m.mediaUrl} alt="media" className="max-w-xs rounded-lg mb-2" />}
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isOutbound ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {m.timestamp && format(new Date(m.timestamp), 'HH:mm')}
                                                {isOutbound && (
                                                    m.status === 'read' ? <CheckCheck className="h-3 w-3 text-blue-200" /> :
                                                        m.status === 'delivered' ? <CheckCheck className="h-3 w-3" /> :
                                                            m.status === 'sent' ? <Check className="h-3 w-3" /> : null
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200 flex gap-4 items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach File"
                                className="text-slate-400 hover:text-emerald-500 transition-colors p-2 bg-slate-100 rounded-full hover:bg-emerald-50"
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <form onSubmit={handleSend} className="flex-1 flex gap-4">
                                <input
                                    type="text"
                                    value={inputMsg}
                                    onChange={e => setInputMsg(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                                />
                                <button type="submit" disabled={!inputMsg.trim()} className="h-11 w-11 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-emerald-600 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                                    <Send className="h-5 w-5 ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-200">
                            <MessageSquare className="h-10 w-10 text-emerald-200" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">Select a conversation to start messaging</p>
                        <p className="text-sm mt-2 text-slate-400">View real-time messages from your WhatsHub customers.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
