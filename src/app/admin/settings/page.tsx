"use client";

import { useAuth } from '@/components/providers';
import { Settings, Shield, User as UserIcon, Lock, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile({
                username: res.data.username,
                email: res.data.email || '',
            });
        } catch (err) {
            console.error('Failed to fetch admin profile:', err);
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl space-y-8">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your account and system-wide options.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 flex-grow">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Shield className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Security</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 flex-grow">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

            {/* System Config Placeholder */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm opacity-60">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                        <Settings className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">System Configuration</h2>
                </div>

                <p className="text-sm text-gray-500 italic">
                    Advanced system settings and WhatsApp API configuration will appear here in future updates.
                </p>
            </div>
        </div>
    );
}
