import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Palette,
  Smartphone,
  Monitor,
  Upload,
  CheckCircle2,
  Wifi,
  Save,
  Eye,
  Key,
  BookmarkPlus,
  Plus,
  Trash2,
} from 'lucide-react';
import { CaptivePortalConfig } from '../../types';

export const CaptivePortalEditor: React.FC = () => {
  const {
    captiveConfig,
    updateCaptiveConfig,
    savePortalTemplate,
    routers,
    zones,
    formatMoney,
    forfaits,
    simulateDirectMomoPurchase,
    notify,
  } = useApp();

  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [activePortalTab, setActivePortalTab] = useState<'voucher' | 'momo' | 'freetrial'>('voucher');
  const [testVoucherCode, setTestVoucherCode] = useState('JW-4829-104');
  const [testPhone, setTestPhone] = useState('+225 07 08 11 22 33');
  const [selectedTestForfaitId, setSelectedTestForfaitId] = useState(forfaits[0]?.id || 'f-1');
  const [portalFeedback, setPortalFeedback] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [showSaveTemplateInput, setShowSaveTemplateInput] = useState(false);

  const [form, setForm] = useState<CaptivePortalConfig>(captiveConfig);

  const presets = [
    {
      id: 'abidjan-vibrant',
      name: 'Abidjan Vibrant (Ambre)',
      primary: '#F59E0B',
      bg: '#0B0F19',
      surface: 'rgba(15, 23, 42, 0.85)',
      text: '#FFFFFF',
    },
    {
      id: 'sunset-glass',
      name: 'Sunset Glassmorphism',
      primary: '#EA580C',
      bg: '#18181B',
      surface: 'rgba(39, 39, 42, 0.75)',
      text: '#FFFFFF',
    },
    {
      id: 'minimal-speed',
      name: 'Minimal Speed (Émeraude)',
      primary: '#10B981',
      bg: '#020617',
      surface: '#0F172A',
      text: '#F8FAFC',
    },
    {
      id: 'neon-cyber',
      name: 'Neon Cyan Tech',
      primary: '#06B6D4',
      bg: '#050814',
      surface: '#0F172A',
      text: '#ECFEFF',
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setForm((prev) => ({
      ...prev,
      templateId: preset.id as CaptivePortalConfig['templateId'],
      primaryColor: preset.primary,
      backgroundColor: preset.bg,
      surfaceColor: preset.surface,
      textColor: preset.text,
    }));
  };

  const handleSave = () => {
    updateCaptiveConfig(form);
  };

  const handleSaveAsNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTemplateName.trim()) return;
    savePortalTemplate(
      saveTemplateName.trim(),
      `Déclinaison personnalisée (${form.brandName})`,
      'Personnalisé',
      form
    );
    setSaveTemplateName('');
    setShowSaveTemplateInput(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        notify('Le fichier logo ne doit pas dépasser 500 Ko.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
        notify('Logo personnalisé chargé dans le Sandbox.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWalledGarden = () => {
    if (!newDomain.trim()) return;
    setForm((prev) => ({
      ...prev,
      walledGardenDomains: [...(prev.walledGardenDomains || []), newDomain.trim()],
    }));
    setNewDomain('');
  };

  const handleRemoveWalledGarden = (domain: string) => {
    setForm((prev) => ({
      ...prev,
      walledGardenDomains: prev.walledGardenDomains.filter((d) => d !== domain),
    }));
  };

  const triggerSandboxMessage = (msg: string) => {
    setPortalFeedback(msg);
    setTimeout(() => setPortalFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <span>Éditeur de Portail Captif (Live Sandbox)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personnalisez les couleurs Hexadécimales, le logo, le Walled Garden et testez le parcours client en direct.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSaveTemplateInput(!showSaveTemplateInput)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-amber-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" />
            <span>Enregistrer dans Mes Templates</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Publier sur les routeurs</span>
          </button>
        </div>
      </div>

      {showSaveTemplateInput && (
        <form
          onSubmit={handleSaveAsNewTemplate}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
        >
          <input
            type="text"
            required
            placeholder="Nom de la déclinaison (ex: Portail Hôtel Ivoire, Campus Nord...)"
            value={saveTemplateName}
            onChange={(e) => setSaveTemplateName(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold cursor-pointer"
          >
            Sauvegarder ce design
          </button>
        </form>
      )}

      {/* Editor Main Grid: Left Controls (5 cols) / Right Sandbox Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CONFIGURATION CONTROLS */}
        <div className="lg:col-span-5 space-y-5 text-xs">
          {/* Scope Selector */}
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
            <label className="text-slate-300 font-bold block">Périmètre d'application :</label>
            <div className="grid grid-cols-3 gap-2">
              {(['global', 'zone', 'router'] as const).map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setForm({ ...form, scope: sc })}
                  className={`py-2 px-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                    form.scope === sc
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {sc === 'global' ? 'Global' : sc === 'zone' ? 'Par Zone' : 'Par Routeur'}
                </button>
              ))}
            </div>

            {form.scope === 'zone' && (
              <select
                value={form.targetZoneId || zones[0]?.id}
                onChange={(e) => setForm({ ...form, targetZoneId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs mt-2"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    Zone : {z.name} ({z.city})
                  </option>
                ))}
              </select>
            )}

            {form.scope === 'router' && (
              <select
                value={form.targetRouterId || routers[0]?.id}
                onChange={(e) => setForm({ ...form, targetRouterId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs mt-2"
              >
                {routers.map((r) => (
                  <option key={r.id} value={r.id}>
                    Routeur : {r.name} ({r.zoneName})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Theme Presets */}
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
            <label className="text-slate-300 font-bold block">Thèmes prédéfinis :</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    form.templateId === preset.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <strong className="text-xs truncate">{preset.name}</strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Brand & Texts */}
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-white/10 pb-2">
              Identité & Textes d'Accueil
            </h3>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nom du Hotspot affiché :</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Slogan accrocheur :</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Message de bienvenue :</label>
              <textarea
                rows={2}
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Numéro de support affiché :</label>
              <input
                type="tel"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            {/* Logo Upload */}
            <div className="pt-2">
              <label className="text-slate-400 font-medium block mb-1">
                Logo personnalisé (PNG/JPG/SVG, max 500 Ko) :
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-amber-500/40 cursor-pointer text-slate-300">
                <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  {form.logoUrl
                    ? 'Logo personnalisé actif (cliquer pour remplacer)'
                    : 'Importer une image de logo...'}
                </span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Color Palettes Custom Hex */}
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-white/10 pb-2">
              Couleurs Hexadécimales Personnalisées
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-sans">Couleur Primaire CTA :</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[11px] text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-sans">Fond du Portail :</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.backgroundColor}
                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.backgroundColor}
                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[11px] text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Module Toggles & Walled Garden */}
          <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-white/10 pb-2">
              Modules & Domaines Walled Garden
            </h3>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer">
              <span className="text-slate-300">Saisie de Ticket / Voucher</span>
              <input
                type="checkbox"
                checked={form.enableVoucherInput}
                onChange={(e) => setForm({ ...form, enableVoucherInput: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer">
              <span className="text-slate-300">Achat direct Mobile Money</span>
              <input
                type="checkbox"
                checked={form.enableMobileMoney}
                onChange={(e) => setForm({ ...form, enableMobileMoney: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer">
              <span className="text-slate-300">
                Essai Gratuit ({form.freeTrialDurationMinutes} min)
              </span>
              <input
                type="checkbox"
                checked={form.enableFreeTrial}
                onChange={(e) => setForm({ ...form, enableFreeTrial: e.target.checked })}
                className="accent-amber-500 rounded"
              />
            </label>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] text-slate-400 block">
                Domaines autorisés avant connexion (Walled Garden) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(form.walledGardenDomains || []).map((dom) => (
                  <span
                    key={dom}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 font-mono text-[10px] text-emerald-300"
                  >
                    {dom}
                    <button
                      type="button"
                      onClick={() => handleRemoveWalledGarden(dom)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ex: *.wave.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleAddWalledGarden}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LIVE SANDBOX PREVIEW */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Aperçu Interactif Sandbox (Testez les boutons ci-dessous)</span>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewMode === 'mobile'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Smartphone</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  previewMode === 'desktop'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Ordinateur</span>
              </button>
            </div>
          </div>

          {/* Sandbox Frame */}
          <div className="flex justify-center bg-[#070A12] p-6 rounded-3xl border border-white/10 min-h-[620px] items-center">
            <div
              className={`transition-all duration-300 shadow-2xl overflow-hidden border ${
                previewMode === 'mobile'
                  ? 'w-[360px] h-[650px] rounded-[40px] border-slate-700'
                  : 'w-full max-w-[620px] rounded-2xl border-slate-700'
              }`}
              style={{
                backgroundColor: form.backgroundColor,
                color: form.textColor,
              }}
            >
              {previewMode === 'mobile' && (
                <div className="h-5 w-full flex justify-center items-center pt-2">
                  <div className="w-24 h-3.5 bg-black rounded-full" />
                </div>
              )}

              <div className="p-6 flex flex-col justify-between h-full space-y-4 overflow-y-auto">
                {/* Header branding */}
                <div className="text-center space-y-2 pt-2">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-16 h-16 object-contain mx-auto rounded-xl shadow-md"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-lg"
                      style={{ backgroundColor: form.primaryColor }}
                    >
                      <Wifi className="w-7 h-7 stroke-[2.5]" />
                    </div>
                  )}

                  <h3 className="text-xl font-black tracking-tight">{form.brandName}</h3>
                  <p className="text-xs opacity-80">{form.tagline}</p>
                </div>

                <div
                  className="p-3 rounded-xl text-center text-xs opacity-90 border"
                  style={{
                    backgroundColor: form.surfaceColor,
                    borderColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  {form.welcomeMessage}
                </div>

                {/* In-portal feedback banner (replaces alert) */}
                {portalFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{portalFeedback}</span>
                  </div>
                )}

                {/* Tabs inside portal */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-1 bg-black/30 p-1 rounded-xl text-[10px] font-bold">
                    {form.enableVoucherInput && (
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('voucher')}
                        className={`py-1.5 rounded-lg transition cursor-pointer ${
                          activePortalTab === 'voucher' ? 'bg-white/20 font-extrabold' : 'opacity-60'
                        }`}
                      >
                        Code Ticket
                      </button>
                    )}
                    {form.enableMobileMoney && (
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('momo')}
                        className={`py-1.5 rounded-lg transition cursor-pointer ${
                          activePortalTab === 'momo' ? 'bg-white/20 font-extrabold' : 'opacity-60'
                        }`}
                      >
                        Mobile Money
                      </button>
                    )}
                    {form.enableFreeTrial && (
                      <button
                        type="button"
                        onClick={() => setActivePortalTab('freetrial')}
                        className={`py-1.5 rounded-lg transition cursor-pointer ${
                          activePortalTab === 'freetrial'
                            ? 'bg-white/20 font-extrabold'
                            : 'opacity-60'
                        }`}
                      >
                        Essai Gratuit
                      </button>
                    )}
                  </div>

                  {/* Tab View 1: Ticket Voucher */}
                  {activePortalTab === 'voucher' && (
                    <div className="space-y-2.5">
                      <div className="relative">
                        <Key className="w-4 h-4 opacity-50 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Entrez votre code ticket (Ex: JW-8492-710)"
                          value={testVoucherCode}
                          onChange={(e) => setTestVoucherCode(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/20 text-xs placeholder:opacity-40 font-mono uppercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerSandboxMessage(
                            `Code ${testVoucherCode || 'JW-DEMO'} validé ! Accès Internet activé avec Cookie MAC.`
                          )
                        }
                        className="w-full py-2.5 rounded-xl text-slate-950 font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                        style={{ backgroundColor: form.primaryColor }}
                      >
                        Se Connecter à Internet
                      </button>
                    </div>
                  )}

                  {/* Tab View 2: Mobile Money Direct Purchase */}
                  {activePortalTab === 'momo' && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-[10px] opacity-70">Sélectionnez votre forfait :</span>
                        <select
                          value={selectedTestForfaitId}
                          onChange={(e) => setSelectedTestForfaitId(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs font-mono"
                        >
                          {forfaits.map((f) => (
                            <option key={f.id} value={f.id} className="text-black">
                              {f.name} — {formatMoney(f.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="tel"
                        placeholder="Votre numéro (Wave / Orange / MTN)"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-xs font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const ticket = simulateDirectMomoPurchase(
                            selectedTestForfaitId,
                            testPhone || '+225 07000000',
                            'Wave'
                          );
                          triggerSandboxMessage(
                            `Paiement réussi ! Votre code ${ticket.code} est connecté.`
                          );
                        }}
                        className="w-full py-2.5 rounded-xl text-slate-950 font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
                        style={{ backgroundColor: form.primaryColor }}
                      >
                        Payer & Activer Instantanément
                      </button>
                    </div>
                  )}

                  {/* Tab View 3: Free Trial */}
                  {activePortalTab === 'freetrial' && (
                    <div className="text-center p-3 rounded-xl bg-black/20 border border-white/10 space-y-2">
                      <p className="text-xs">
                        Profitez de{' '}
                        <strong className="font-mono">{form.freeTrialDurationMinutes} minutes offertes</strong>{' '}
                        pour tester la vitesse de notre réseau !
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          triggerSandboxMessage(
                            `Session d'essai de ${form.freeTrialDurationMinutes} min activée sur votre appareil !`
                          )
                        }
                        className="w-full py-2 rounded-xl text-slate-950 font-extrabold text-xs cursor-pointer active:scale-95"
                        style={{ backgroundColor: form.primaryColor }}
                      >
                        Activer mes {form.freeTrialDurationMinutes} minutes gratuites
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer of portal */}
                <div className="pt-2 border-t border-white/10 text-center text-[10px] opacity-70">
                  Assistance WhatsApp / Appel :{' '}
                  <span className="font-mono font-bold">{form.supportPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
