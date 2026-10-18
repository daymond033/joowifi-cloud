import React from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Shield, FileText, RefreshCw, Cookie, Scale } from 'lucide-react';

export const LegalPages: React.FC<{ tab: PublicTab }> = ({ tab }) => {
  const { setPublicTab } = useApp();

  const renderContent = () => {
    switch (tab) {
      case 'privacy':
        return (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <Shield className="w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Politique de Confidentialité</h1>
            </div>
            <p className="text-xs text-slate-400">Dernière mise à jour : 07 Octobre 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">1. Collecte des Données</h2>
              <p>
                Joo studio (Abidjan, Côte d'Ivoire), exploitant de la plateforme Joowifi, s'engage à
                protéger la vie privée de ses utilisateurs et de leurs abonnés WiFi. Nous collectons
                uniquement les données strictement nécessaires au fonctionnement du service :
                adresses MAC des terminaux connectés (pour la gestion du portail captif et des
                sessions), numéros de téléphone des clients finaux uniquement en cas de paiement
                direct par Mobile Money ou d'envoi de ticket par SMS/WhatsApp, et métriques
                techniques de routeurs (CPU, RAM, Uptime).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">2. Sécurité et Chiffrement</h2>
              <p>
                Toutes les communications entre les routeurs MikroTik et la plateforme Joowifi sont
                chiffrées de bout en bout via TLS (HTTPS). Les mots de passe administrateur et
                vendeur sont hachés avec bcrypt (cost 12). Les sessions sont protégées par des
                jetons JWT sécurisés transmis via des cookies httpOnly inaccessibles par du code
                JavaScript tiers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">3. Non-Cession des Données</h2>
              <p>
                Aucune donnée personnelle n'est commercialisée, louée ou cédée à des tiers. Les
                données financières de paiement transitent directement par les APIs sécurisées des
                opérateurs agréés (Orange, MTN, Wave, Moov).
              </p>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <Scale className="w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Conditions Générales d'Utilisation (CGU)</h1>
            </div>
            <p className="text-xs text-slate-400">Dernière mise à jour : 07 Octobre 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">1. Objet du Service</h2>
              <p>
                Joowifi est une solution SaaS développée par Joo studio permettant la gestion cloud
                et le contrôle d'équipements réseaux MikroTik RouterBOARD pour l'émission et la vente
                de forfaits d'accès internet WiFi en Afrique de l'Ouest.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">2. Responsabilité de l'Opérateur</h2>
              <p>
                L'utilisateur de la plateforme (l'opérateur ou gérant du hotspot) demeure seul
                responsable du respect des lois et réglementations relatives aux télécommunications
                en vigueur dans son pays d'exploitation (ARTCI en Côte d'Ivoire, ARTP au Sénégal,
                etc.) et de la conformité de sa fourniture d'accès internet.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">3. Disponibilité du Service</h2>
              <p>
                Joo studio met en œuvre tous les moyens raisonnables pour garantir une disponibilité
                de 99,9% des serveurs cloud Joowifi. En cas d'indisponibilité momentanée du cloud,
                les routeurs MikroTik continuent de fonctionner localement avec les tickets déjà
                générés en cache.
              </p>
            </section>
          </div>
        );

      case 'refund':
        return (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <RefreshCw className="w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Politique de Remboursement</h1>
            </div>
            <p className="text-xs text-slate-400">Dernière mise à jour : 07 Octobre 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">1. Abonnements SaaS</h2>
              <p>
                Les abonnements Joowifi (Starter, Pro, Business, Enterprise) sont mensuels et sans
                engagement. En cas d'insatisfaction ou d'erreur de souscription lors des 7 premiers
                jours suivant le paiement initial, un remboursement intégral peut être réclamé sur
                simple demande à joostudio.pro@gmail.com ou via WhatsApp au +225 01 00 44 38 39.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">2. Portefeuille Joowifi Pay</h2>
              <p>
                Les crédits déposés sur le portefeuille Joowifi Pay n'expirent jamais. Tout solde
                non utilisé peut être retourné vers le compte Mobile Money d'origine de l'opérateur
                sous 48 heures ouvrées, déduction faite des éventuels frais de transfert réseau.
              </p>
            </section>
          </div>
        );

      case 'cookies':
        return (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <Cookie className="w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Politique des Cookies & MAC Cookies</h1>
            </div>
            <p className="text-xs text-slate-400">Dernière mise à jour : 07 Octobre 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">1. Cookies de Session Admin & Vendeur</h2>
              <p>
                Joowifi utilise exclusivement des cookies techniques strictement nécessaires au
                maintien de votre session de connexion (JWT sécurisé, httpOnly). Aucun cookie de
                traçage publicitaire n'est déposé.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">2. Mécanisme « MAC Cookie » MikroTik</h2>
              <p>
                Sur le portail captif WiFi, l'option « MAC Cookie » permet d'associer l'adresse MAC
                d'un abonné à son ticket valide. Lorsqu'un client quitte la zone de couverture puis
                revient, son smartphone est reconnecté automatiquement sans qu'il n'ait à retaper
                son code de ticket.
              </p>
            </section>
          </div>
        );

      case 'legal':
      default:
        return (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3 text-amber-400 mb-2">
              <FileText className="w-6 h-6" />
              <h1 className="text-2xl font-bold text-white">Mentions Légales</h1>
            </div>
            <p className="text-xs text-slate-400">Dernière mise à jour : 07 Octobre 2026</p>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">1. Éditeur de l'Application</h2>
              <p>
                L'application web et plateforme SaaS <strong>Joowifi</strong> est éditée par :
              </p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono">
                <p className="text-white font-bold">Joo studio</p>
                <p>Abidjan, Côte d'Ivoire</p>
                <p>Courriel : joostudio.pro@gmail.com</p>
                <p>Téléphone / WhatsApp : +225 01 00 44 38 39</p>
                <p>Plateforme hébergée sous architecture cloud avec protection Cloudflare.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">2. Propriété Intellectuelle</h2>
              <p>
                L'ensemble des éléments constituant l'application Joowifi (marques, logos, code
                source, interfaces, graphismes et documentation) sont la propriété exclusive de Joo
                studio. MikroTik® et RouterOS® sont des marques déposées de MikroTikls SIA (Lettonie),
                mentionnées à des fins de compatibilité technique.
              </p>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Navigation tabs between legal docs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
        {[
          { tab: 'legal', label: 'Mentions Légales' },
          { tab: 'privacy', label: 'Confidentialité' },
          { tab: 'terms', label: 'Conditions (CGU)' },
          { tab: 'refund', label: 'Remboursement' },
          { tab: 'cookies', label: 'Cookies & MAC' },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setPublicTab(item.tab as PublicTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === item.tab
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-slate-800">
        {renderContent()}
      </div>
    </div>
  );
};
