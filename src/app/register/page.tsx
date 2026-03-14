"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MessageSquare, Mail, Lock, User, Store, Smartphone, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        shopName: '',
        phone: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register-interest', formData);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans">
            {/* Background Animated Blobs */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

            <div className="relative w-full max-w-2xl">
                {/* Logo & Header */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/20 rotate-3">
                        <MessageSquare className="h-8 w-8 text-white -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Register Your Interest
                    </h1>
                    <p className="mt-3 text-slate-400 font-medium">
                        Join the waitlist for WhatsHub commerce
                    </p>
                </div>

                {/* Register Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {submitted ? (
                        <div className="text-center py-8 space-y-6 animate-in zoom-in duration-500">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                                <ArrowRight className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Interest Submitted!</h2>
                            <p className="text-slate-400">
                                Thank you for your interest in WhatsHub. Our admin team will review your request and get back to you shortly.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-emerald-500 font-bold hover:text-emerald-400 transition-colors pt-4"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleRegister}>
                            {error && (
                                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 animate-in shake duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shop Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Shop Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 text-slate-500 transition-colors">
                                            <Store className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Awesome Boutique"
                                            className="block w-full rounded-2xl bg-slate-900/50 border border-white/10 px-11 py-3.5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 text-slate-500 transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="your_unique_username"
                                            className="block w-full rounded-2xl bg-slate-900/50 border border-white/10 px-11 py-3.5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Phone</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 text-slate-500 transition-colors">
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="919876543210"
                                            className="block w-full rounded-2xl bg-slate-900/50 border border-white/10 px-11 py-3.5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 text-slate-500 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@example.com"
                                            className="block w-full rounded-2xl bg-slate-900/50 border border-white/10 px-11 py-3.5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-emerald-500 text-slate-500 transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="block w-full rounded-2xl bg-slate-900/50 border border-white/10 px-11 py-3.5 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition-all active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Submit Interest
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {!submitted && (
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Security Footer */}
                <p className="mt-10 text-center text-xs text-slate-600 font-medium">
                    &copy; 2024 WhatsHub Messaging. Secure & Encrypted Connection.
                </p>
            </div>
        </div>
    );
}
