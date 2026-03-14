"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, PowerOff, ShieldCheck } from 'lucide-react';

export default function AdminShopsPage() {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<any>(null);
    const [newExpiryDate, setNewExpiryDate] = useState('');
    const [newShopData, setNewShopData] = useState({
        username: '',
        email: '',
        password: '',
        shopName: '',
        phone: '',
        ownerName: '',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const { data } = await api.get('/admin/shops');
            setShops(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/shops', newShopData);
            setIsCreateModalOpen(false);
            setNewShopData({
                username: '',
                email: '',
                password: '',
                shopName: '',
                phone: '',
                ownerName: '',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            fetchShops();
        } catch (err) {
            console.error(err);
            alert('Failed to create shop');
        }
    };

    const handleEditClick = (shop: any) => {
        setEditingShop(shop);
        setNewShopData({
            username: shop.owner?.username || '',
            email: shop.owner?.email || '',
            password: '', // Password cannot be shown
            shopName: shop.shopName || '',
            phone: shop.phone || '',
            ownerName: shop.owner?.name || '', // Assuming name exists or just handle what we have
            expiryDate: new Date(shop.subscription?.expiryDate || new Date()).toISOString().split('T')[0],
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/admin/shops/${editingShop.id}`, newShopData);
            // Also update subscription if expiry changed
            await api.put(`/admin/shops/${editingShop.id}/subscription`, {
                expiryDate: new Date(newShopData.expiryDate).toISOString(),
            });
            setIsEditModalOpen(false);
            fetchShops();
        } catch (err) {
            console.error(err);
            alert('Failed to update user');
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Are you sure you want to change shop status?')) return;
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await api.put(`/admin/shops/${id}/status`, { status: newStatus });
        fetchShops();
    };

    const deleteShop = async (id: string) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('EXTREME DANGER: Delete shop and all its data?')) return;
        await api.delete(`/admin/shops/${id}`);
        fetchShops();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading shops...</div>;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
                    <p className="text-sm text-gray-500">Manage all businesses onboarded to the platform.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Register New User
                </button>
            </div>


            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">User Details</th>
                            <th className="px-6 py-4 font-medium">Username</th>
                            <th className="px-6 py-4 font-medium">Subscription</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {shops.map((shop) => (
                            <tr key={shop.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {shop.shopName}
                                    <div className="text-xs font-normal text-gray-500">{shop.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-bold">{shop.owner?.username || shop.owner?.email}</td>
                                <td className="px-6 py-4">
                                    {shop.subscription?.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            <ShieldCheck className="h-3 w-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                            {shop.subscription ? 'Expired' : 'None'}
                                        </span>
                                    )}
                                    <div className="mt-1 text-xs text-gray-500 font-semibold">
                                        Expiry: {shop.subscription?.expiryDate ? new Date(shop.subscription.expiryDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {shop.status === 'active' ? (
                                        <span className="text-emerald-600 font-bold text-xs">ACTIVE</span>
                                    ) : (
                                        <span className="text-gray-400 font-medium text-xs">DISABLED</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => toggleStatus(shop.id, shop.status)}
                                            title="Toggle Status"
                                            className="text-gray-400 hover:text-emerald-600 transition-colors"
                                        >
                                            <PowerOff className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(shop)}
                                            className="text-gray-400 hover:text-emerald-600 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteShop(shop.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {shops.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No users registered yet.</div>
                )}
            </div>

            {/* Create Shop Modal */}
            {
                isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl my-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Register New User</h2>
                            <form onSubmit={handleCreateShop} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.username}
                                        onChange={(e) => setNewShopData({ ...newShopData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.shopName}
                                        onChange={(e) => setNewShopData({ ...newShopData, shopName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.ownerName}
                                        onChange={(e) => setNewShopData({ ...newShopData, ownerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 919876543210"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.phone}
                                        onChange={(e) => setNewShopData({ ...newShopData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.email}
                                        onChange={(e) => setNewShopData({ ...newShopData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.password}
                                        onChange={(e) => setNewShopData({ ...newShopData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.expiryDate}
                                        onChange={(e) => setNewShopData({ ...newShopData, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl my-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User: {editingShop?.owner?.username}</h2>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.username}
                                        onChange={(e) => setNewShopData({ ...newShopData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.email}
                                        onChange={(e) => setNewShopData({ ...newShopData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                                    <input
                                        type="text"
                                        placeholder="Securely Hashed"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.password}
                                        onChange={(e) => setNewShopData({ ...newShopData, password: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Note: Existing passwords are encrypted and cannot be displayed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.shopName}
                                        onChange={(e) => setNewShopData({ ...newShopData, shopName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.phone}
                                        onChange={(e) => setNewShopData({ ...newShopData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={newShopData.expiryDate}
                                        onChange={(e) => setNewShopData({ ...newShopData, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

