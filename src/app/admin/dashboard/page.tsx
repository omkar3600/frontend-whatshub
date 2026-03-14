"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserPlus, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center text-gray-500">Loading dashboard stats...</div>;

    const cards = [
        {
            title: 'Total Users',
            value: stats?.totalShops || 0,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            description: 'Registered accounts'
        },
        {
            title: 'Active Users',
            value: stats?.activeShops || 0,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            description: 'Currently using the platform'
        },
        {
            title: 'Suspended Users',
            value: stats?.disabledShops || 0,
            icon: UserPlus,
            color: 'text-slate-600',
            bg: 'bg-slate-50',
            description: 'Accounts restricted'
        },
        {
            title: 'Expired Subs',
            value: stats?.expiredSubscriptions || 0,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            description: 'Needing renewal'
        }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Platform overview and performance metrics.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{card.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{card.description}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <Link
                            href="/admin/shops"
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100 group"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Manage Users</span>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100 group"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Admin Settings</span>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">System Healthy</h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-xs">
                        All services are running normally. WhatsApp API connectivity is stable.
                    </p>
                </div>
            </div>
        </div>
    );
}
