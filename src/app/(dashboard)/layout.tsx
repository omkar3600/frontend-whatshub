"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Megaphone,
    Zap,
    Settings,
    LogOut,
    Bot,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const pathnameRef = useRef(pathname);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const socket = io(socketUrl, { reconnectionAttempts: 5 });
        socketRef.current = socket;

        socket.on('connect', () => {
            if (user?.shopId) {
                socket.emit('joinRoom', user.shopId);
            }
        });

        socket.on('newMessage', (msg) => {
            const isHidden = document.visibilityState === 'hidden';
            const isOnInbox = pathnameRef.current.startsWith('/inbox');
            const shouldNotify = isHidden || !isOnInbox;

            if (shouldNotify && Notification.permission === 'granted') {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                audio.play().catch(() => { });

                new Notification(`WhatsHub: ${msg.contact?.name || msg.contact?.phone || 'New Message'}`, {
                    body: msg.content || 'Sent an attachment',
                    icon: '/favicon.ico',
                    tag: 'new-message',
                } as NotificationOptions);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    if (!user || user.role !== 'user') {
        return <div className="p-10 text-center">Unauthorized. Loading...</div>;
    }

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inbox', href: '/inbox', icon: MessageSquare },
        { name: 'Contacts', href: '/contacts', icon: Users },
        { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
        { name: 'Templates', href: '/templates', icon: Zap },
        { name: 'Automations', href: '/automations', icon: Bot },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isChatActive = pathname.startsWith('/inbox') && searchParams.get('convoId');

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden flex-col md:flex-row">
            {/* Mobile Header */}
            {!isChatActive && (
                <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden shadow-sm z-50">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-md">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900 tracking-tight">WhatsHub</span>
                    </Link>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 text-xs">
                        {(user.username || user.email || '?').substring(0, 2).toUpperCase()}
                    </div>
                </header>
            )}

            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out relative flex-shrink-0 z-40 ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg hover:text-white transition-all hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className={`flex h-16 items-center border-b border-white/5 px-6 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : ''}`}>
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold text-white tracking-tight animate-in fade-in zoom-in duration-500">
                                WhatsHub
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="p-4 space-y-1.5 mt-4 flex-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.name : ''}
                                className={`flex items-center rounded-xl transition-all duration-200 group relative ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                                    } ${active
                                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
                                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-emerald-400'}`} />
                                {!isCollapsed && (
                                    <span className="font-medium text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">
                                        {item.name}
                                    </span>
                                )}
                                {active && isCollapsed && (
                                    <div className="absolute left-0 h-6 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
                    <div className={`flex items-center rounded-2xl bg-slate-900/40 p-2 transition-all duration-300 ring-1 ring-white/5 ${isCollapsed ? 'justify-center' : 'gap-3 px-3 hover:bg-slate-900/60'}`}>
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-lg ring-1 ring-white/20">
                            {(user.username || user.email || '?').substring(0, 1).toUpperCase()}
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500 animate-pulse" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="truncate text-xs font-bold text-white uppercase tracking-wider">{user.username}</p>
                                <p className="truncate text-[10px] text-slate-500 font-medium">{user.shop?.phone || 'No Phone'}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className={`group mt-3 flex w-full items-center rounded-xl text-slate-500 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-400 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                            }`}
                    >
                        <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        {!isCollapsed && <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-500">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation Bar */}
            {!isChatActive && (
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-emerald-500">
                    {navItems.slice(0, 5).map((item) => {
                        const active = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 transition-all duration-200 ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''}`} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 overflow-auto bg-[#fafafa] relative scroll-smooth ${isChatActive ? 'pb-0' : 'pb-16'} md:pb-0`}>
                <div className={`${pathname.startsWith('/inbox') ? 'w-full h-full' : 'dashboard-container layout-padding'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
