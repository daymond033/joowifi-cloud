import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Abidjan',
    routerCount: '1 à 5',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#008060] px-3 py-1 rounded-full bg-[#E6F4F3] border border-[#99D5D3]">
          Support & Commercial
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-sans">
          Contactez l'équipe Joo studio
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Une question sur votre routeur MikroTik, un devis pour un déploiement multi-sites ou une
          demande d'intégration personnalisée ? Nous sommes à votre écoute à Abidjan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-card space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-3">
              Coordonnées Officielles
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4F3] text-[#007A78] flex items-center justify-center shrink-0 border border-[#99D5D3]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Siège Joo studio</span>
                  <p className="text-slate-400">Cocody, Abidjan, Côte d'Ivoire</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F4F3] text-[#008060] flex items-center justify-center shrink-0 border border-[#99D5D3]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Téléphone & WhatsApp</span>
                  <a
                    href="tel:+2250100443839"
                    className="text-[#008060] hover:underline block font-mono"
                  >
                    +225 01 00 44 38 39
                  </a>
                  <p className="text-[11px] text-slate-500">Disponible 7j/7 de 08h à 20h GMT</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Courriel Électronique</span>
                  <a
                    href="mailto:joostudio.pro@gmail.com"
                    className="text-[#007A78] hover:underline block font-mono"
                  >
                    joostudio.pro@gmail.com
                  </a>
                  <p className="text-[11px] text-slate-500">Réponse sous 2 heures ouvrées</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-2">
              <a
                href="https://wa.me/2250100443839?text=Bonjour%20Joo%20studio,%20je%20souhaite%20des%20renseignements%20sur%20Joowifi."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuter directement sur WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Clock className="w-4 h-4 text-[#007A78]" />
              <span>Assistance d'urgence en direct</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Pour les opérateurs des plans Business et Enterprise, un canal Telegram prioritaire
              et une ligne directe ingénieur réseau sont attribués pour tout incident 24h/24.
            </p>
          </div>
        </div>

        {/* Right: Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl glass-card border border-slate-200">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E6F4F3] text-[#008060] flex items-center justify-center mx-auto border border-[#99D5D3]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Message bien reçu !</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Merci {formData.name}. Un conseiller technique de Joo studio va vous contacter
                  par téléphone ou e-mail dans les plus brefs délais.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      city: 'Abidjan',
                      routerCount: '1 à 5',
                      message: '',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 mb-2">Envoyez-nous un message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-600 font-medium">Nom complet *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean-Marc Koffi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-600 font-medium">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="votre-nom@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="text-slate-600 font-medium">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      placeholder="+225 07 00 00 00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-600 font-medium">Ville / Pays</label>
                    <input
                      type="text"
                      placeholder="Abidjan, Bouaké..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-600 font-medium">Nb de Routeurs</label>
                    <select
                      value={formData.routerCount}
                      onChange={(e) => setFormData({ ...formData, routerCount: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="1">1 routeur</option>
                      <option value="2 à 5">2 à 5 routeurs</option>
                      <option value="6 à 15">6 à 15 routeurs</option>
                      <option value="15+">Plus de 15 routeurs</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-slate-600 font-medium">Votre message ou projet</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez vos besoins, votre modèle de vente ou vos questions techniques..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-extrabold font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la demande</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
