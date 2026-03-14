"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    Smartphone,
    Store,
    Search,
    RefreshCw
} from 'lucide-react';

export default function RegistrationRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this user? This will create their account and shop.')) return;
        setProcessingId(id);
        try {
            await api.post(`/admin/requests/${id}/approve`);
            fetchRequests();
        } catch (err) {
            alert('Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        setProcessingId(id);
        try {
            await api.post(`/admin/requests/${id}/reject`);
            fetchRequests();
        } catch (err) {
            alert('Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.shopName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registration Requests</h1>
                    <p className="text-gray-500 text-sm">Review and approve new user interests</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <Search className="h-5 w-5 text-gray-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search requests by name, email, or shop..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shop Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading && requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                                            <span>Loading requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No registration requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{req.username}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {req.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                    <Store className="h-3.5 w-3.5 text-gray-400" /> {req.shopName}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Smartphone className="h-3.5 w-3.5 text-gray-400" /> {req.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <Clock className="h-3 w-3" /> Pending
                                                </span>
                                            )}
                                            {req.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <CheckCircle className="h-3 w-3" /> Approved
                                                </span>
                                            )}
                                            {req.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                                    <XCircle className="h-3 w-3" /> Rejected
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={processingId === req.id}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={processingId === req.id}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
