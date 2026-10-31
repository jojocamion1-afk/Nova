"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, CircleHelp, CreditCard, ExternalLink, Gamepad2, LockKeyhole, Menu, ShieldCheck, ShoppingBag, Wallet, X } from "lucide-react";

type SteamSession = { authenticated: boolean; steamId?: string };
type Plan = { id: string; name: string; credits: number; price: number; label: string; description: string; featured?: boolean };

const plans: Plan[] = [
  { id: "starter", name: "Découverte", credits: 1000, price: 10, label: "PACK START", description: "Pour tes premiers achats en jeu." },
  { id: "city", name: "City", credits: 2500, price: 25, label: "CHOIX POPULAIRE", description: "Le bon départ pour ta nouvelle vie.", featured: true },
  { id: "legend", name: "Légende", credits: 5000, price: 50, label: "PACK ULTIME", description: "Un maximum de liberté en ville." },
];

const faq = [
  ["Pourquoi dois-je me connecter avec Steam ?", "Cela permet d'identifier ton SteamID64 et d'associer les crédits au bon compte Garry's Mod, sans saisie manuelle."],
  ["Est-ce que je peux acheter un VIP directement ici ?", "Non. Sur ce site, tu achètes uniquement des crédits. En jeu, ouvre la boutique NovaCity RP pour les échanger contre un VIP, un Premium, des packs ou d'autres objets."],
  ["Quand vais-je recevoir mes crédits ?", "Après activation de la passerelle de paiement et de la liaison avec le serveur, l'objectif est une attribution automatique après confirmation du paiement. À ce stade, aucun achat réel n'est encaissé."],
  ["Quel est le taux de conversion ?", "Le taux est fixe : 100 crédits = 1 €. Les montants proposés sont de 1 000, 2 500 et 5 000 crédits."],
];

