"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Settings, Shield, MessageSquare, Save, ExternalLink, Smartphone, Info, User as UserIcon, Lock, Loader2 } from 'lucide-react';

export default function RetailerSettingsPage() {
    const [shop, setShop] = useState<any>(null);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [creds, setCreds] = useState({
        businessAccountId: '',
        phoneNumberId: '',
        accessToken: '',
        webhookVerifyToken: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found in localStorage');
                return;
            }

            const [shopRes, credsRes, profileRes] = await Promise.all([
                api.get('/shops/me').catch(e => ({ data: { shop: null } })),
                api.get('/shops/credentials').catch(e => ({ data: null })),
                api.get('/users/me').catch(e => ({ data: null }))
            ]);

            if (shopRes.data?.shop) {
                setShop(shopRes.data.shop);
            }

            if (credsRes.data) {
                setCreds(credsRes.data);
            }

            if (profileRes.data) {
                setProfile({
                    username: profileRes.data.username,
                    email: profileRes.data.email || '',
                });
            }
        } catch (err: any) {
            console.error('Settings fetchData unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await api.put('/users/me', profile);
            alert('Profile updated successfully!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        setIsChangingPass(true);
        try {
            await api.put('/users/me/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPass(false);
        }
    };

    const handleSaveCreds = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/shops/credentials', creds);
            alert('WhatsApp credentials saved successfully!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save credentials');
        } finally {
            setIsSaving(false);
        }
    };

    const testConnection = async () => {
        setTestStatus('loading');
        try {
            await api.get('/shops/me');
            setTestStatus('success');
            setTimeout(() => setTestStatus('idle'), 3000);
        } catch (err: any) {
            setTestStatus('error');
            setTimeout(() => setTestStatus('idle'), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2 duration-400">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Business Settings</h1>
                    <p className="text-sm text-slate-500">Configure your business profile and WhatsApp integration.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Profile Section */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Account Profile</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 flex-grow">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingProfile ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                            <Shield className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Security</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 flex-grow">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isChangingPass}
                                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Lock className="h-4 w-4" />
                                {isChangingPass ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Existing WhatsApp and Shop Profile Sections */}
            <div className="grid grid-cols-1 gap-8">
                {/* WhatsApp Integration Section */}
                <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">WhatsApp API Integration</h2>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="text-sm text-blue-800 leading-relaxed">
                            To integrate, you need a Meta Developer account.
                            <a href="https://developers.facebook.com" target="_blank" className="font-bold underline ml-1 inline-flex items-center gap-1">
                                Open Dashboard <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="mt-1">Navigate to WhatsApp &gt; Configuration to get your Business Account ID and Phone Number ID.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveCreds} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Business Account ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={creds.businessAccountId}
                                    onChange={(e) => setCreds({ ...creds, businessAccountId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={creds.phoneNumberId}
                                    onChange={(e) => setCreds({ ...creds, phoneNumberId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Permanent Access Token</label>
                            <input
                                type="password"
                                required
                                placeholder="EAAG..."
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                value={creds.accessToken}
                                onChange={(e) => setCreds({ ...creds, accessToken: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={testConnection}
                                disabled={testStatus === 'loading'}
                                className={`text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                    testStatus === 'error' ? 'bg-rose-50 text-rose-600' :
                                        'text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {testStatus === 'loading' ? 'Testing...' :
                                    testStatus === 'success' ? 'Connection OK' :
                                        'Test Connection'}
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-black transition-all"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Integration'}
                            </button>
                        </div>
                    </form>

                    {/* Webhook Configuration Section */}
                    <div className="mt-10 pt-10 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            Webhook Configuration (Self-Service)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Callback URL (Copy to Meta)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 font-mono"
                                        value={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/webhooks/whatsapp?shopId=${shop?.id}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/webhooks/whatsapp?shopId=${shop?.id}`);
                                            alert('URL copied!');
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 group"
                                    >
                                        <ExternalLink className="h-4 w-4 group-hover:text-blue-500" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verify Token (Match in Meta)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter your verify token..."
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={creds.webhookVerifyToken || ''}
                                        onChange={(e) => setCreds({ ...creds, webhookVerifyToken: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveCreds}
                                        className="px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200"
                                    >
                                        Set Token
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Profile */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Business Name</label>
                            <input
                                type="text"
                                defaultValue={shop?.shopName}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm bg-slate-50 text-slate-500"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Phone</label>
                            <input
                                type="text"
                                defaultValue={shop?.phone}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm bg-slate-50 text-slate-500"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
