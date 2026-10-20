import React, { useState } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
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
    tickets,
    macBypasses,
    forceHeartbeatSync,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  const categories: SidebarCategory[] = [
    {
      title: 'CENTRE DE PILOTAGE',
      items: [
        { id: 'dashboard', label: 'Vue Bento & Topologie', icon: LayoutDashboard },
        { id: 'assistant', label: 'Copilote Réseau IA', icon: Bot, badge: 'AI' },
      ],
    },
    {
      title: 'MONÉTISATION & POS',
      items: [
        { id: 'tickets', label: 'Vouchers & Stock', icon: Ticket, badge: `${tickets.length}` },
        { id: 'forfaits', label: 'Catalogue Forfaits', icon: Wifi },
        { id: 'pos-direct', label: 'Terminal Caisse POS', icon: Smartphone, badge: 'PWA' },
        {
          id: 'staff',
          label: 'Agents & Vendeurs',
          icon: Users,
          badge: pendingSosAlerts.length > 0 ? `${pendingSosAlerts.length} SOS` : undefined,
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE SDN',
      items: [
        { id: 'zones', label: 'Sites & Zones WiFi', icon: MapPin },
        { id: 'mikrotik', label: 'Contrôleurs MikroTik', icon: RouterIcon },
        { id: 'installation', label: 'Déploiement (Engine v5)', icon: Terminal, badge: 'v5.1' },
        {
          id: 'sessions',
          label: 'Sessions Actives',
          icon: Radio,
          badge: `${sessions.length}`,
        },
        {
          id: 'mac-bypass',
          label: 'Bindings & MAC VIP',
          icon: Laptop,
          badge: macBypasses.length > 0 ? `${macBypasses.length}` : undefined,
        },
        { id: 'sante', label: 'Télémétrie & SLA', icon: Activity },
        { id: 'connexions', label: 'Journal RADIUS / Auth', icon: History },
      ],
    },
    {
      title: 'TRÉSORERIE & MOBILE MONEY',
      items: [
        { id: 'comptabilite', label: 'Analytique & ROI FAI', icon: Calculator },
        { id: 'portefeuille', label: 'Wallet Mobile Money', icon: Wallet },
        { id: 'ventes', label: 'Journal Ventes POS', icon: TrendingUp },
        { id: 'gains', label: 'Reversements & Gains', icon: DollarSign },
        { id: 'abonnements', label: 'Licence Cloud', icon: CreditCard },
      ],
    },
    {
      title: 'STUDIO & SYSTÈME',
      items: [
        { id: 'personnalisation', label: 'Studio Portail Captif', icon: Palette, badge: 'Live' },
        { id: 'marketplace', label: 'Galerie Portails', icon: ShoppingBag },
        { id: 'marketplace-mes-templates', label: 'Mes Thèmes Captifs', icon: Boxes },
        { id: 'notifications', label: 'Webhooks Telegram', icon: Bell },
        { id: 'logs', label: 'Audit Sécurité', icon: FileText },
        { id: 'profil', label: 'Opérateur & Devises', icon: User },
      ],
    },
  ];

  const handleClick = (id: AdminTab | 'pos-direct') => {
    if (id === 'pos-direct') {
      setCurrentSpace('pos');
      return;
    }
    setAdminTab(id);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-68'
      } shrink-0 h-full glass-panel border-r border-white/10 flex flex-col justify-between select-none overflow-y-auto transition-all duration-200`}
    >
      {/* Top Brand Header — Signature Joowifi Fabric OS */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
        <div
          onClick={() => setCurrentSpace('public')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0 group-hover:rotate-6 transition-transform">
            <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  JOO<span className="text-emerald-400">WIFI</span>
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  OS 6.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                SDN MikroTik & Cloud ISP
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 cursor-pointer shrink-0"
          title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Categories */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                {cat.title}
              </div>
            )}
            <div className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-xs font-medium transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent text-emerald-300 font-bold border border-emerald-500/35 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400" />
                    )}
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                              item.badge.includes('SOS')
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                : isActive
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800/90 text-slate-300 border border-white/10'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.id === 'pos-direct' && (
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Fabric Telemetry Card */}
      <div className="p-3 border-t border-white/10 bg-slate-950/50 space-y-2">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-cyan-950/40 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine v5.1 Actif</span>
              </div>
              <button
                onClick={forceHeartbeatSync}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              >
                Sync 10s
              </button>
            </div>

            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700"
                style={{ width: `${((45 - heartbeatSecondsRemaining) / 45) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Supabase 12/12</span>
              <span className="text-emerald-400 font-bold">Fast-Poll OK</span>
            </div>
          </div>
        ) : (
          <button
            onClick={forceHeartbeatSync}
            title="Forcer la synchronisation Supabase & MikroTik"
            className="w-full py-2 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