function SteamMark({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0a12 12 0 0 0-12 12c0 5.38 3.53 9.94 8.4 11.47l2.61-3.8a4.52 4.52 0 0 1-2.88-1.09L4.6 17.13a3.35 3.35 0 0 1-1.87-4.35l4.93 2.04a4.5 4.5 0 0 1 5.63-4.22l2.53-3.7a5.18 5.18 0 1 1 3.76 5l-3.62 2.5a4.52 4.52 0 0 1-4.74 5.4l-2.44 3.54A12 12 0 1 0 12 0Zm6.35 5.92a3.4 3.4 0 1 0 .01 6.8 3.4 3.4 0 0 0-.01-6.8ZM11.6 13.04a2.9 2.9 0 0 0-2.5 1.41l1.57.65a1.9 1.9 0 1 1-1.46 3.52l-1.59-.66a2.9 2.9 0 1 0 3.98-4.92Z"/></svg>;
}
function Coin({ small = false }: { small?: boolean }) { return <span className={small ? "coin coin--small" : "coin"} aria-hidden="true"><span>N</span></span>; }

export default function Home() {
  const [steam, setSteam] = useState<SteamSession>({ authenticated: false });
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" }).then(async r => r.ok ? (await r.json()) as SteamSession : { authenticated: false })
      .then(s => setSteam(s)).catch(() => setSteam({ authenticated: false }));
    const authStatus = new URLSearchParams(window.location.search).get("auth");
    if (authStatus === "error" || authStatus === "setup") {
      setMessage(authStatus === "setup"
        ? "Connexion Steam à activer sur Netlify : ajoute STEAM_SESSION_SECRET dans les variables d'environnement (portée Functions), puis redéploie le site."
        : "La connexion Steam n'a pas pu être vérifiée. Réessaie depuis le bouton officiel.");
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  }, []);

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setSteam({ authenticated: false }); }
  async function choosePlan(plan: Plan) {
    setSelected(plan); setMessage("");
    if (!steam.authenticated) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan: plan.id }) });
      const data = await response.json() as { message?: string }; setMessage(data.message || "Paiement indisponible.");
    } catch { setMessage("Le service de paiement est inaccessible."); }
    finally { setCheckoutLoading(false); }
  }

  return <div className="site-shell">
    <div className="announcement"><span className="status-light"/> BOUTIQUE OFFICIELLE DE NOVACITY RP <span className="announcement-dot">◆</span><span>ACHAT DE CRÉDITS UNIQUEMENT</span></div>
    <header className="site-header">
      <a className="brand" href="#accueil" aria-label="NovaCity RP"><span className="brand-icon"><span>N</span><i/></span><span className="brand-name">NOVA<span>CITY</span><small>ROLEPLAY · GARRY&apos;S MOD</small></span></a>
      <nav className={menuOpen ? "nav-links nav-links--open" : "nav-links"} aria-label="Navigation principale"><a href="#boutique" onClick={()=>setMenuOpen(false)}>Boutique</a><a href="#fonctionnement" onClick={()=>setMenuOpen(false)}>Fonctionnement</a><a href="#questions" onClick={()=>setMenuOpen(false)}>FAQ</a></nav>
      <div className="nav-actions">{steam.authenticated ? <div className="steam-connected"><span className="connected-dot"/><span><small>STEAM CONNECTÉ</small><strong>{steam.steamId?.slice(0,8)}…{steam.steamId?.slice(-4)}</strong></span><button onClick={logout} aria-label="Déconnecter Steam"><X size={16}/></button></div> : <a className="steam-button" href="/api/auth/steam"><SteamMark/><span>Se connecter avec Steam</span><ArrowRight size={16}/></a>}<button type="button" className="mobile-menu" aria-label="Ouvrir le menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div>
    </header>

    <main>
      <section className="hero" id="accueil"><div className="hero-lines"/><div className="skyline skyline-back" aria-hidden="true">{Array.from({length:9},(_,i)=><span key={i}/>)}</div><div className="skyline skyline-front" aria-hidden="true">{Array.from({length:10},(_,i)=><span key={i}/>)}</div><div className="hero-glow"/>
        <div className="hero-content container"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> BOUTIQUE OFFICIELLE <span className="eyebrow-number">/ 2026</span></div><h1>TA VILLE.<br/>TES CHOIX.<br/><em>TON HISTOIRE.</em></h1><p className="hero-description">Passe à la vitesse supérieure sur NovaCity RP. Récupère des crédits sur ton compte Steam, puis dépense-les librement dans notre boutique en jeu.</p><div className="hero-buttons"><a className="primary-button" href="#boutique"><ShoppingBag size={19}/> DÉCOUVRIR LES CRÉDITS <ArrowRight size={18}/></a><a className="text-button" href="#fonctionnement">COMMENT ÇA MARCHE ? <ArrowDown size={18}/></a></div><div className="hero-meta"><span><ShieldCheck size={16}/> Compte Steam vérifié</span><i/><span><Wallet size={16}/> 100 crédits = 1 €</span></div></div>
          <div className="hero-display" aria-hidden="true"><div className="display-orbit display-orbit--one"/><div className="display-orbit display-orbit--two"/><span className="display-label display-label--top">NOVA CREDITS<br/><b>NC / 01</b></span><div className="giant-coin"><div className="coin-ring"><span>N</span></div></div><div className="display-stat"><span>MONNAIE PREMIUM</span><strong>NOVA<span>CRÉDITS</span></strong><small>UTILISABLES EN JEU</small></div><span className="display-label display-label--bottom">EST. 2026 <span>◆</span> DARKRP</span></div>
        </div><div className="hero-index"><span>01 — BOUTIQUE</span><span>FAIS DÉFILER POUR EXPLORER ↓</span></div></section>

      <section className="trust-band"><div className="container trust-inner"><span><LockKeyhole size={21}/> CONNEXION STEAM</span><i/><span><Coin small/> 3 OFFRES DE CRÉDITS</span><i/><span><Gamepad2 size={22}/> DÉPENSE EN JEU</span></div></section>

      <section className="shop-section section-padding" id="boutique"><div className="container"><div className="section-top"><div><div className="eyebrow dark-eyebrow"><span className="eyebrow-line"/> LA BOUTIQUE <span className="eyebrow-number">/ 01</span></div><h2>CHOISIS TON <em>PACK.</em></h2><p>Trois offres simples, un seul objectif : profiter de NovaCity RP à ta façon.</p></div><div className="rate-pill"><Coin small/><span><strong>100 CRÉDITS</strong><small>= 1,00 €</small></span></div></div><div className="availability-notice"><span>!</span><p><strong>Paiements en préparation.</strong> La boutique est visible et la connexion Steam est intégrée, mais les transactions ne sont pas encore activées.</p></div>
        <div className="plans-grid">{plans.map((plan,index)=><article key={plan.id} className={plan.featured ? "plan-card plan-card--featured" : "plan-card"}>{plan.featured && <div className="featured-bar">★ LE PLUS CHOISI</div>}<div className="plan-header"><span className="plan-index">0{index+1} / PACK CRÉDITS</span><Coin/></div><p className="plan-label">{plan.label}</p><h3>{plan.name}</h3><p className="plan-description">{plan.description}</p><div className="plan-credits"><strong>{plan.credits.toLocaleString("fr-FR")}</strong><span>CRÉDITS<br/>NOVACITY</span></div><div className="plan-price"><span>PRIX DU PACK</span><strong>{plan.price}<sup>,00 €</sup></strong></div><div className="plan-divider"/><ul className="plan-perks"><li><Check size={15}/>{plan.credits.toLocaleString("fr-FR")} crédits NovaCity</li><li><Check size={15}/>Liés à ton compte Steam</li><li><Check size={15}/>Utilisables dans la boutique F4</li></ul><button type="button" className={plan.featured ? "pack-button pack-button--featured" : "pack-button"} onClick={()=>choosePlan(plan)}><span>CHOISIR CE PACK</span><ArrowRight size={18}/></button></article>)}</div><p className="shop-disclaimer"><LockKeyhole size={15}/> Connexion Steam obligatoire pour commander. Les grades et objets ne sont pas vendus directement sur ce site.</p></div></section>

      <section className="process-section section-padding" id="fonctionnement"><div className="container"><div className="section-top section-top--light"><div><div className="eyebrow"><span className="eyebrow-line"/> MODE D&apos;EMPLOI <span className="eyebrow-number">/ 02</span></div><h2>COMMENT ÇA <em>MARCHE ?</em></h2><p>Ton compte Steam est la clé de ton porte-monnaie NovaCity.</p></div></div><div className="steps-grid"><div className="step-card"><span className="step-number">01</span><div className="step-icon"><SteamMark size={30}/></div><h3>CONNECTE TON STEAM</h3><p>Identifie-toi directement sur le site officiel Steam. Ton SteamID est détecté automatiquement.</p></div><div className="step-card"><span className="step-number">02</span><div className="step-icon"><CreditCard size={29}/></div><h3>ACHÈTE DES CRÉDITS</h3><p>Choisis une des trois offres. Une fois les paiements activés, la confirmation déclenchera l&apos;attribution des crédits.</p></div><div className="step-card"><span className="step-number">03</span><div className="step-icon"><Gamepad2 size={29}/></div><h3>DÉPENSE-LES EN JEU</h3><p>Rejoins NovaCity RP et ouvre la boutique F4 pour acheter tes avantages avec tes crédits.</p></div></div></div></section>

      <section className="ingame-section section-padding"><div className="container ingame-layout"><div className="ingame-copy"><div className="eyebrow dark-eyebrow"><span className="eyebrow-line"/> BOUTIQUE IN-GAME <span className="eyebrow-number">/ 03</span></div><h2>LES CRÉDITS,<br/><em>C&apos;EST LA LIBERTÉ.</em></h2><p>Sur le site : des crédits. En jeu : tout un catalogue d&apos;avantages. VIP, Premium, packs et bien plus encore se débloquent directement depuis ta boutique NovaCity RP.</p><div className="ingame-tags"><span>VIP</span><span>PREMIUM</span><span>PACKS</span><span>ARMES</span><span>COSMÉTIQUES</span></div><p className="ingame-caption">Aperçu des offres en jeu — aucun achat direct de VIP ou Premium ici.</p></div><div className="ingame-panel"><div className="panel-heading"><span className="panel-mark">N<span>C</span></span><span>BOUTIQUE <b>EN JEU</b><small>CATALOGUE NOVACITY</small></span><span className="panel-dots">•••</span></div><div className="panel-tabs"><span className="panel-tab-active">GRADES</span><span>PACKS</span><span>ARMES</span></div><div className="panel-item"><span className="item-symbol vip-symbol">V</span><span><strong>VIP — 1 MOIS</strong><small>Avantages exclusifs en jeu</small></span><b>1 000 <Coin small/></b></div><div className="panel-item"><span className="item-symbol premium-symbol">P</span><span><strong>PREMIUM — 1 MOIS</strong><small>Expérience Premium</small></span><b>1 500 <Coin small/></b></div><div className="panel-item"><span className="item-symbol pack-symbol">+</span><span><strong>PACK PRO — 30 JOURS</strong><small>Pack d&apos;avantages en jeu</small></span><b>4 000 <Coin small/></b></div><div className="panel-bottom"><span>CATALOGUE ILLUSTRATIF</span><span>VIA LE MENU F4 ↗</span></div></div></div></section>


      <section className="faq-section section-padding" id="questions"><div className="container faq-layout"><div><div className="eyebrow"><span className="eyebrow-line"/> BESOIN D&apos;AIDE ? <span className="eyebrow-number">/ 04</span></div><h2>DES <em>QUESTIONS ?</em></h2><p>Tout ce qu&apos;il faut savoir avant ton premier achat.</p><div className="faq-help"><CircleHelp size={19}/><span>Un souci en jeu ? Contacte l&apos;équipe NovaCity RP depuis le support du serveur.</span></div></div><div className="faq-list">{faq.map(([q,a],i)=><div className={faqOpen===i?"faq-item faq-item--open":"faq-item"} key={q}><button type="button" onClick={()=>setFaqOpen(faqOpen===i?null:i)} aria-expanded={faqOpen===i}><span>{q}</span><ChevronDown size={20}/></button>{faqOpen===i&&<p>{a}</p>}</div>)}</div></div></section>
    </main>

    <footer><div className="container footer-main"><div><a className="brand" href="#accueil"><span className="brand-icon"><span>N</span><i/></span><span className="brand-name">NOVA<span>CITY</span><small>ROLEPLAY · GARRY&apos;S MOD</small></span></a><p>Une ville, une communauté, des histoires à écrire.</p></div><div className="footer-links"><a href="#boutique">Boutique</a><a href="#fonctionnement">Fonctionnement</a><a href="#questions">FAQ</a></div></div><div className="container footer-bottom"><span>© 2026 NOVACITY RP. TOUS DROITS RÉSERVÉS.</span><span>COMMUNAUTÉ INDÉPENDANTE, NON AFFILIÉE À VALVE.</span></div></footer>

    {selected&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="purchase-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" type="button" onClick={()=>setSelected(null)} aria-label="Fermer"><X size={21}/></button><span className="modal-overline">NOVACITY RP / ACHAT DE CRÉDITS</span><div className="modal-coin"><Coin/></div><h2 id="modal-title">PACK {selected.name.toUpperCase()}</h2><p className="modal-amount">{selected.credits.toLocaleString("fr-FR")} CRÉDITS <span>— {selected.price},00 €</span></p><div className="modal-separator"/>{!steam.authenticated?<><p className="modal-text">Pour acheter ce pack, connecte d&apos;abord ton compte Steam. Tes crédits seront associés à ton SteamID vérifié.</p><a className="modal-steam" href="/api/auth/steam"><SteamMark size={21}/> SE CONNECTER AVEC STEAM <ExternalLink size={16}/></a></>:<><div className="modal-identity"><Check size={17}/><span>Compte Steam vérifié <strong>{steam.steamId}</strong></span></div><p className="modal-text">{checkoutLoading?"Vérification de la disponibilité du paiement…":message||"Le paiement automatique sera disponible prochainement."}</p><button className="modal-unavailable" type="button" disabled><LockKeyhole size={17}/> PAIEMENT NON ACTIVÉ</button></>}<p className="modal-footnote">Aucun débit ne sera effectué sur cette version du site.</p></div></div>}
    {message&&!selected&&<div className="error-toast" role="alert">{message}<button type="button" aria-label="Fermer" onClick={()=>setMessage("")}><X size={18}/></button></div>}
  </div>;
}
