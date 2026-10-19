import React from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bot,
  Ticket,
  Boxes,
  Smartphone,
  Users,
  MapPin,
  Router as RouterIcon,
  Activity,
  Radio,
  History,
  ShieldCheck,
  Laptop,
  Terminal,
  Calculator,
  Wallet,
  TrendingUp,
  DollarSign,
  CreditCard,
  Palette,
  ShoppingBag,
  Bell,
  FileText,
  User,
  Wifi,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';

interface SidebarCategory {
  title: string;
  items: {
    id: AdminTab | 'pos-direct';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    setCurrentSpace,
    heartbeatSecondsRemaining,
    pendingSosAlerts,
    sessions,
    macBypasses,
  } = useApp();

  const categories: SidebarCategory[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'assistant', label: 'Assistant IA', icon: Bot, badge: 'IA' },
      ],
    },
    {
      title: 'VENTE',
      items: [
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'forfaits', label: 'Forfaits', icon: Wifi },
        { id: 'pos-direct', label: 'POS Caisse', icon: Smartphone, badge: 'PWA' },
        {
          id: 'staff',
          label: 'Vendeurs',
          icon: Users,
          badge: pendingSosAlerts.length > 0 ? `${pendingSosAlerts.length} SOS` : undefined,
        },
      ],
    },
    {
      title: 'RÉSEAU',
      items: [
        { id: 'zones', label: 'Mes zones', icon: MapPin },
        { id: 'mikrotik', label: 'Routeurs MikroTik', icon: RouterIcon },
        { id: 'sante', label: 'Santé du réseau', icon: Activity },
        {
          id: 'sessions',
          label: 'Clients connectés',
          icon: Radio,
          badge: `${sessions.length}`,
        },
        { id: 'connexions', label: 'Historique connexions', icon: History },
        {
          id: 'mac-bypass',
          label: 'Adresses MAC',
          icon: Laptop,
          badge: macBypasses.length > 0 ? `${macBypasses.length}` : undefined,
        },
        { id: 'installation', label: 'Installation (Script)', icon: Terminal, badge: 'Token' },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'comptabilite', label: 'Comptabilité', icon: Calculator },
        { id: 'portefeuille', label: 'Portefeuille Pay', icon: Wallet },
        { id: 'ventes', label: 'Ventes vendeurs', icon: TrendingUp },
        { id: 'gains', label: 'Mes gains (Retrait)', icon: DollarSign },
        { id: 'abonnements', label: 'Mon abonnement', icon: CreditCard },
      ],
    },
    {
      title: 'RÉGLAGES',
      items: [
        { id: 'personnalisation', label: 'Portail captif', icon: Palette, badge: 'Live' },
        { id: 'marketplace', label: 'Templates Marketplace', icon: ShoppingBag },
        { id: 'marketplace-mes-templates', label: 'Mes Templates', icon: Boxes },
        { id: 'notifications', label: 'Alertes Telegram', icon: Bell },
        { id: 'logs', label: 'Journal d’activité', icon: FileText },
        { id: 'profil', label: 'Mon profil & Devise', icon: User },
      ],
    },
  ];

  const handleSelect = (id: AdminTab | 'pos-direct') => {
    if (id === 'pos-direct') {
      setCurrentSpace('pos');
    } else {
      setAdminTab(id);
    }
  };

  return (
    <aside className="w-64 h-full glass-panel border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto">
      {/* Brand header in sidebar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => setCurrentSpace('public')}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
            <Wifi className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-none">
              Joo<span className="text-amber-500">wifi</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Console Cloud</span>
          </div>
        </button>

        <button
          onClick={() => setCurrentSpace('public')}
          title="Aller sur le site public"
          className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Heartbeat & Supabase Sync Status pill in sidebar */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-300">Pull Heartbeat</span>
          </div>
          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
            {heartbeatSecondsRemaining}s
          </span>
        </div>
        <button
          onClick={forceHeartbeatSync}
          className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <span>🔄 Synchroniser Base Supabase (12 tables)</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-6">
        {categories.map((cat) => (
          <div key={cat.title}>
            <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {cat.title}
            </div>

            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id !== 'pos-direct' && adminTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer group ${
                      isActive
                        ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 font-semibold shadow-sm shadow-amber-500/10'
                        : 'border border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          item.badge.includes('SOS')
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Support footer in sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-xs">
        <a
          href="https://wa.me/2250100443839"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
        >
          <LifeBuoy className="w-4 h-4 shrink-0" />
          <div className="truncate">
            <span className="font-semibold block text-[11px]">Support Abidjan</span>
            <span className="text-[10px] text-slate-400">+225 01 00 44 38 39</span>
          </div>
        </a>
      </div>
    </aside>
  );
};
