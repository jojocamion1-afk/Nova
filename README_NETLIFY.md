# NovaCity RP — Boutique pour Netlify

Cette version est spécialement adaptée à **Netlify avec Next.js**.

## Ce qui est inclus

- Boutique de crédits : 1 000 / 10 €, 2 500 / 25 €, 5 000 / 50 €.
- Design sombre NovaCity RP, adapté ordinateur et mobile.
- Connexion réelle avec Steam OpenID et session sécurisée.
- Aperçu de la boutique VIP / Premium / Packs en jeu.
- FAQ et présentation des étapes d'achat.
- Aucun règlement de serveur.

**Important : les paiements ne sont pas actifs.** Aucun argent n'est prélevé et aucun crédit n'est encore envoyé au serveur Garry's Mod. Il faudra connecter un prestataire de paiement et l'addon Santana après vérification des paiements.

## Installer sur Netlify

Pour conserver la connexion Steam, utilise **un dépôt GitHub + l'import Netlify**. Ne dépose pas seulement ce ZIP dans Netlify Drop : cette application comporte des routes serveur.

1. Décompresse le ZIP dans un dossier.
2. Sur GitHub, crée un nouveau dépôt, puis ajoute à sa racine **tout le contenu du dossier** (en particulier `package.json`, `netlify.toml`, le dossier `app` et `lib`).
3. Sur Netlify : **Add new project → Import an existing project → GitHub**, puis sélectionne ton dépôt.
4. Conserve les paramètres indiqués dans `netlify.toml` : commande `npm run build`, répertoire de publication `.next`, Node 22.
5. Dans Netlify : **Project configuration → Environment variables**, crée `STEAM_SESSION_SECRET` (valeur secrète d'au moins 32 caractères aléatoires, idéalement 64).
6. Déploie ou relance le déploiement. Attends une URL HTTPS Netlify.
7. Teste « Se connecter avec Steam » : Steam doit rediriger vers ta nouvelle boutique. Teste aussi la déconnexion.

Si tu changes de domaine Netlify, les URLs de retour Steam s'adaptent automatiquement à l'origine HTTPS de la requête.

## Fichiers principaux

- `app/page.tsx` : boutique, prix et textes.
- `app/globals.css` : couleurs et style.
- `app/api/auth/steam/` : connexion Steam et retour sécurisé.
- `lib/steam.ts` : protection de la session du joueur.
- `app/api/checkout/route.ts` : contrôle des offres (paiement temporairement désactivé).
- `netlify.toml` : configuration de compilation Netlify.

## Pour tester en local

Avec Node.js 22+ :

```bash
npm install
npm run dev
```

Le design est visible localement, mais pour tester l'authentification Steam, définis `STEAM_SESSION_SECRET` dans un fichier `.env.local` non publié.

## Sécurité

- N'ajoute jamais les mots de passe Steam, les clés PayPal ou les secrets dans les fichiers affichés au navigateur.
- Les crédits ne doivent être ajoutés qu'après **confirmation serveur d'un paiement réel** et vérification de son identifiant de transaction.
- Le bouton de paiement reste bloqué tant que cette intégration n'est pas terminée.
