import Link from 'next/link';
import { MessageSquare, ArrowRight, ShieldCheck, Zap, Users, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">WhatsHub</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2">
              Login
            </Link>
            <Link href="/register" className="text-sm font-bold bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-md">
              Register Interest
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Empower your retail business with <span className="text-emerald-600">WhatsApp.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The all-in-one platform for small retail shop owners to manage customer conversations, send broadcasts, and automate replies effortlessly.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register" className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-emerald-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
            Register Interest <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#features" className="px-8 py-4 bg-slate-100 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-200 transition-all">
            View Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Built for Retail Excellence</h2>
            <p className="text-slate-500 mt-2">Everything you need to grow your customer relationships.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={MessageSquare}
              title="Shared Inbox"
              desc="A real-time team inbox to manage all your customer WhatsApp chats in one place."
            />
            <FeatureCard
              icon={Zap}
              title="Automations"
              desc="Set up welcome messages, away replies, and keyword-based triggers to save time."
            />
            <FeatureCard
              icon={Users}
              title="Contact Management"
              desc="Organize your customers with tags and segments for targeted communication."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Official Meta API"
              desc="Completely compliant with WhatsApp Cloud API to prevent number blocking."
            />
            <FeatureCard
              icon={BarChart3}
              title="Campaign Reports"
              desc="Track delivery, read, and response rates for your marketing broadcasts."
            />
            <FeatureCard
              icon={Zap}
              title="Fast Setup"
              desc="Get up and running in minutes, not days. Simplicity is our core focus."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-slate-400 text-sm">
        <p>© 2026 WhatsHub Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
