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
      title: 'SUPERVISION SDN',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'assistant', label: 'Assistant Réseau IA', icon: Bot, badge: 'IA' },
      ],
    },
    {
      title: 'VOUCHERS & POS',
      items: [
        { id: 'tickets', label: 'Gestion des Tickets', icon: Ticket, badge: `${tickets.length}` },
        { id: 'forfaits', label: 'Profils & Forfaits', icon: Wifi },
        { id: 'pos-direct', label: 'Terminal Caisse POS', icon: Smartphone, badge: 'PWA' },
        {
          id: 'staff',
          label: 'Agents Vendeurs',
          icon: Users,
          badge: pendingSosAlerts.length > 0 ? `${pendingSosAlerts.length} SOS` : undefined,
        },
      ],
    },
    {
      title: 'ÉQUIPEMENTS & SITES',
      items: [
        { id: 'zones', label: 'Sites & Zones', icon: MapPin },
        { id: 'mikrotik', label: 'Passerelles MikroTik', icon: RouterIcon },
        { id: 'installation', label: 'Script RouterOS (.rsc)', icon: Terminal, badge: 'v5.1' },
        {
          id: 'sessions',
          label: 'Clients Connectés',
          icon: Radio,
          badge: `${sessions.length}`,
        },
        {
          id: 'mac-bypass',
          label: 'Adresses MAC & IoT',
          icon: Laptop,
          badge: macBypasses.length > 0 ? `${macBypasses.length}` : undefined,
        },
        { id: 'sante', label: 'État du Réseau', icon: Activity },
        { id: 'connexions', label: 'Journal Connexions', icon: History },
      ],
    },
    {
      title: 'FINANCES & COMPTES',
      items: [
        { id: 'comptabilite', label: 'Comptabilité & ROI', icon: Calculator },
        { id: 'portefeuille', label: 'Portefeuille Mobile', icon: Wallet },
        { id: 'ventes', label: 'Recettes Vendeurs', icon: TrendingUp },
        { id: 'gains', label: 'Reversements', icon: DollarSign },
        { id: 'abonnements', label: 'Licence Cloud', icon: CreditCard },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'personnalisation', label: 'Portail Captif', icon: Palette },
        { id: 'marketplace', label: 'Modèles Portails', icon: ShoppingBag },
        { id: 'marketplace-mes-templates', label: 'Mes Modèles', icon: Boxes },
        { id: 'notifications', label: 'Alertes Telegram', icon: Bell },
        { id: 'logs', label: 'Journal d’Audit', icon: FileText },
        { id: 'profil', label: 'Profil Opérateur', icon: User },
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
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none overflow-y-auto transition-all duration-150`}
    >
      {/* Top Collapse Bar */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
        {!collapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Contrôleur
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
          title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Categories */}
      <div className="flex-1 px-2.5 py-3 space-y-5 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                    } rounded text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-[#007A78] text-white font-semibold keep-white'
                        : 'text-slate-600 hover:text-[#005A5B] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-500'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                              item.badge.includes('SOS')
                                ? 'bg-rose-600 text-white keep-white'
                                : isActive
                                ? 'bg-[#005A5B] text-white keep-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.id === 'pos-direct' && (
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controller Status Box */}
      <div className="p-3 border-t border-slate-200 bg-[#F8FAFC]">
        {!collapsed ? (
          <div className="p-3 rounded bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#005A5B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#007A78]" />
                <span>Cloud Pull Actif</span>
              </div>
              <button
                onClick={forceHeartbeatSync}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E6F4F3] hover:bg-[#d0ebe9] text-[#005A5B] transition cursor-pointer"
              >
                Sync 10s
              </button>
            </div>

            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007A78] transition-all duration-500"
                style={{ width: `${((45 - heartbeatSecondsRemaining) / 45) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Supabase 12/12</span>
              <span className="text-[#007A78] font-bold">Connecté</span>
            </div>
          </div>
        ) : (
          <button
            onClick={forceHeartbeatSync}
            title="Synchroniser maintenant"
            className="w-full py-2 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
