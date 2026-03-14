"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MessageSquare, Users, FileText, Activity } from 'lucide-react';

export default function ShopDashboard() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/shops/me');
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    if (!data) return <div className="p-8">Loading overview...</div>;

    const stats = [
        { name: 'Total Messages sent', value: data.stats.totalMessages, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Total Contacts', value: data.stats.totalContacts, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { name: 'Templates Used', value: data.stats.totalTemplates, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
        { name: 'Subscription API', value: data.shop.subscription?.status || 'Unknown', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="page-header items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back, {data.shop.shopName}</h1>
                    <p className="mt-2 text-sm text-slate-500">Here's what is happening with your WhatsApp metrics today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl ${stat.bg} p-3 transition-transform group-hover:scale-110`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-slate-50 transition-transform group-hover:scale-150 opacity-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
