"use client";

import { useAuth } from '@/components/providers';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LogOut, Settings, LayoutDashboard, ClipboardList } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    if (!user || user.role !== 'admin') {
        return <div className="p-10 text-center">Unauthorized. Admins only.</div>;
    }

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users Management', href: '/admin/shops', icon: Users },
        { name: 'Registration Requests', href: '/admin/requests', icon: ClipboardList },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="flex h-16 items-center border-b px-6">
                    <span className="text-xl font-bold text-blue-600">AdminPanel</span>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-4 w-64 px-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto bg-gray-50/50">
                <div className="dashboard-container layout-padding">
                    {children}
                </div>
            </main>
        </div>
    );
}
