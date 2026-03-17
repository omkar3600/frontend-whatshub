"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, Upload, Users, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        phone: '',
        city: '',
        tags: '',
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/contacts');
            setContacts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newContact,
                tags: newContact.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            };
            await api.post('/contacts', payload);
            setIsModalOpen(false);
            setNewContact({ name: '', phone: '', city: '', tags: '' });
            fetchContacts();
        } catch (err) {
            console.error(err);
            alert('Failed to add contact');
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const deleteContact = async (id: string) => {
        if (!confirm('Delete this contact?')) return;
        try {
            await api.delete(`/contacts/${id}`);
            fetchContacts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartChat = async (contactId: string) => {
        try {
            const { data } = await api.post(`/conversations/contact/${contactId}`);
            // Redirect to inbox and pass conversation ID to auto-select it
            router.push(`/inbox?convoId=${data.id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to start conversation');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contacts List</h1>
                    <p className="text-sm text-slate-500">Manage your WhatsApp audience and their tags.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700 transition-colors hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-white text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">Tags</th>
                            <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider">City</th>
                            <th className="px-6 py-4 text-right font-medium text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{contact.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{contact.phone}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags?.map((tag: string, i: number) => (
                                            <span key={i} className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                {tag}
                                            </span>
                                        )) || <span className="text-slate-400 text-xs italic">No tags</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{contact.city || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleStartChat(contact.id)}
                                            className="text-slate-400 hover:text-emerald-600 transition-colors p-1 hover:bg-emerald-50 rounded"
                                            title="Message"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </button>
                                        <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => deleteContact(contact.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-50 rounded">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {filteredContacts.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <p>No contacts found.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Contact</h2>
                        <form onSubmit={handleCreateContact} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (with code)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 919876543210"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newContact.city}
                                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. VIP, New, Wholesale"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={newContact.tags}
                                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
