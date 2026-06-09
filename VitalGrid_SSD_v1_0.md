# VITALGRID

Plateforme B2B de Mutualisation et Répartition des Ressources Médicales & Humanitaires

## SCREEN SPECIFICATION DOCUMENT (SSD)

Spécification complète de tous les écrans, fonctionnalités,
composants UI, appels API, règles métier et états d'interface

---

| **Propriété**       | **Valeur**                                                      |
|---------------------|-----------------------------------------------------------------|
| Document            | Screen Specification Document (SSD)                             |
| Version             | 1.0.0                                                           |
| Date                | Juin 2026                                                       |
| Projet              | VitalGrid — H0: Hack the Zero Stack (AWS × Vercel)             |
| Stack               | Next.js 15 · Vercel v0 · Aurora DSQL · DynamoDB                |
| Destinataires       | Équipe de développement Front-End & Back-End                    |
| Total d'écrans      | 44 écrans documentés                                            |
| Total de modules    | 8 modules                                                       |

---

# 0. ARCHITECTURE GLOBALE DE NAVIGATION

## 0.1 Structure de Navigation par Rôle

| **Rôle**             | **Écrans Accessibles**              | **Permissions**                                                  |
|----------------------|-------------------------------------|------------------------------------------------------------------|
| Super Admin          | Tous les 44 écrans                  | Lecture + Écriture + Configuration + Suppression + Facturation   |
| Facility Manager     | 34 écrans (sans config plateforme)  | Lecture + Écriture inventaire/transferts + Rapports              |
| Field Agent          | 14 écrans (inventaire + transferts) | Écriture inventaire propre facility + Confirmation réceptions    |
| NGO Coordinator      | 22 écrans (multi-facility en lecture) | Lecture multi-sites + Création demandes transfert + Alertes    |
| Auditor              | 18 écrans (lecture seule)           | Lecture seule tous modules + Export rapports                     |
| API Consumer         | Accès programmatique uniquement     | Endpoints REST définis par scope OAuth2                          |

## 0.2 Arborescence Complète des Écrans

| **ID**   | **Écran**                          | **Module**    | **Route**                        | **Rôle minimum**   |
|----------|------------------------------------|---------------|----------------------------------|--------------------|
| SCR-001  | Page de Connexion                  | Auth          | /login                           | Public             |
| SCR-002  | Mot de passe oublié / OTP          | Auth          | /forgot-password                 | Public             |
| SCR-003  | Onboarding première organisation   | Auth          | /onboarding                      | Super Admin        |
| SCR-004  | Dashboard Facility Manager         | Dashboard     | /dashboard                       | Facility Manager   |
| SCR-005  | Dashboard Field Agent              | Dashboard     | /dashboard/field                 | Field Agent        |
| SCR-006  | Dashboard NGO Coordinator          | Dashboard     | /dashboard/ngo                   | NGO Coordinator    |
| SCR-007  | Dashboard Super Admin              | Dashboard     | /dashboard/admin                 | Super Admin        |
| SCR-008  | Liste des ressources               | Inventaire    | /inventory                       | Field Agent        |
| SCR-009  | Détail d'une ressource             | Inventaire    | /inventory/:id                   | Field Agent        |
| SCR-010  | Ajouter / Modifier ressource       | Inventaire    | /inventory/new                   | Field Agent        |
| SCR-011  | Import ressources (CSV)            | Inventaire    | /inventory/import                | Facility Manager   |
| SCR-012  | Alertes stock bas                  | Inventaire    | /inventory/low-stock             | Facility Manager   |
| SCR-013  | Suivi des expirations              | Inventaire    | /inventory/expiry                | Facility Manager   |
| SCR-014  | Catalogue de catégories            | Inventaire    | /inventory/categories            | Super Admin        |
| SCR-015  | Carte des établissements           | Facilities    | /facilities/map                  | NGO Coordinator    |
| SCR-016  | Liste des établissements           | Facilities    | /facilities                      | NGO Coordinator    |
| SCR-017  | Détail établissement & inventaire  | Facilities    | /facilities/:id                  | Facility Manager   |
| SCR-018  | Ajouter / Modifier établissement   | Facilities    | /facilities/new                  | Super Admin        |
| SCR-019  | Gestion du personnel               | Facilities    | /facilities/:id/staff            | Facility Manager   |
| SCR-020  | Nouvelle demande de transfert      | Transferts    | /transfers/new                   | Field Agent        |
| SCR-021  | Ressources disponibles à proximité | Transferts    | /transfers/available             | Field Agent        |
| SCR-022  | Liste des transferts en cours      | Transferts    | /transfers                       | Field Agent        |
| SCR-023  | Détail & suivi d'un transfert      | Transferts    | /transfers/:id                   | Field Agent        |
| SCR-024  | Confirmation de réception          | Transferts    | /transfers/:id/receive           | Field Agent        |
| SCR-025  | Historique des transferts          | Transferts    | /transfers/history               | Facility Manager   |
| SCR-026  | Broadcast d'urgence                | Transferts    | /transfers/broadcast             | NGO Coordinator    |
| SCR-027  | Centre d'alertes                   | Alertes       | /alerts                          | Field Agent        |
| SCR-028  | Dashboard IoT chaîne du froid      | Alertes       | /alerts/cold-chain               | Facility Manager   |
| SCR-029  | Créer une règle d'alerte           | Alertes       | /alerts/rules/new                | Facility Manager   |
| SCR-030  | Préférences de notifications       | Alertes       | /alerts/preferences              | Field Agent        |
| SCR-031  | Historique des alertes             | Alertes       | /alerts/history                  | Auditor            |
| SCR-032  | Carte régionale des stocks         | Analytics     | /analytics/map                   | NGO Coordinator    |
| SCR-033  | Prévision de la demande            | Analytics     | /analytics/forecast              | Facility Manager   |
| SCR-034  | Rapport risques d'expiration       | Analytics     | /analytics/expiry-risk           | Facility Manager   |
| SCR-035  | Rapport efficacité des transferts  | Analytics     | /analytics/transfers             | Auditor            |
| SCR-036  | Export & Rapport API               | Analytics     | /analytics/export                | Auditor            |
| SCR-037  | Gestion des utilisateurs           | Admin         | /admin/users                     | Super Admin        |
| SCR-038  | Rôles & permissions                | Admin         | /admin/roles                     | Super Admin        |
| SCR-039  | Paramètres de l'organisation       | Admin         | /admin/organization              | Super Admin        |
| SCR-040  | Clés API & intégrations            | Admin         | /admin/api-keys                  | Super Admin        |
| SCR-041  | Journal d'audit                    | Admin         | /admin/audit-log                 | Auditor            |
| SCR-042  | Centre d'import de données         | Admin         | /admin/import                    | Super Admin        |
| SCR-043  | Facturation & abonnement           | Admin         | /admin/billing                   | Super Admin        |
| SCR-044  | Statut du système                  | Admin         | /admin/system-status             | Super Admin        |

---

# 1. MODULE AUTHENTIFICATION

---

**SCR-001** — **Page de Connexion** | Module: AUTH | **Public**

```
+─────────────────────────────────────────────────────────────+
|                                                             |
|              [ LOGO VITALGRID ]                             |
|         Réseau Global de Ressources Critiques               |
|                                                             |
|   +─────────────────────────────────────────────────+       |
|   |  Adresse email professionnelle                  |       |
|   |  [_____________________________________________]|       |
|   |                                                 |       |
|   |  Mot de passe                                   |       |
|   |  [_____________________________________________]|       |
|   |                                       [👁]      |       |
|   |                                                 |       |
|   |  [ ] Se souvenir 30 jours  Mot de passe oublié?|       |
|   |                                                 |       |
|   |       [ SE CONNECTER (btn #1D9E75) ]            |       |
|   |                                                 |       |
|   |  ─────────── Connexion SSO ──────────           |       |
|   |       [ Continuer avec SAML/SSO ]               |       |
|   +─────────────────────────────────────────────────+       |
|                                                             |
|   🔒 Connexion chiffrée TLS 1.3  |  VitalGrid v1.0.0      |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**        | **Type**        | **Validation**              | **Note**                                         |
|----------------------|-----------------|-----------------------------|--------------------------------------------------|
| Logo VitalGrid       | Image statique  | —                           | Chargé depuis /assets/logo.svg                   |
| Champ email          | Input email     | Requis, format email valide | Autocomplete="email"                             |
| Champ mot de passe   | Input password  | Requis, min 8 chars         | Icône œil toggle affichage                       |
| Case souvenir        | Checkbox        | —                           | Persiste refreshToken 30 jours si coché          |
| Lien MDP oublié      | Link            | —                           | Redirige vers SCR-002                            |
| Bouton Se connecter  | Button primary  | Form valide                 | Désactivé si champs vides ou invalides           |
| Bouton SSO           | Button outline  | —                           | Déclenche flux SAML 2.0 selon domaine email      |
| Badge TLS            | Badge statique  | —                           | Indicateur sécurité visible en bas               |

### États de l'écran

- **Défaut** : formulaire vide, bouton désactivé, badge TLS affiché
- **Saisie en cours** : validation en temps réel, bouton s'active quand les deux champs valides
- **Chargement** : spinner sur le bouton, champs désactivés, cursor wait
- **Erreur credentials** : message rouge `'Email ou mot de passe incorrect'` sous le formulaire — max 5 tentatives
- **Erreur réseau** : toast orange `'Serveur injoignable — réessayez dans quelques instants'`
- **Compte verrouillé** : après 5 échecs, message rouge + timer countdown 30 min + email de déverrouillage envoyé
- **SSO redirect** : spinner plein écran `'Redirection vers votre fournisseur d'identité...'`

### Appels API

**POST /api/auth/login** — *Authentification par credentials*
```
Body:    { email, password, rememberMe: boolean }
Succès:  { accessToken, refreshToken, expiresIn, user: { id, role, facilityId, orgId, name } }
Erreurs: 401 ERR_INVALID_CREDENTIALS | 423 ERR_ACCOUNT_LOCKED | 429 ERR_RATE_LIMIT
```

**POST /api/auth/sso/initiate** — *Démarrer flux SAML/SSO*
```
Body:    { email }
Succès:  { redirectUrl: string }
Erreurs: 404 ERR_SSO_NOT_CONFIGURED
```

**POST /api/auth/refresh** — *Renouveler le token JWT*
```
Body:    { refreshToken }
Succès:  { accessToken, expiresIn }
Erreurs: 401 ERR_REFRESH_EXPIRED
```

### Règles Métier

1. Après connexion réussie → rediriger selon rôle : `Super Admin→/dashboard/admin`, `Facility Manager→/dashboard`, `Field Agent→/dashboard/field`, `NGO Coordinator→/dashboard/ngo`, `Auditor→/analytics/map`
2. L'accessToken expire après 1h ; le refreshToken, après 24h (ou 30 jours si rememberMe coché)
3. Les tokens sont stockés dans des httpOnly cookies — jamais dans localStorage
4. Si le domaine email correspond à un tenant SSO configuré → afficher automatiquement le bouton SSO en priorité
5. Le verrou de compte déclenche un email automatique à l'adresse du Super Admin de l'organisation

---

**SCR-002** — **Mot de Passe Oublié / Reset OTP** | Module: AUTH | **Public**

```
+─────────────────────────────────────────────────────────────+
|  ← Retour à la connexion                                    |
|                                                             |
|  Réinitialiser votre mot de passe                           |
|                                                             |
|  ÉTAPE 1 — Entrez votre email professionnel                 |
|   +─────────────────────────────────────────────────+       |
|   |  [____________________________________________] |       |
|   |       [ ENVOYER LE CODE (btn #1D9E75) ]         |       |
|   +─────────────────────────────────────────────────+       |
|                                                             |
|  ÉTAPE 2 — Entrez le code reçu par email (6 chiffres)      |
|   +─────────────────────────────────────────────────+       |
|   |  [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]           |       |
|   |  Code expire dans : 09:47          [Renvoyer]   |       |
|   +─────────────────────────────────────────────────+       |
|                                                             |
|  ÉTAPE 3 — Nouveau mot de passe                            |
|   +─────────────────────────────────────────────────+       |
|   |  Nouveau mot de passe                           |       |
|   |  [____________________________________________] |       |
|   |  Confirmer le mot de passe                      |       |
|   |  [____________________________________________] |       |
|   |  ✅ 8 caractères min  ✅ 1 majuscule  ✅ 1 chiffre|     |
|   |       [ RÉINITIALISER (btn #1D9E75) ]           |       |
|   +─────────────────────────────────────────────────+       |
+─────────────────────────────────────────────────────────────+
```

### Composants

| **Composant**         | **Type**       | **Description**                                              |
|-----------------------|----------------|--------------------------------------------------------------|
| Stepper (3 étapes)    | UI composant   | Étapes 2 et 3 masquées jusqu'à validation étape précédente  |
| Champ email           | Input email    | Même validation que SCR-001                                  |
| Bouton Envoyer code   | Button primary | Déclenche envoi OTP par email                                |
| Inputs OTP (×6)       | Input number   | Focus auto sur le champ suivant à chaque chiffre saisi       |
| Timer countdown       | Text dynamique | Rafraîchi chaque seconde — grisé à 0 avec bouton Renvoyer   |
| Bouton Renvoyer       | Link button    | Disponible uniquement quand timer = 0, max 3 renvois         |
| Champs mot de passe   | Input password | Validation en temps réel avec checklist visuelle             |
| Bouton Réinitialiser  | Button primary | Actif seulement si MDP valide et confirmé                    |

### Appels API

**POST /api/auth/forgot-password** — *Envoyer code OTP par email*
```
Body:    { email }
Succès:  { success: true, expiresIn: 600, maskedEmail: "j***@vitalgrid.org" }
Erreurs: 404 ERR_EMAIL_NOT_FOUND | 429 ERR_RATE_LIMIT
```

**POST /api/auth/verify-otp** — *Valider le code à 6 chiffres*
```
Body:    { email, otp }
Succès:  { resetToken: string, expiresIn: 300 }
Erreurs: 400 ERR_INVALID_OTP | 410 ERR_OTP_EXPIRED
```

**POST /api/auth/reset-password** — *Définir le nouveau mot de passe*
```
Body:    { resetToken, newPassword }
Succès:  { success: true, message: "Mot de passe mis à jour" }
Erreurs: 400 ERR_PASSWORD_WEAK | 410 ERR_RESET_TOKEN_EXPIRED
```

---

**SCR-003** — **Onboarding Première Organisation** | Module: AUTH | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
|  Bienvenue sur VitalGrid                                    |
|  Configurez votre organisation en 3 étapes (5 min)         |
|                                                             |
|  [●]──────[○]──────[○]                                     |
|  Organisation  Établissements  Ressources                   |
|                                                             |
|  ÉTAPE 1 / 3 — Votre organisation                          |
|   +─────────────────────────────────────────────────+       |
|   | Nom de l'organisation *                         |       |
|   | [____________________________________________]  |       |
|   | Type d'organisation *                           |       |
|   | [ ONG Humanitaire ▼ ]                          |       |
|   | Pays principal *                                |       |
|   | [ Sélectionner... ▼ ]                          |       |
|   | Régions d'opération (multi-select)              |       |
|   | [ + Ajouter une région ]                        |       |
|   | Logo (optionnel)                                |       |
|   | [ ⬆ Télécharger logo ] max 2MB PNG/SVG         |       |
|   +─────────────────────────────────────────────────+       |
|                                                             |
|         [ PASSER (lien) ]  [ CONTINUER → (btn) ]           |
+─────────────────────────────────────────────────────────────+
```

### Composants & Règles Métier

| **Composant**         | **Type**        | **Requis** | **Note**                                          |
|-----------------------|-----------------|------------|---------------------------------------------------|
| Nom organisation      | Input text      | Oui        | 3–100 chars, unique dans la plateforme            |
| Type organisation     | Select          | Oui        | ONG / Hôpital-réseau / Distributeur / Gouvernement|
| Pays principal        | Select (ISO)    | Oui        | Filtre la liste des régions disponibles           |
| Régions opération     | Multi-select    | Non        | Max 20 régions                                    |
| Upload logo           | File input      | Non        | PNG/SVG max 2MB, redimensionné 256×256 auto       |
| Bouton Passer         | Link discret    | —          | Skippe vers dashboard avec config minimale        |
| Bouton Continuer      | Button primary  | —          | Désactivé si champs requis manquants              |

**POST /api/organizations** — *Créer l'organisation*
```
Body:    { name, type, countryCode, regions[], logoFile }
Succès:  { organization: { id, slug, name, type } }
```

---

# 2. MODULE DASHBOARD

---

**SCR-004** — **Dashboard Facility Manager** | Module: DASHBOARD | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| [≡] VitalGrid  |  Hôpital Général de Référence  |  [🔔3] [👤]|
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Bonjour, Dr. Amara ▪ Kinshasa, RDC ▪ Lun 09 Juin 2026    |
|                                                             |
|  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────┐|
|  │ RESSOURCES   │ │ ALERTES      │ │ TRANSFERTS   │ │EXPIR│|
|  │    847       │ │  ⚠ 12       │ │  En cours: 3 │ │  7j │|
|  │ unités stock │ │  critiques   │ │  En attente:2│ │ J+7 │|
|  └──────────────┘ └──────────────┘ └──────────────┘ └─────┘|
|                                                             |
|  ── Alertes Prioritaires ─────────────────────────────────  |
|  🔴 Poches sang O- : 4 restantes    [ Demander transfert ] |
|  🟠 Adrénaline 1mg : stock < seuil  [ Voir inventaire ]    |
|  🟡 Vaccins VPO : expirent dans 6j  [ Gérer expiration ]  |
|                                                             |
|  ── Transferts en cours ──────────────────────────────────  |
|  📦 #TRF-2847  ←  Clinique St-Luc   Sang A+  ×20   ETA 2h |
|  📦 #TRF-2851  →  CBCA Goma         Amoxil 500mg ×100 ✓   |
|                                                             |
|  ── Dernières activités ──────────────────────────────────  |
|  14:32 · Kasongo J. a mis à jour l'inventaire (Salle B)    |
|  13:15 · Transfert #TRF-2844 confirmé réceptionné          |
|  11:02 · Alerte stock : Gants L < 50 unités                |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**              | **Type**           | **Source données**                       | **Refresh**     |
|----------------------------|--------------------|------------------------------------------|-----------------|
| Header barre navigation    | Navigation bar     | Contexte utilisateur session             | Statique        |
| Badge notifications        | Badge counter      | GET /api/alerts/unread-count             | WebSocket live  |
| Carte métriques (×4)       | Metric cards       | GET /api/dashboard/summary               | Toutes 5 min    |
| Liste alertes prioritaires | List               | GET /api/alerts?priority=high&limit=3    | WebSocket live  |
| Boutons CTA inline         | Button outline     | —                                        | —               |
| Liste transferts en cours  | List               | GET /api/transfers?status=in_transit     | Toutes 2 min    |
| Feed activités récentes    | Activity feed      | GET /api/activity-log?facilityId=&limit=5| Toutes 60 sec   |

### États de l'écran

- **Défaut** : toutes les métriques chargées, aucune alerte critique → message vert `'Tous les stocks sont dans les seuils normaux'`
- **Alerte critique** : bannière rouge en haut `'⚠ 1 ressource critique — action requise'`
- **Chargement initial** : skeleton loaders sur chaque carte et liste
- **Erreur de données** : cartes affichent `'—'` avec icône refresh, pas de crash

### Appels API

**GET /api/dashboard/summary** — *Métriques globales de l'établissement*
```
Query:   facilityId (injecté depuis JWT)
Réponse: { totalResources, criticalAlerts, activeTransfers, expiringIn7Days }
```

**GET /api/alerts?priority=high&facilityId=&limit=3** — *Alertes critiques*
```
Réponse: { alerts: [{ id, resourceName, alertType, severity, quantity, threshold }] }
```

**GET /api/transfers?status=in_transit&facilityId=** — *Transferts actifs*
```
Réponse: { transfers: [{ id, ref, direction, resourceName, quantity, eta, status }] }
```

### Règles Métier

1. Les métriques en rouge indiquent un seuil franchi — un clic navigue directement vers l'écran concerné
2. Les transferts s'actualisent via WebSocket : `ws://api/facility/{facilityId}/live`
3. Le bouton `'Demander transfert'` sur une alerte pré-remplit le formulaire SCR-020 avec la ressource concernée
4. Le feed d'activité est limité aux 5 dernières actions de la facility — limité à l'organisation

---

**SCR-005** — **Dashboard Field Agent** | Module: DASHBOARD | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← VitalGrid          MON ESPACE          [🔔1] [Synchro ✓] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Bienvenue, Muteba L.  ·  Salle Urgences — Bloc A          |
|                                                             |
|  ┌─────────────────────┐  ┌─────────────────────────────┐  |
|  │  Mes tâches         │  │  Scan rapide                │  |
|  │  📋 2 entrées en   │  │  [📷 Scanner un article]    │  |
|  │  attente de saisie  │  │                             │  |
|  └─────────────────────┘  └─────────────────────────────┘  |
|                                                             |
|  ── Ressources critiques dans ma zone ────────────────────  |
|  🔴 Seringues 5mL         12 restantes   [ + Ajouter ]    |
|  🟠 Compresses stériles   28 restantes   [ + Ajouter ]    |
|                                                             |
|  ── Actions rapides ──────────────────────────────────────  |
|  [ 📦 Enregistrer réception ]  [ 🔄 Déclarer transfert ]  |
|  [ ➕ Ajouter entrée stock  ]  [ ⚠ Signaler anomalie   ]  |
|                                                             |
|  ── Transfert en attente de confirmation ─────────────────  |
|  📦 #TRF-2847 · Sang O-  ×5  ·  Arrivée dans ~1h30       |
|  [ CONFIRMER RÉCEPTION ]                                    |
+─────────────────────────────────────────────────────────────+
```

### Composants & États

| **Composant**               | **Type**      | **Note**                                               |
|-----------------------------|---------------|--------------------------------------------------------|
| Indicateur de sync          | Badge         | Vert = synchro récente < 5min / Orange = > 30min      |
| Carte tâches en attente     | Card          | Actions hors-ligne en attente de sync                 |
| Bouton scanner QR           | Button icon   | Ouvre caméra native → auto-lookup ressource par code  |
| Liste ressources critiques  | List          | Filtrée sur la zone de l'agent (zoneId depuis profil) |
| Grille actions rapides      | 2×2 grid      | Raccourcis vers SCR-010, SCR-020, SCR-024             |
| Banner transfert entrant    | Alert card    | Visible uniquement si transfert destiné à cet agent   |

### Appels API

**GET /api/dashboard/field-agent** — *Vue simplifiée pour agents terrain*
```
Réponse: { pendingTasks, criticalInZone, incomingTransfer, lastSyncAt }
```

---

**SCR-006** — **Dashboard NGO Coordinator** | Module: DASHBOARD | **NGO Coordinator+**

```
+─────────────────────────────────────────────────────────────+
| [≡] VitalGrid  |  UNICEF RDC — Coordinateur régional  [🔔5]|
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Vue Régionale — Kivu Nord & Sud  ·  Mise à jour: 14:47    |
|                                                             |
|  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        |
|  │ FACILITIES   │ │ RESSOURCES   │ │ EN PÉNURIE   │        |
|  │  23 actives  │ │ 47 types     │ │  ⚠ 8        │        |
|  │  2 hors-ligne│ │ surveillés   │ │  établissmt  │        |
|  └──────────────┘ └──────────────┘ └──────────────┘        |
|                                                             |
|  ── Carte de chaleur des pénuries ────────────────────────  |
|  [ Miniature carte — points chauds rouges / orange ]       |
|  [ Voir carte complète → ]                                  |
|                                                             |
|  ── Établissements en situation critique ─────────────────  |
|  🔴 CS Masisi       Sang  O-   0 unités   [ Broadcast ]   |
|  🔴 HGR Walikale    Quinine inj.  3 unités [ Broadcast ]  |
|  🟠 Clinique Kiwanja Gants stériles  <20   [ Transfert ]  |
|                                                             |
|  ── Transferts inter-établissements en cours ─────────────  |
|  3 transferts actifs · 12 complétés cette semaine          |
|  [ Voir tous les transferts ]                               |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/dashboard/ngo-coordinator** — *Vue multi-facilities*
```
Query:   orgId, regionIds[]
Réponse: { activeFacilities, offlineFacilities, resourceTypes, criticalFacilities[], activeTransfers }
```

**GET /api/facilities/heatmap** — *Données pour miniature carte*
```
Query:   regionIds[], resourceType (optionnel)
Réponse: { points: [{ lat, lng, severity: 'critical'|'warning'|'ok', facilityId }] }
```

---

**SCR-007** — **Dashboard Super Admin** | Module: DASHBOARD | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
| [≡] VitalGrid ADMIN        |  [🌍 Plateforme globale]  [👤] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      |
|  │ ORGS     │ │FACILITIES│ │ USERS    │ │ API REQ  │      |
|  │ 47 actif │ │  312     │ │ 1,847    │ │ 98k/24h  │      |
|  └──────────┘ └──────────┘ └──────────┘ └──────────┘      |
|                                                             |
|  ── Santé du système (Aurora DSQL / DynamoDB) ────────────  |
|  ✅ Aurora DSQL     Latence: 4ms     Connexions: 89/500    |
|  ✅ DynamoDB        Latence: 1ms     WCU utilisées: 22%    |
|  ✅ Vercel Edge     P95: 87ms        Uptime: 99.98%        |
|                                                             |
|  ── Activité récente plateforme ──────────────────────────  |
|  [ Graphique sparkline — requêtes/heure dernières 24h ]    |
|                                                             |
|  ── Organisations récemment inscrites ────────────────────  |
|  MSF Belgique        24 facilities  12h ago                |
|  Min. Santé Burundi  8 facilities   2 jours ago            |
|                                                             |
|  [ Gérer utilisateurs ]  [ Logs audit ]  [ Facturation ]   |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/admin/platform-summary** — *Métriques globales plateforme*
```
Réponse: { orgs, facilities, users, apiRequests24h, systemHealth: { dsql, dynamodb, vercel } }
```

---

# 3. MODULE INVENTAIRE

---

**SCR-008** — **Liste des Ressources** | Module: INVENTAIRE | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     INVENTAIRE          [+ Ajouter] [⬆ Import] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Hôpital Général de Référence — Tous les emplacements      |
|                                                             |
|  🔍 [Rechercher ressource...         ]  [🔽 Filtres]        |
|     Catégorie: [Tous ▼]  Statut: [Tous ▼]  Zone: [Tous ▼] |
|                                                             |
|  Résultats: 847 ressources · 12 critiques · 7 expirant ⚠   |
|                                                             |
|  ┌─────────────────────────────────────────────────────┐   |
|  │ NOM                  CATÉG.  QTÉ    SEUIL  STATUT   │   |
|  ├─────────────────────────────────────────────────────┤   |
|  │🔴 Poches sang O-     Sang    4      10     CRITIQUE  │   |
|  │🟠 Adrénaline 1mg/mL  Méd.   18      20     FAIBLE   │   |
|  │🟡 Vaccin VPO dose    Vaccin  45     30     EXPIRE J+6│   |
|  │✅ Amoxicilline 500mg  Méd.  230     50     OK        │   |
|  │✅ Gants latex M       Matér. 580    100    OK        │   |
|  │✅ Seringues 5mL       Matér. 1200   200    OK        │   |
|  └─────────────────────────────────────────────────────┘   |
|                                                             |
|  [ < 1 2 3 ... 34 > ]   25 par page                        |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**           | **Type**           | **Validation**           | **Note**                                       |
|-------------------------|--------------------|--------------------------|------------------------------------------------|
| Barre de recherche      | Input text         | Min 2 chars pour lancer  | Recherche par nom, DCI, code-barres            |
| Filtre Catégorie        | Select             | —                        | Sang / Médicaments / Vaccins / Matériel / Autre|
| Filtre Statut           | Select             | —                        | Tous / Critique / Faible / Expire / OK         |
| Filtre Zone             | Select             | —                        | Zones définies par la facility                 |
| Compteur résultats      | Text info          | —                        | Mis à jour à chaque filtre                     |
| Tableau ressources      | Table              | —                        | Tri par colonne, click ligne → SCR-009         |
| Indicateur statut       | Badge coloré       | —                        | Rouge = critique / Orange = faible / Jaune = expire / Vert = ok |
| Pagination              | Paginator          | —                        | 25/page mobile, 50/page desktop                |
| Bouton Ajouter          | Button primary     | —                        | Rôle ≥ Field Agent requis                      |
| Bouton Import           | Button outline     | —                        | Rôle ≥ Facility Manager requis                 |

### États de l'écran

- **Défaut** : liste chargée, tri par statut (critiques en tête)
- **Chargement** : skeleton table 6 lignes
- **Liste vide** : illustration + message `'Aucune ressource dans cet inventaire — commencez par ajouter des articles'` + bouton Ajouter
- **Résultats filtrés à 0** : `'Aucun résultat pour ces filtres'` + bouton `'Réinitialiser les filtres'`
- **Mode offline** : banner orange + indicateur `'Affichage du dernier snapshot — dernière sync : 14:32'`

### Appels API

**GET /api/inventory** — *Liste paginée des ressources*
```
Query:   facilityId, category?, status?, zone?, search?, page=1, limit=25
Réponse: { resources: [Resource], total, page, criticalCount, expiringCount }
```

### Règles Métier

1. Les ressources critiques (quantité ≤ seuil) apparaissent en tête de liste par défaut, triées par sévérité
2. Le tri par défaut est : Critique → Faible → Expire bientôt → OK
3. La recherche opère sur : nom commercial, DCI (dénomination commune internationale), code-barres
4. Les données de stock de l'inventaire sont lues depuis Aurora DSQL avec read consistency forte

---

**SCR-009** — **Détail d'une Ressource** | Module: INVENTAIRE | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Inventaire       DÉTAIL RESSOURCE        [ ✏ Modifier ]  |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  🩸 Poches de Sang — Groupe O Négatif (O-)                 |
|  ID: RES-2847 · Catégorie: Sang · Zone: Banque de Sang     |
|                                                             |
|  ┌────────────────────────────────────────────────────┐    |
|  │  🔴 STOCK CRITIQUE                                 │    |
|  │  Quantité actuelle :    4 unités                   │    |
|  │  Seuil d'alerte :       10 unités                  │    |
|  │  Unité de mesure :      Poches (450mL)             │    |
|  │  Expiration prochaine : 12 Jul 2026 (lot BT-4429)  │    |
|  └────────────────────────────────────────────────────┘    |
|                                                             |
|  ── Lots en stock ────────────────────────────────────────  |
|  LOT BT-4429  ·  Qté: 3  ·  Expire: 12/07/2026  ·  ⚠      |
|  LOT BT-4831  ·  Qté: 1  ·  Expire: 28/08/2026  ·  ✅     |
|                                                             |
|  ── Disponibilité à proximité ────────────────────────────  |
|  Clinique St-Luc         12 km  ·  18 poches  [ Demander ] |
|  Hôpital Panzi           34 km  ·  7 poches   [ Demander ] |
|                                                             |
|  ── Historique des mouvements (30 jours) ─────────────────  |
|  09/06  -2    Utilisation urgence  Salle opér.  Muteba L.  |
|  07/06  +10   Réception livraison  #TRF-2801    Kasongo J. |
|  04/06  -3    Utilisation normale  Salle opér.  Okitabide  |
|                                                             |
|  [ 🔄 Demander un transfert ]  [ 📋 Exporter historique ]  |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**                 | **Type**       | **Source**                                        |
|-------------------------------|----------------|---------------------------------------------------|
| Carte statut stock            | Status card    | GET /api/inventory/:id                            |
| Table des lots                | Table          | GET /api/inventory/:id/batches                    |
| Disponibilité proximité       | List           | GET /api/inventory/nearby?resourceTypeId=&radius= |
| Bouton Demander (inline)      | Button outline | Pré-remplit SCR-020 avec facilityId source        |
| Tableau historique mouvements | Table          | GET /api/inventory/:id/movements                  |
| Bouton Demander transfert     | Button primary | → SCR-020 pré-rempli                              |
| Bouton Exporter               | Button outline | Déclenche export CSV historique                   |

### Appels API

**GET /api/inventory/:id** — *Détail complet d'une ressource*
```
Réponse: { resource: Resource, batches: Batch[], currentStock, threshold, zone, facilityId }
```

**GET /api/inventory/nearby** — *Stock disponible dans facilities proches*
```
Query:   resourceTypeId, facilityId (origine), radiusKm=50
Réponse: { facilities: [{ facilityId, name, distance, availableQty }] }
```

**GET /api/inventory/:id/movements** — *Historique mouvements 30 jours*
```
Query:   page=1, limit=20
Réponse: { movements: [{ date, delta, reason, location, user, transferId? }] }
```

### Règles Métier

1. Le bouton `'Demander un transfert'` n'est visible que si la quantité est ≤ seuil × 2
2. La disponibilité à proximité est calculée via Aurora DSQL — requête géospatiale sur `facilities.coordinates`
3. L'historique des mouvements est immuable — aucun movement enregistré ne peut être supprimé
4. La liste des lots est triée par date d'expiration croissante (FEFO — First Expired, First Out)

---

**SCR-010** — **Ajouter / Modifier une Ressource** | Module: INVENTAIRE | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Inventaire       AJOUTER UNE RESSOURCE                   |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  [ 📷 Scanner code-barres ] ── ou ── [ Saisie manuelle ]   |
|                                                             |
|  Nom / Dénomination *                                       |
|  [____________________________________________]             |
|  DCI (Dénomination Commune Internationale)                  |
|  [____________________________________________]             |
|  Catégorie *          Zone de stockage *                    |
|  [ Médicaments ▼ ]   [ Banque de Sang ▼ ]                 |
|  Unité de mesure *    Quantité ajoutée *                    |
|  [ Unité(s) ▼ ]      [ _____________ ]                    |
|  Numéro de lot *      Date d'expiration *                   |
|  [_____________ ]     [  JJ/MM/AAAA  ]                     |
|  Fournisseur          Numéro de commande                    |
|  [_____________ ]     [_____________ ]                      |
|  Seuil d'alerte       Emplacement physique                  |
|  [_____________ ]     [_____________ ]                      |
|  Notes / Observations (optionnel)                           |
|  [______________________________________________]           |
|                                                             |
|  [ ANNULER ]                    [ ENREGISTRER (btn vert) ] |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**         | **Type**        | **Validation**                         | **Note**                                    |
|-----------------------|-----------------|----------------------------------------|---------------------------------------------|
| Scan code-barres      | Button + Camera | —                                      | Pré-remplit nom et DCI depuis base GS1      |
| Champ Nom             | Input text      | Requis, 2–150 chars                    | Autocomplétion depuis catalogue             |
| Champ DCI             | Input text      | Non requis                             | Suggestion auto selon nom saisi             |
| Catégorie             | Select          | Requis                                 | Sang / Médicaments / Vaccins / Matériel     |
| Zone stockage         | Select          | Requis                                 | Zones créées par Facility Manager           |
| Unité mesure          | Select          | Requis                                 | Unité / Dose / Flacon / Poche / Boîte       |
| Quantité ajoutée      | Input number    | Requis, > 0, entier                    | Incrémente le stock existant si ressource déjà enregistrée |
| Numéro de lot         | Input text      | Requis                                 | Format libre, unique par ressource          |
| Date d'expiration     | Date picker     | Requis, > aujourd'hui                  | Alerte si < 30 jours                        |
| Seuil d'alerte        | Input number    | Non requis, > 0                        | Hérité du catalogue si non défini           |
| Bouton Enregistrer    | Button primary  | Tous champs requis valides             | Désactivé sinon                             |

### États de l'écran

- **Défaut** : tous les champs vides sauf Catégorie (hérité du filtre actif)
- **Post-scan** : nom, DCI pré-remplis depuis GS1 — utilisateur confirme ou corrige
- **Ressource existante** : le système détecte le doublon et demande `'Cette ressource existe déjà — ajouter au stock existant ?'`
- **Succès** : toast vert + redirect vers SCR-009 de la ressource créée/modifiée
- **Erreur date passée** : champ rouge `'La date d'expiration doit être dans le futur'`

### Appels API

**POST /api/inventory** — *Créer une nouvelle ressource ou ajouter un lot*
```
Body:    { name, dci?, categoryId, zoneId, unitOfMeasure, quantity, batchNumber, expiryDate, supplierId?, alertThreshold?, location?, notes? }
Succès:  { resource: Resource, created: boolean, message }
Erreurs: 409 ERR_CONFLICT (lot dupliqué) | 422 ERR_BUSINESS (date passée)
```

**PUT /api/inventory/:id** — *Modifier une ressource existante*
```
Body:    Champs modifiés (partial update)
Succès:  { resource: Resource }
```

### Règles Métier

1. Si la ressource existe déjà (même nom + DCI + facilityId), le système propose d'incrémenter le stock plutôt que de créer un doublon
2. Une entrée de mouvement `+{quantité}` est automatiquement créée dans l'historique à chaque ajout
3. Le seuil d'alerte est hérité du catalogue global si non défini — modifiable localement
4. Les transactions d'écriture sur le stock passent par Aurora DSQL avec une transaction ACID pour éviter les race conditions

---

**SCR-011** — **Import Ressources CSV** | Module: INVENTAIRE | **Facility Manager+**

### Composants

| **Composant**         | **Type**       | **Description**                                                    |
|-----------------------|----------------|--------------------------------------------------------------------|
| Zone de drop CSV      | File dropzone  | CSV max 5MB, drag & drop ou clic pour sélectionner                |
| Bouton télécharger template | Button  | Télécharge template.csv avec colonnes pré-formatées               |
| Prévisualisation data | Table          | 5 premières lignes après parsing côté client                      |
| Colonne mapping       | Select/ligne   | Associer colonnes CSV aux champs système (auto-détection)         |
| Rapport de validation | List           | Lignes avec erreurs listées avant import (ligne N : raison)       |
| Bouton Importer       | Button primary | Lance import — désactivé si erreurs bloquantes détectées          |
| Barre de progression  | Progress bar   | Visible pendant traitement batch                                   |

### Appels API

**POST /api/inventory/import** — *Import batch depuis CSV*
```
Body:    multipart/form-data: { file, facilityId, dryRun: boolean }
Succès:  { imported, skipped, errors: [{ row, field, message }] }
```

### Règles Métier

1. L'import s'effectue en deux passes : d'abord `dryRun=true` pour valider sans écrire, puis `dryRun=false` pour confirmer
2. Les lignes avec erreurs sont ignorées — les lignes valides sont importées
3. Maximum 1000 lignes par import ; au-delà, le fichier est rejeté avec message explicite

---

**SCR-012** — **Alertes Stock Bas** | Module: INVENTAIRE | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Inventaire    ALERTES STOCK BAS        [ 🔔 Configurer ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  12 ressources en dessous du seuil d'alerte                |
|                                                             |
|  CRITIQUES (4)                                              |
|  ┌────────────────────────────────────────────────────┐    |
|  │ 🔴 Sang O-       4 / seuil 10    DISPONIBLE: 18km  │    |
|  │    → Clinique St-Luc: 18 poches  [ Demander ]      │    |
|  │ 🔴 Adrénaline    8 / seuil 20    DISPONIBLE: 12km  │    |
|  │    → CBCA Goma: 35 amp.          [ Demander ]      │    |
|  └────────────────────────────────────────────────────┘    |
|                                                             |
|  FAIBLES (8)                                                |
|  [ Liste condensée avec actions inline ]                   |
|                                                             |
|  [ 📣 Broadcast urgence régionale ]                        |
+─────────────────────────────────────────────────────────────+
```

**GET /api/inventory/low-stock** — *Ressources sous seuil*
```
Query:   facilityId, severity?: 'critical'|'low'
Réponse: { resources: [Resource & { nearbyAvailability: Facility[] }] }
```

---

**SCR-013** — **Suivi des Expirations** | Module: INVENTAIRE | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Inventaire    SUIVI EXPIRATIONS       [ Exporter liste ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Horizon: [ 7 jours ▼ ]  [ 30 jours ]  [ 90 jours ]       |
|                                                             |
|  7 ressources expirent dans moins de 7 jours               |
|                                                             |
|  RESSOURCE           LOT         QTÉ   EXPIRE    ACTION    |
|  Vaccin VPO dose    LOT-V229    45    12/06/26   [Redistrib]|
|  Poches Plasma AB   LOT-P118    8     14/06/26   [Redistrib]|
|  Chloroquine 250mg  LOT-C774    120   15/06/26   [Voir]    |
|                                                             |
|  [!] 3 ressources peuvent être redistribuées avant expir.  |
|  [ Créer broadcast de don d'urgence ]                      |
+─────────────────────────────────────────────────────────────+
```

**GET /api/inventory/expiring** — *Ressources proches de l'expiration*
```
Query:   facilityId, daysAhead=7
Réponse: { batches: [Batch & { resource, daysLeft }], redistributableCount }
```

---

**SCR-014** — **Catalogue de Catégories** | Module: INVENTAIRE | **Super Admin**

Écran de configuration des types de ressources au niveau plateforme. Permet de créer les catégories (Sang, Médicaments, Vaccins, Matériel, Autre), sous-catégories, et définir les attributs obligatoires par catégorie (ex: groupe sanguin pour Sang, DCI pour Médicaments).

**GET /api/catalog/categories** · **POST /api/catalog/categories** · **PUT /api/catalog/categories/:id** — *CRUD catégories*

---

# 4. MODULE FACILITIES (ÉTABLISSEMENTS)

---

**SCR-015** — **Carte des Établissements** | Module: FACILITIES | **NGO Coordinator+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     CARTE DES ÉTABLISSEMENTS    [≡ Vue liste ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Région: [ Kivu Nord ▼ ]  Ressource: [ Toutes ▼ ]         |
|  Statut:  [●] Critique [●] Avertissement [●] OK [●] Hors-ligne|
|                                                             |
| +──────────────────────────────────────────────────────+   |
| |                  [ CARTE MAPBOX ]                    |   |
| |   🔴 CS Masisi   (clic → tooltip)                   |   |
| |   🟠 HGR Goma                                        |   |
| |   ✅ Clinique CBCA                                   |   |
| |   ⚪ Hôpital Panzi  (hors-ligne)                    |   |
| |                                                      |   |
| | Tooltip au survol:                                   |   |
| | ┌──────────────────────────────┐                    |   |
| | │ CS Masisi · Masisi, NK       │                    |   |
| | │ 🔴 Critique : 3 pénuries     │                    |   |
| | │ Dernière sync: il y a 2h     │                    |   |
| | │ [ Voir détails ] [ Broadcast]│                    |   |
| | └──────────────────────────────┘                    |   |
| +──────────────────────────────────────────────────────+   |
|                                                             |
|  Légende: 🔴 Critique  🟠 Avertissement  ✅ OK  ⚪ Offline  |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**        | **Type**          | **Note**                                                        |
|----------------------|-------------------|-----------------------------------------------------------------|
| Filtres région       | Select            | Liste des régions de l'organisation                             |
| Filtre ressource     | Select            | Colore les pins selon dispo de CETTE ressource                  |
| Légende statuts      | Toggle checkboxes | Masque/affiche les pins selon statut                            |
| Carte Mapbox         | Map component     | Tiles Mapbox GL JS — coordonnées depuis `facilities.coordinates`|
| Pins colorés         | Map markers       | Couleur selon `facilityStatus` calculé en temps réel            |
| Tooltip survol       | Popover           | Chargé via GET /api/facilities/:id/summary au survol            |
| Bouton Vue liste     | Button outline    | Switch vers SCR-016                                             |

### Appels API

**GET /api/facilities/map** — *Coordonnées et statuts pour la carte*
```
Query:   orgId, regionIds[], resourceTypeId?
Réponse: { facilities: [{ id, name, lat, lng, status, lastSyncAt }] }
```

---

**SCR-016** — **Liste des Établissements** | Module: FACILITIES | **NGO Coordinator+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     ÉTABLISSEMENTS     [🗺 Vue carte] [+ Ajouter]|
+─────────────────────────────────────────────────────────────+
|                                                             |
|  🔍 [Rechercher établissement...]     [🔽 Filtres]          |
|     Type: [Tous ▼]   Région: [Tous ▼]   Statut: [Tous ▼]  |
|                                                             |
|  23 établissements · 2 hors-ligne                          |
|                                                             |
|  ÉTABLISSEMENT          TYPE     RÉGION      STATUT        |
|  🔴 CS Masisi           Clinique  Masisi     Critique       |
|  🔴 HGR Walikale        Hôpital  Walikale    Critique       |
|  🟠 Clinique Kiwanja    Clinique  Rutshuru   Avertissement  |
|  ✅ CBCA Goma           Hôpital  Goma        OK             |
|  ⚪ Hôpital Panzi       Hôpital  Bukavu      Hors-ligne     |
|  ...                                                        |
|                                                             |
|  [ < 1 2 > ]  25 par page                                  |
+─────────────────────────────────────────────────────────────+
```

**GET /api/facilities** — *Liste paginée des établissements*
```
Query:   orgId, type?, regionId?, status?, search?, page=1, limit=25
Réponse: { facilities: [Facility], total, criticalCount, offlineCount }
```

---

**SCR-017** — **Détail Établissement & Inventaire** | Module: FACILITIES | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Établissements    HÔPITAL GÉNÉRAL DE RÉFÉRENCE  [✏ Éditer]|
+─────────────────────────────────────────────────────────────+
|                                                             |
|  🏥 Hôpital Général de Référence de Goma                   |
|  Type: Hôpital de référence · Goma, Nord-Kivu, RDC         |
|  Coordinateur: Dr. Amara Diallo · +243 81X XXX XXX         |
|  Statut: ✅ En ligne · Dernière sync: il y a 4 min          |
|                                                             |
|  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        |
|  │ RESSOURCES   │ │ ALERTES      │ │ PERSONNEL    │        |
|  │  847 unités  │ │  12 actives  │ │  8 agents    │        |
|  └──────────────┘ └──────────────┘ └──────────────┘        |
|                                                             |
|  ── Inventaire actuel ───────────────────────────────────   |
|  [ Mini-tableau : Top 5 ressources critiques ]             |
|  [ Voir tout l'inventaire → ]                              |
|                                                             |
|  ── Informations ────────────────────────────────────────   |
|  Adresse: Avenue des Volcans 12, Goma, NK                  |
|  Coordonnées GPS: -1.6792° S, 29.2284° E                   |
|  Capacité lits: 280 · Capacité banque de sang: 50 poches   |
|  Zones de stockage: Pharmacie / Banque de Sang / Urgences  |
+─────────────────────────────────────────────────────────────+
```

**GET /api/facilities/:id** — *Détail complet d'un établissement*
```
Réponse: { facility: Facility, inventorySummary, activeAlerts, staffCount, zones[] }
```

---

**SCR-018** — **Ajouter / Modifier Établissement** | Module: FACILITIES | **Super Admin**

### Composants

| **Composant**         | **Type**       | **Validation**                   | **Note**                              |
|-----------------------|----------------|----------------------------------|---------------------------------------|
| Nom établissement     | Input text     | Requis, 3–150 chars              | Unique par organisation               |
| Type                  | Select         | Requis                           | Hôpital / Clinique / Centre de Santé / ONG / Dépôt |
| Pays / Région         | Select cascade | Requis                           | ISO pays → régions disponibles        |
| Adresse complète      | Textarea       | Requis                           | Adresse postale                       |
| Coordonnées GPS       | Input lat/lng  | Non requis                       | Ou picker sur carte                   |
| Picker GPS sur carte  | Map input      | —                                | Clic sur carte → remplit lat/lng      |
| Contact principal     | Input text     | Requis                           | Nom du coordinateur                   |
| Téléphone contact     | Input tel      | Requis                           | Validation format international       |
| Email contact         | Input email    | Non requis                       | Utilisé pour alertes automatiques     |
| Zones de stockage     | Tags input     | Non requis                       | Noms des zones (Pharmacie, Urgences…) |
| Capacité lits         | Input number   | Non requis                       | À titre indicatif                     |

**POST /api/facilities** · **PUT /api/facilities/:id** — *Créer/modifier un établissement*

---

**SCR-019** — **Gestion du Personnel** | Module: FACILITIES | **Facility Manager+**

Écran de gestion des agents (Field Agents) rattachés à un établissement. Permet d'inviter par email, assigner une zone, activer/désactiver l'accès, réinitialiser les mots de passe.

**GET /api/facilities/:id/staff** · **POST /api/facilities/:id/staff/invite** · **PUT /api/users/:id/status**

---

# 5. MODULE TRANSFERTS

---

**SCR-020** — **Nouvelle Demande de Transfert** | Module: TRANSFERTS | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Transferts     DEMANDER UN TRANSFERT                     |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Type de demande:                                           |
|  [●] Demande standard   [○] Urgence médicale (< 2h)        |
|                                                             |
|  Ressource demandée *                                       |
|  🔍 [Rechercher ressource...     ]                          |
|  → Suggestion: Poches Sang O- (stock critique : 4)         |
|                                                             |
|  Quantité demandée *    Motif *                             |
|  [ _______ ]            [ Urgence chirurgicale ▼ ]         |
|                                                             |
|  Établissement source souhaité                              |
|  [●] Rechercher automatiquement (recommandé)               |
|  [○] Sélectionner manuellement                             |
|                                                             |
|  Date de besoin *       Priorité *                          |
|  [ JJ/MM/AAAA HH:MM ]  [ HAUTE ▼ ]                        |
|                                                             |
|  Notes pour le transporteur (optionnel)                     |
|  [ Transport frigorifique requis · Fragile ]                |
|                                                             |
|  Établissements disponibles trouvés:                        |
|  ┌──────────────────────────────────────────────────────┐  |
|  │ ✅ Clinique St-Luc    12 km  ·  18 poches  ·  ⚡ 1h  │  |
|  │ ✅ HGR Panzi          34 km  ·   7 poches  ·  ⚡ 2h  │  |
|  └──────────────────────────────────────────────────────┘  |
|                                                             |
|  [ ANNULER ]              [ SOUMETTRE LA DEMANDE (vert) ]  |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**               | **Type**        | **Validation**                    | **Note**                                          |
|-----------------------------|-----------------|-----------------------------------|---------------------------------------------------|
| Toggle Standard / Urgence   | Radio buttons   | Requis                            | Urgence = alertes immédiates + délai SLA 2h       |
| Recherche ressource         | Autocomplete    | Requis                            | Recherche sur catalogue + inventaire critique     |
| Quantité demandée           | Input number    | Requis, > 0                       | Validation vs. disponibilité des sources          |
| Motif                       | Select          | Requis                            | Urgence chirurgicale / Pénurie planifiée / Don / Autre |
| Mode sélection source       | Radio           | —                                 | Auto = algo VitalGrid / Manuel = SCR-021          |
| Date de besoin              | Datetime picker | Requis, ≥ maintenant              | Urgence = maintenant + 2h auto-remplie            |
| Priorité                    | Select          | Requis                            | BASSE / NORMALE / HAUTE / CRITIQUE                |
| Notes transporteur          | Textarea        | Non requis                        | Max 300 chars                                     |
| Liste sources disponibles   | List sélective  | —                                 | Chargée après saisie ressource+quantité           |
| Bouton Soumettre            | Button primary  | Tous champs requis valides        | Déclenche transaction DSQL atomique               |

### États de l'écran

- **Défaut** : formulaire vide, mode Standard sélectionné
- **Pré-rempli** (depuis SCR-009 ou SCR-012) : ressource et quantité suggérées pré-remplies
- **Mode Urgence** : bannière rouge en tête `'⚡ Mode urgence activé — SLA 2h — Notification immédiate envoyée au coordinateur'`
- **Chargement sources** : skeleton loader pendant GET nearby
- **Aucune source** : `'Aucun établissement ne dispose de cette ressource à moins de 100 km'` + bouton `'Diffuser un appel d'urgence régional'`
- **Succès** : modale de confirmation avec numéro de transfert + redirect vers SCR-023

### Appels API

**GET /api/transfers/available-sources** — *Trouver sources disponibles*
```
Query:   resourceTypeId, quantity, facilityId (demandeur), radiusKm=100
Réponse: { sources: [{ facilityId, name, distance, availableQty, estimatedETA }] }
```

**POST /api/transfers** — *Créer une demande de transfert (transaction ACID DSQL)*
```
Body:    { resourceTypeId, quantity, requestingFacilityId, sourceFacilityId?, motif, priority, neededBy, isEmergency, notes? }
Succès:  { transfer: Transfer, ref: "TRF-XXXX", message }
Erreurs: 409 ERR_RESOURCE_UNAVAILABLE | 422 ERR_BUSINESS | 503 ERR_DSQL_TIMEOUT
```

### Règles Métier — CRITIQUES

1. **Transaction ACID Aurora DSQL** : la création d'un transfert décrémente atomiquement le stock source et crée le transfert. Si la ressource a été prise entre la consultation et la soumission, la transaction échoue avec `409 ERR_RESOURCE_UNAVAILABLE` — afficher `'La ressource n'est plus disponible en quantité suffisante — actualisation en cours'`
2. Les demandes `isEmergency=true` déclenchent immédiatement une notification push + SMS au Facility Manager source
3. Le système sélectionne la source optimale par algo : (score = 0.6×disponibilité + 0.3×proximité + 0.1×histórico_fiabilité)
4. Un transfert en attente de plus de 4h sans réponse de la source déclenche une alerte automatique au NGO Coordinator

---

**SCR-021** — **Ressources Disponibles à Proximité** | Module: TRANSFERTS | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Transfert     DISPONIBILITÉ À PROXIMITÉ                  |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Rayon de recherche: [ 25km ] [ 50km ] [●100km] [ 200km ]  |
|  Ressource: [ Poches Sang O- ▼ ]   Quantité min: [ 5 ]    |
|                                                             |
|  10 sources trouvées dans un rayon de 100 km               |
|                                                             |
|  ÉTABLISSEMENT       DIST.  STOCK   CONTACT        ACTION  |
|  Clinique St-Luc     12km   18 pch  +243 81X XXX  [Select] |
|  HGR Panzi           34km    7 pch  +243 99X XXX  [Select] |
|  CBCA Goma            8km    3 pch  Stock faible  [Select] |
|  ...                                                        |
|                                                             |
|  [ ← Retour à la demande ]                                 |
+─────────────────────────────────────────────────────────────+
```

**GET /api/transfers/available-sources** — *Même endpoint que SCR-020 mais vue dédiée*

---

**SCR-022** — **Liste des Transferts en Cours** | Module: TRANSFERTS | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     MES TRANSFERTS          [ + Nouveau ]      |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  [●] En cours (5)   [○] En attente (2)   [○] Complétés     |
|                                                             |
|  EN COURS                                                   |
|  ┌─────────────────────────────────────────────────────┐   |
|  │ #TRF-2847 · Sang O- ×5 · DE: St-Luc → VERS: HGR   │   |
|  │ 🚚 En transit · ETA: ~1h30 · ✅ Tracé en temps réel│   |
|  │ [ Voir détails ] [ Confirmer réception ]            │   |
|  │─────────────────────────────────────────────────────│   |
|  │ #TRF-2851 · Amoxil 500mg ×100 · HGR → CBCA Goma   │   |
|  │ ✅ Livré · Attente confirmation réception            │   |
|  │ [ Confirmer réception ]                             │   |
|  └─────────────────────────────────────────────────────┘   |
|                                                             |
|  EN ATTENTE DE CONFIRMATION SOURCE                         |
|  #TRF-2855 · Quinine inj. ×50 · Créé il y a 2h · ⏳      |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/transfers** — *Liste des transferts par facility*
```
Query:   facilityId, status?: 'pending'|'in_transit'|'delivered'|'completed', page=1
Réponse: { transfers: [Transfer], total, byStatus: { pending, inTransit, delivered } }
```

---

**SCR-023** — **Détail & Suivi d'un Transfert** | Module: TRANSFERTS | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Transferts    TRANSFERT #TRF-2847        [ ⬆ Partager ]  |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  🩸 Poches Sang O- Négatif · 5 unités                      |
|  Priorité: HAUTE · Urgence médicale                         |
|                                                             |
|  Statut actuel: 🚚 EN TRANSIT                              |
|                                                             |
|  ── Chronologie du transfert ─────────────────────────────  |
|  ✅ 09/06 11:00  Demande créée          HGR Goma            |
|  ✅ 09/06 11:05  Confirmée par source   Clinique St-Luc     |
|  ✅ 09/06 12:30  Préparée & expédiée    Clinique St-Luc     |
|  🔄 09/06 13:15  En transit             Chauffeur Kabila M. |
|  ○  09/06 14:30  Arrivée prévue         HGR Goma (ETA)      |
|                                                             |
|  ── Détails logistiques ─────────────────────────────────   |
|  Source:       Clinique St-Luc · Dr. Benoit M.             |
|  Destination:  HGR Goma · Dr. Amara Diallo                 |
|  Transporteur: Kabila Mutombo · +243 81X XXX XXX           |
|  Véhicule:     Ambulance VIT-0042 · Toyota HiAce           |
|  Temp. cargo:  3.2°C ✅ (requis 2-6°C)  [Voir historique]  |
|                                                             |
|  ── Chaîne de traçabilité ────────────────────────────────  |
|  Lot: BT-4429 · Expire: 12/07/2026 · Conforme OMS ✅       |
|                                                             |
|  [ CONFIRMER RÉCEPTION →  SCR-024 ]                        |
+─────────────────────────────────────────────────────────────+
```

### Composants de l'écran

| **Composant**           | **Type**          | **Note**                                                      |
|-------------------------|-------------------|---------------------------------------------------------------|
| Header ressource        | Info statique     | Nom, quantité, priorité, type d'urgence                       |
| Badge statut            | Badge dynamique   | Mis à jour via WebSocket                                      |
| Timeline chronologie    | Timeline          | Étapes avec timestamp, acteur, statut (complété/actif/futur)  |
| Détails logistiques     | Info card         | Contacts cliquables (tel:// lien)                             |
| Monitoring temp. cargo  | Metric inline     | Données DynamoDB (IoT capteurs) si disponibles                |
| Lien historique temp.   | Link              | → SCR-028 filtré sur ce shipmentId                           |
| Traçabilité lot         | Info row          | N° lot + date expiration + certification                      |
| Bouton Confirmer        | Button primary    | Visible uniquement si statut = 'delivered' ET facility = dest.|

### Appels API

**GET /api/transfers/:id** — *Détail complet d'un transfert*
```
Réponse: { transfer: Transfer, timeline: Event[], logistics, traceability, temperatureStatus? }
```

**GET /api/transfers/:id/temperature** — *Données IoT température (DynamoDB)*
```
Réponse: { readings: [{ timestamp, celsius, deviceId }], min, max, alerts }
```

---

**SCR-024** — **Confirmation de Réception** | Module: TRANSFERTS | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Transfert #TRF-2847    CONFIRMER RÉCEPTION                |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Vous êtes sur le point de confirmer la réception de :     |
|                                                             |
|  🩸 Poches Sang O- Négatif                                  |
|  Quantité prévue : 5 unités                                 |
|  Lot : BT-4429 · Expire : 12/07/2026                       |
|                                                             |
|  ── Vérification à la réception ─────────────────────────   |
|  Quantité réellement reçue *  Conformité emballage *        |
|  [ 5 ]                        [●] Conforme  [○] Problème   |
|                                                             |
|  Température à l'ouverture   État général                   |
|  [ 3.8 ] °C                  [●] Bon  [○] Acceptable [○]❌  |
|                                                             |
|  [ 📷 Prendre photo de réception (optionnel) ]              |
|                                                             |
|  Observations (si problème constaté)                        |
|  [____________________________________________]             |
|                                                             |
|  Signature électronique                                     |
|  [ Signer avec mon code PIN : _ _ _ _ ]                    |
|                                                             |
|  [ ANNULER ]         [ ✅ CONFIRMER RÉCEPTION (vert) ]     |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**POST /api/transfers/:id/confirm-receipt** — *Confirmer réception avec transaction ACID*
```
Body:    { receivedQty, packagingOk: boolean, temperatureAtOpening?, condition, photo?, notes?, pinSignature }
Succès:  { transfer: Transfer, stockUpdated: true, inventoryEntry: InventoryMovement }
Erreurs: 400 ERR_ALREADY_CONFIRMED | 422 ERR_QTY_MISMATCH
```

### Règles Métier

1. La confirmation incrémente atomiquement le stock de la facility destinataire dans Aurora DSQL
2. Si `receivedQty < transfer.quantity` : écart enregistré, alerte envoyée aux deux Facility Managers
3. Si `condition = 'bad'` : transfert marqué `'incident'`, rapport automatique créé pour le Super Admin
4. La signature PIN est obligatoire — correspond au PIN 4 chiffres de l'agent défini dans son profil
5. La photo est uploadée sur S3 et liée au transfert pour traçabilité

---

**SCR-025** — **Historique des Transferts** | Module: TRANSFERTS | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Transferts    HISTORIQUE                   [ Exporter ⬇ ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Période: [●] 7j  [○] 30j  [○] 90j  [○] Personnalisée      |
|  Type:    [Reçus ▼]   Statut: [Tous ▼]   Ressource: [Tous ▼]|
|                                                             |
|  47 transferts · 45 complétés · 1 incident · 1 annulé       |
|                                                             |
|  DATE      REF.     RESSOURCE          QTÉ  SOURCE   STATUT |
|  09/06/26  TRF-2847 Sang O-             5   St-Luc   ✅     |
|  07/06/26  TRF-2831 Amoxil 500mg      100  HGR       ✅     |
|  05/06/26  TRF-2819 Quinine inj.       50  CBCA      ⚠ Inc |
|  ...                                                        |
|                                                             |
|  [ < 1 2 3 > ]                                              |
+─────────────────────────────────────────────────────────────+
```

**GET /api/transfers/history** — *Historique paginé*
```
Query:   facilityId, direction?: 'in'|'out', status?, resourceTypeId?, dateFrom, dateTo, page, limit
Réponse: { transfers: [Transfer], total, byStatus: { completed, incident, cancelled } }
```

---

**SCR-026** — **Broadcast d'Urgence Régionale** | Module: TRANSFERTS | **NGO Coordinator+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     BROADCAST D'URGENCE RÉGIONALE              |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  ⚠ Cet appel sera envoyé à TOUS les établissements         |
|  de la région sélectionnée                                  |
|                                                             |
|  Ressource en pénurie *    Établissement demandeur *        |
|  [ Sang O- ▼ ]             [ CS Masisi ▼ ]                 |
|  Quantité minimale *       Région de diffusion *            |
|  [ 10 ]                    [ Kivu Nord ▼ ]                 |
|  Délai de réponse souhaité  Message d'urgence               |
|  [ 2 heures ▼ ]            [_______________________________]|
|                                                             |
|  Établissements qui recevront le broadcast : 18             |
|  Canaux: ✅ App Push  ✅ Email  ✅ SMS (si configuré)       |
|                                                             |
|  [ ANNULER ]      [ 📣 ENVOYER LE BROADCAST (rouge) ]      |
+─────────────────────────────────────────────────────────────+
```

**POST /api/broadcasts** — *Envoyer un broadcast d'urgence*
```
Body:    { resourceTypeId, requestingFacilityId, minQty, regionId, responseDeadline, message }
Succès:  { broadcast: Broadcast, recipientCount, channels: ['push','email','sms'] }
```

### Règles Métier

1. Le broadcast est enregistré dans Aurora DSQL — toutes les réponses y sont associées
2. Chaque établissement qui dispose de la ressource reçoit une notification avec lien pour confirmer disponibilité
3. Les réponses positives créent automatiquement des demandes de transfert pré-remplies

---

# 6. MODULE ALERTES & MONITORING

---

**SCR-027** — **Centre d'Alertes** | Module: ALERTES | **Field Agent+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     ALERTES                     [⚙ Règles]      |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  3 alertes non lues · Mis à jour en temps réel             |
|                                                             |
|  [●] Toutes (12)  [○] Critiques (3)  [○] Avertissements(9) |
|                                                             |
|  ── Non lues ──────────────────────────────────────────────  |
|  🔴 NOUVEAU · 14:32 · Sang O- sous seuil critique (4/10)   |
|     Hôpital Général de Référence · Goma                    |
|     [ Voir ressource ] [ Demander transfert ] [ ✓ Lu ]     |
|                                                             |
|  🔴 NOUVEAU · 12:15 · Température chute : 1.2°C (lot C77)  |
|     Conteneur vaccins · Transit TRF-2839                    |
|     [ Voir chaîne du froid ] [ Alerter transporteur ]      |
|                                                             |
|  🟠 NOUVEAU · 09:44 · Adrénaline expire dans 8 jours        |
|     LOT-A293 · 32 unités · Banque de Sang · Goma           |
|     [ Voir expiration ] [ Redistribuer ]                    |
|                                                             |
|  ── Lues ─────────────────────────────────────────────────   |
|  [ Afficher les 9 alertes lues ]                            |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/alerts** — *Liste des alertes de la facility*
```
Query:   facilityId, read?: boolean, severity?: 'critical'|'warning', page=1
Réponse: { alerts: [Alert], unreadCount, bySeverity: { critical, warning } }
```

**PATCH /api/alerts/:id/read** — *Marquer une alerte comme lue*
```
Body:    {} · Succès: { alert: Alert }
```

**WebSocket** `ws://api/facility/{facilityId}/alerts` — *Alertes temps réel*
```
Events: { type: 'NEW_ALERT', alert: Alert } | { type: 'ALERT_RESOLVED', alertId }
```

---

**SCR-028** — **Dashboard IoT Chaîne du Froid** | Module: ALERTES | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Alertes     CHAÎNE DU FROID — MONITORING                 |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Transfert: [ TRF-2839 ▼ ]  ·  Vaccins VPO · 200 doses    |
|  Capteur: IoT-Sensor-C77 · Dernière lecture: il y a 2 min  |
|                                                             |
|  ┌────────────────────────────────────────────────────┐    |
|  │          TEMPÉRATURE ACTUELLE                      │    |
|  │                                                     │    |
|  │    🌡 2.4°C   ✅ Zone acceptable (2-8°C)            │    |
|  │                                                     │    |
|  │  [Graphique ligne — 24 dernières heures]            │    |
|  │   Min: 1.8°C  Max: 5.2°C  Moy: 3.1°C              │    |
|  └────────────────────────────────────────────────────┘    |
|                                                             |
|  ── Événements de la chaîne du froid ─────────────────────  |
|  ✅ 13:45  Temp normale        4.1°C  OK                   |
|  ⚠ 11:22  Alerte chaleur       7.8°C  Durée: 4 min        |
|  ✅ 11:26  Retour zone normale  6.2°C  Résolu              |
|  ✅ 09:15  Départ congelateur  3.8°C  OK                   |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/cold-chain/:transferId** — *Données IoT depuis DynamoDB*
```
Réponse: { latestReading, readings24h: [{ timestamp, celsius }], stats: { min, max, avg }, events: [ColdChainEvent] }
```

### Note Architecture

Les données de température sont écrites par les capteurs IoT dans **DynamoDB** (table `cold_chain_events`, clé de partition = `transferId`, clé de tri = `timestamp`). La lecture pour l'affichage utilise une requête DynamoDB sur le range de clés de tri (dernières 24h). Les seuils et alertes sont évalués en temps réel par une Lambda function déclenchée par DynamoDB Streams.

---

**SCR-029** — **Créer une Règle d'Alerte** | Module: ALERTES | **Facility Manager+**

### Composants

| **Composant**         | **Type**       | **Description**                                               |
|-----------------------|----------------|---------------------------------------------------------------|
| Ressource cible       | Autocomplete   | Ressource ou catégorie entière                                |
| Type de règle         | Select         | Stock bas / Expiration proche / Température / Inactivité sync |
| Seuil numérique       | Input number   | Quantité, jours avant expiration, ou °C selon type           |
| Sévérité              | Radio          | Avertissement / Critique                                      |
| Canaux notification   | Checkboxes     | App push / Email / SMS / Webhook                              |
| Répétition            | Select         | Une fois / Chaque heure / Quotidien                           |
| Activer / Désactiver  | Toggle         | —                                                             |

**POST /api/alerts/rules** — *Créer une règle d'alerte*
```
Body:    { resourceId?, categoryId?, ruleType, threshold, severity, channels[], repeatInterval, facilityId }
```

---

**SCR-030** — **Préférences de Notifications** | Module: ALERTES | **Field Agent+**

Écran de configuration personnelle : quels types d'alertes recevoir, sur quels canaux (push, email, SMS), à quelles heures. Les Field Agents ne reçoivent que les alertes de leur zone par défaut.

---

**SCR-031** — **Historique des Alertes** | Module: ALERTES | **Auditor+**

Liste paginée et filtrable de toutes les alertes générées par la plateforme sur une période donnée. Colonnes : date, type, ressource, établissement, sévérité, statut (résolue/active), délai de résolution. Exportable CSV pour audit externe.

---

# 7. MODULE ANALYTICS & PRÉDICTIONS

---

**SCR-032** — **Carte Régionale des Stocks** | Module: ANALYTICS | **NGO Coordinator+**

```
+─────────────────────────────────────────────────────────────+
| ← Dashboard     CARTE RÉGIONALE DES STOCKS                 |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Ressource: [ Sang O- ▼ ]  Région: [ Kivu ▼ ]             |
|  Vue: [●] Carte chaleur  [○] Choroplèthe  [○] Clusters     |
|                                                             |
| +──────────────────────────────────────────────────────+   |
| |              [ CARTE MAPBOX GRANDE ]                 |   |
| |                                                      |   |
| |  Zones rouges = pénurie totale (0 unités)            |   |
| |  Zones orange = stock faible (< seuil)               |   |
| |  Zones vertes = stock suffisant                      |   |
| |                                                      |   |
| |  Cercles proportionnels à la quantité disponible     |   |
| +──────────────────────────────────────────────────────+   |
|                                                             |
|  ── Résumé régional ─────────────────────────────────────   |
|  Total Sang O- dans la région: 124 poches                  |
|  8 établissements en pénurie critique                       |
|  Dernier transfert inter-établissement: il y a 45 min      |
|                                                             |
|  [ Déclencher broadcast régional → SCR-026 ]               |
+─────────────────────────────────────────────────────────────+
```

**GET /api/analytics/regional-map** — *Données agrégées par région pour carte*
```
Query:   resourceTypeId, regionIds[], granularity: 'facility'|'zone'
Réponse: { facilities: [{ id, lat, lng, stock, status }], regionalTotal, criticalCount }
```

---

**SCR-033** — **Prévision de la Demande** | Module: ANALYTICS | **Facility Manager+**

```
+─────────────────────────────────────────────────────────────+
| ← Analytics    PRÉVISION DE LA DEMANDE                     |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Ressource: [ Sang O- ▼ ]  Horizon: [ 30 jours ▼ ]        |
|                                                             |
|  ── Prévision basée sur historique 6 mois ────────────────  |
|  +──────────────────────────────────────────────────────+  |
|  |  [Graphique ligne — stock actuel + consommation prev] |  |
|  |  Ligne bleue: Stock actuel (4 unités)                 |  |
|  |  Ligne verte: Prévision stock si aucun réapprovo.     |  |
|  |  Zone rouge: Rupture prévue le 12/06 (J+3)           |  |
|  +──────────────────────────────────────────────────────+  |
|                                                             |
|  🔴 RUPTURE PRÉVUE dans 3 jours (12 juin 2026)            |
|                                                             |
|  Quantité recommandée à commander : 15 poches              |
|  Basé sur : consommation moy. 1.8/jour · seuil sécurité 10 |
|                                                             |
|  [ 📋 Générer bon de commande ]  [ 🔄 Demander transfert ] |
+─────────────────────────────────────────────────────────────+
```

**GET /api/analytics/forecast** — *Prévision de consommation*
```
Query:   resourceTypeId, facilityId, horizonDays=30
Réponse: { currentStock, dailyAvgConsumption, projectedStockout, projectedStockoutDate, recommendedOrderQty, dataPoints: [{ date, projectedStock }] }
```

---

**SCR-034** — **Rapport Risques d'Expiration** | Module: ANALYTICS | **Facility Manager+**

Tableau complet de toutes les ressources avec dates d'expiration, quantités à risque, valeur estimée à perte, et recommandations de redistribution. Exportable PDF et CSV.

**GET /api/analytics/expiry-risk** — *Ressources à risque d'expiration avec valeur estimée*
```
Query:   facilityId, daysAhead=90
Réponse: { batches: [Batch & { estimatedLoss }], totalEstimatedLoss, redistributable }
```

---

**SCR-035** — **Rapport Efficacité des Transferts** | Module: ANALYTICS | **Auditor+**

```
+─────────────────────────────────────────────────────────────+
| ← Analytics    EFFICACITÉ DES TRANSFERTS    [ Exporter ⬇ ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Période: [ Juin 2026 ▼ ]  Scope: [ Toute organisation ▼ ] |
|                                                             |
|  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      |
|  │ TOTAL    │ │ TAUX     │ │ DÉLAI    │ │ INCIDENTS│      |
|  │ 156      │ │ SUCCÈS   │ │ MOYEN    │ │    3     │      |
|  │transferts│ │  96.2%   │ │  4.2h   │ │  1.9%   │      |
|  └──────────┘ └──────────┘ └──────────┘ └──────────┘      |
|                                                             |
|  ── Top ressources transférées ──────────────────────────   |
|  Sang O-             28 transferts  Taux succès: 100%      |
|  Amoxicilline 500mg  19 transferts  Taux succès: 94.7%     |
|  Quinine inj.        14 transferts  Taux succès: 92.9% ⚠  |
|                                                             |
|  ── Carte des flux de transferts (OD matrix) ────────────   |
|  [ Carte avec arcs entre établissements source/dest ]      |
+─────────────────────────────────────────────────────────────+
```

**GET /api/analytics/transfer-efficiency** — *KPIs efficacité transferts*
```
Query:   orgId, period: 'week'|'month'|'quarter', facilityId?
Réponse: { total, successRate, avgDelayHours, incidentRate, byResource[], odMatrix[][] }
```

---

**SCR-036** — **Export & Rapport API** | Module: ANALYTICS | **Auditor+**

Écran permettant de générer des exports sur mesure (CSV, PDF, JSON) avec sélection des dimensions, métriques, période, et granularité. Inclut la documentation des endpoints API REST disponibles pour les consommateurs programmatiques.

**POST /api/analytics/export** — *Générer export*
```
Body:    { format: 'csv'|'pdf'|'json', reportType, dateFrom, dateTo, facilityIds[], resourceTypeIds[] }
Succès:  { downloadUrl, expiresAt }
```

---

# 8. MODULE ADMINISTRATION

---

**SCR-037** — **Gestion des Utilisateurs** | Module: ADMIN | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
| ← Admin     UTILISATEURS             [ + Inviter ]          |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  🔍 [Rechercher utilisateur...]  Rôle: [Tous ▼]  Org:[Tous▼]|
|                                                             |
|  1847 utilisateurs · 12 invitations en attente              |
|                                                             |
|  NOM           EMAIL              RÔLE          STATUT     |
|  Amara Diallo  a.diallo@hgr.cd    Facility Mgr  ✅ Actif   |
|  Muteba Luc    m.luc@hgr.cd       Field Agent   ✅ Actif   |
|  Sarah Kizito  s.k@unicef.org     NGO Coord.    ✅ Actif   |
|  [invitation]  j.b@cbca.cd        Facility Mgr  ⏳ En att. |
|  ...                                                        |
|                                                             |
|  [Modifier] [Désactiver] [Réinitialiser MDP]  par ligne     |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/admin/users** — *Liste paginée utilisateurs*
```
Query:   orgId?, role?, status?, search?, page=1
Réponse: { users: [User], total, pendingInvitations }
```

**POST /api/admin/users/invite** — *Inviter un nouvel utilisateur*
```
Body:    { email, role, facilityId?, orgId, message? }
Succès:  { invitation: Invitation, emailSent: true }
```

**PATCH /api/admin/users/:id/status** — *Activer / Désactiver un compte*
```
Body:    { status: 'active'|'disabled' }
```

---

**SCR-038** — **Rôles & Permissions** | Module: ADMIN | **Super Admin**

Matrice des permissions par rôle. Chaque ligne = une ressource système (Inventory, Transfers, Alerts…), chaque colonne = un rôle. Cases cochables pour accorder/révoquer : Lire / Écrire / Supprimer / Exporter. Modifications enregistrées en temps réel avec confirmation avant validation.

---

**SCR-039** — **Paramètres de l'Organisation** | Module: ADMIN | **Super Admin**

Informations générales (nom, logo, type, pays), paramètres régionaux (fuseau horaire, devise pour valorisation des pertes, langues d'interface disponibles), paramètres de sécurité (politique MDP, durée session, SSO SAML), paramètres de notification (canaux activés, fréquence digest emails).

**GET /api/organizations/:id** · **PUT /api/organizations/:id** — *Lire/modifier paramètres organisation*

---

**SCR-040** — **Clés API & Intégrations** | Module: ADMIN | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
| ← Admin     CLÉS API & INTÉGRATIONS    [ + Créer clé ]     |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  3 clés API actives                                         |
|                                                             |
|  NOM               SCOPE         CRÉÉE       DERNIÈRE UTIL  |
|  HMIS Integration  read:all       01/01/26    il y a 2h     |
|  Tableau de bord   read:analytics 15/03/26    il y a 5j     |
|  IoT Gateway       write:sensors  10/05/26    il y a 4min   |
|                                                             |
|  [Voir clé] [Révoquer]  par ligne                           |
|                                                             |
|  ── Webhooks ────────────────────────────────────────────   |
|  URL de callback: [________________________]               |
|  Événements: ☑ Alerte critique  ☑ Transfert confirmé        |
|              ☑ Stock critique   ☐ Activité normale           |
|                                                             |
|  ── Intégrations disponibles ────────────────────────────   |
|  [ DHIS2 ]  [ OpenMRS ]  [ ERP SAP ]  [ Slack ]  [ +... ]  |
+─────────────────────────────────────────────────────────────+
```

### Appels API

**GET /api/admin/api-keys** · **POST /api/admin/api-keys** · **DELETE /api/admin/api-keys/:id**

```
POST Body:  { name, scopes: ['read:inventory'|'write:inventory'|'read:analytics'|'write:sensors'|'read:all'], expiresAt? }
Succès:     { apiKey: string (affiché une seule fois) }
```

### Règles Métier

1. La clé API n'est affichée qu'une seule fois à la création — stockée en hash côté serveur
2. Chaque requête API consommatrice est loggée dans Aurora DSQL (timestamp, endpoint, apiKeyId)
3. Rate limiting : 1000 req/heure par clé par défaut — configurable

---

**SCR-041** — **Journal d'Audit** | Module: ADMIN | **Auditor+**

```
+─────────────────────────────────────────────────────────────+
| ← Admin     JOURNAL D'AUDIT                  [ Exporter ⬇ ] |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  Filtres: Période [30 jours ▼]  Type [Tous ▼]  User [Tous▼]|
|                                                             |
|  HORODATAGE   UTILISATEUR     ACTION                  RÉSULTAT |
|  09/06 14:32  Muteba L.       Ajout stock Sang O- ×5  ✅   |
|  09/06 14:15  Amara D.        Confirm. transfert #2847 ✅  |
|  09/06 13:45  s.k@unicef.org  Broadcast urgence Masisi ✅  |
|  09/06 13:30  [API:HMIS]      GET /inventory (read)    ✅   |
|  09/06 12:00  admin@vg.io     Désactivation user J.B.  ✅   |
|  ...                                                        |
|                                                             |
|  Le journal d'audit est immuable — aucune entrée ne peut   |
|  être modifiée ou supprimée (Aurora DSQL append-only table) |
+─────────────────────────────────────────────────────────────+
```

**GET /api/admin/audit-log** — *Journal immuable des actions*
```
Query:   orgId, userId?, actionType?, dateFrom, dateTo, page=1, limit=50
Réponse: { entries: [AuditEntry], total }
```

### Note Architecture

La table `audit_log` dans Aurora DSQL est configurée avec une policy d'accès `INSERT-only` via le rôle applicatif. Aucun `UPDATE` ou `DELETE` n'est accordé même au Super Admin. Cela garantit l'intégrité de l'audit trail pour conformité réglementaire (OMS, UNICEF, bailleurs de fonds).

---

**SCR-042** — **Centre d'Import de Données** | Module: ADMIN | **Super Admin**

Écran centralisé pour les imports bulk : organisations, établissements, utilisateurs, catalogue de ressources. Même workflow que SCR-011 (dry run → prévisualisation → confirmation) mais à l'échelle plateforme. Supporte CSV, JSON et formats spécifiques DHIS2.

---

**SCR-043** — **Facturation & Abonnement** | Module: ADMIN | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
| ← Admin     FACTURATION & ABONNEMENT                       |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  UNICEF RDC — Plan: SaaS Enterprise (Abonnement annuel)    |
|  Renouvellement: 01/01/2027 · Statut: ✅ Actif             |
|                                                             |
|  ── Utilisation actuelle ────────────────────────────────   |
|  Établissements:  23 / ∞ (illimité)                        |
|  Utilisateurs:    89 / 200                                  |
|  Requêtes API:    98k / 500k /mois                         |
|  Stockage médias: 2.4 GB / 50 GB                           |
|                                                             |
|  ── Plan tarifaire ─────────────────────────────────────   |
|  Freemium (ONG locales)   Gratuit · ≤5 facilities · ≤20 users|
|  SaaS Standard            $199/mois · ≤50 facilities       |
|  SaaS Enterprise          Sur devis · Facilities illimitées |
|                                                             |
|  ── Factures ──────────────────────────────────────────────  |
|  Jan 2026  $2400.00  ✅  [ PDF ]                           |
|  Déc 2025  $2400.00  ✅  [ PDF ]                           |
+─────────────────────────────────────────────────────────────+
```

---

**SCR-044** — **Statut du Système** | Module: ADMIN | **Super Admin**

```
+─────────────────────────────────────────────────────────────+
| ← Admin     STATUT DU SYSTÈME                              |
+─────────────────────────────────────────────────────────────+
|                                                             |
|  ── Base de données ──────────────────────────────────────  |
|  Aurora DSQL (Primary)     ✅ Opérationnel   Latence: 4ms  |
|  DynamoDB (Events/IoT)     ✅ Opérationnel   Latence: 1ms  |
|  DynamoDB (Notifications)  ✅ Opérationnel   Latence: 0.8ms|
|                                                             |
|  ── Infrastructure ─────────────────────────────────────   |
|  Vercel Edge Network       ✅ Opérationnel   P95: 87ms     |
|  API Gateway               ✅ Opérationnel   Uptime: 99.98%|
|  WebSocket Server          ✅ Opérationnel   52 conn. live |
|  Storage S3 (médias)       ✅ Opérationnel   —             |
|                                                             |
|  ── Métriques 24h ──────────────────────────────────────   |
|  Requêtes API:  98,432     Erreurs 5xx:  3    (0.003%)     |
|  Transactions DSQL: 4,291  Conflits:     0    (0.00%)      |
|  Events DynamoDB: 128,741  Alertes IoT:  7                  |
|                                                             |
|  ── Logs système récents ────────────────────────────────   |
|  14:44 INFO  DSQL replication lag: 0ms (all regions)       |
|  14:30 INFO  DynamoDB WCU: 22% of provisioned              |
|  13:15 WARN  API rate limit triggered: key HMIS-001        |
+─────────────────────────────────────────────────────────────+
```

**GET /api/admin/system-status** — *Santé infrastructure*
```
Réponse: { dsql: { status, latencyMs }, dynamodb: { status, latencyMs }, vercel: { status, p95Ms, uptime }, metrics24h }
```

---

# 9. DESIGN SYSTEM

## 9.1 Palette de Couleurs

| **Couleur**             | **Hex**     | **Usage**                                                     |
|-------------------------|-------------|---------------------------------------------------------------|
| Vert primaire           | `#1D9E75`   | CTA principaux, statut OK, succès, boutons d'action           |
| Vert foncé (hover)      | `#0F6E56`   | État hover bouton primaire                                    |
| Vert clair (fond)       | `#E1F5EE`   | Fond badges succès, cards status OK, backgrounds              |
| Rouge critique          | `#B71C1C`   | Alertes critiques, stock nul, erreurs bloquantes, urgences    |
| Rouge clair (fond)      | `#FCEBEB`   | Fond cards critiques, badges erreur                           |
| Orange avertissement    | `#E65100`   | Stock faible, alertes modérées, avertissements non-bloquants  |
| Orange clair (fond)     | `#FAEEDA`   | Fond badges avertissement, banner offline                     |
| Jaune attention         | `#F59E0B`   | Expiration proche, attention requise                          |
| Bleu information        | `#185FA5`   | Transferts, info boxes, liens actifs, badges informatifs      |
| Bleu clair (fond)       | `#E6F1FB`   | Fond cards transfert, background info                         |
| Gris texte principal    | `#1A1A1A`   | Corps de texte, titres sombres                                |
| Gris texte secondaire   | `#5F5E5A`   | Labels, texte d'aide, métadonnées                             |
| Gris bordure            | `#D3D1C7`   | Bordures tableaux, séparateurs, inputs                        |
| Gris fond léger         | `#F5F5F5`   | Fond alternance lignes tableau, surfaces secondaires          |
| Blanc                   | `#FFFFFF`   | Fond principal des écrans, cards                              |

## 9.2 Typographie

| **Usage**                  | **Police**       | **Taille** | **Graisse** |
|----------------------------|------------------|------------|-------------|
| Corps de texte             | Inter / Roboto   | 14px       | Regular 400 |
| Labels formulaires         | Inter / Roboto   | 13px       | Medium 500  |
| Titres de section          | Inter / Roboto   | 18px       | SemiBold 600|
| Titres de page             | Inter / Roboto   | 22px       | Bold 700    |
| Métriques / Chiffres KPI   | Roboto Mono      | 28px       | Bold 700    |
| Codes de référence         | Roboto Mono      | 13px       | Regular 400 |
| Numéros de transfert       | Roboto Mono      | 14px       | Medium 500  |
| Minimum absolu WCAG AA     | —                | 14px       | Règle stricte|

## 9.3 Composants Réutilisables

### Badges de Statut Ressource

| **Statut**     | **Libellé**       | **Fond**    | **Texte**   | **Condition**                          |
|----------------|-------------------|-------------|-------------|----------------------------------------|
| Critique       | CRITIQUE          | `#FCEBEB`   | `#B71C1C`   | Quantité ≤ seuil                       |
| Faible         | FAIBLE            | `#FAEEDA`   | `#E65100`   | Quantité ≤ seuil × 1.5                 |
| Expire bientôt | EXPIRE J+N        | `#FEF3C7`   | `#F59E0B`   | Lot expirant dans ≤ 30 jours           |
| OK             | OK                | `#E1F5EE`   | `#1D9E75`   | Quantité > seuil × 1.5                 |
| Hors-ligne     | HORS-LIGNE        | `#F1EFE8`   | `#5F5E5A`   | Établissement sans sync depuis > 1h    |

### Badges de Statut Transfert

| **Statut**     | **Libellé**       | **Fond**    | **Texte**   |
|----------------|-------------------|-------------|-------------|
| En attente     | EN ATTENTE        | `#FAEEDA`   | `#E65100`   |
| Confirmé       | CONFIRMÉ          | `#E6F1FB`   | `#185FA5`   |
| En transit     | EN TRANSIT        | `#E6F1FB`   | `#185FA5`   |
| Livré          | LIVRÉ             | `#FEF3C7`   | `#F59E0B`   |
| Complété       | COMPLÉTÉ          | `#E1F5EE`   | `#1D9E75`   |
| Incident       | INCIDENT          | `#FCEBEB`   | `#B71C1C`   |
| Annulé         | ANNULÉ            | `#F1EFE8`   | `#5F5E5A`   |

### Toast Notifications

| **Type**       | **Couleur bord** | **Durée** | **Exemple**                                            |
|----------------|------------------|-----------|--------------------------------------------------------|
| Succès         | `#1D9E75`        | 3 sec     | `'Ressource ajoutée — stock mis à jour'`               |
| Erreur         | `#B71C1C`        | 8 sec     | `'Erreur réseau — action sauvegardée en file offline'` |
| Avertissement  | `#E65100`        | 5 sec     | `'Stock Sang O- critique — transfert recommandé'`      |
| Information    | `#185FA5`        | 4 sec     | `'Transfert #TRF-2847 confirmé par Clinique St-Luc'`  |
| Transaction    | `#185FA5`        | 4 sec     | `'Transaction DSQL validée — cohérence garantie'`      |

### Modale de Confirmation

- **Titre** : action précise (ex: `'Confirmer la réception de 5 poches O- ?'`)
- **Corps** : conséquences chiffrées + données affectées (ex: `'Le stock de votre facility sera incrémenté de 5 unités'`)
- **Boutons** : `[Annuler]` (secondaire, gris) | `[Confirmer]` (primaire, couleur selon gravité)
- **Actions irréversibles** (suppression, broadcast, révocation clé API) : champ input confirmation textuelle requis (`'Tapez CONFIRMER pour procéder'`)
- **Actions ACID DSQL** : spinner `'Transaction en cours — ne fermez pas cet onglet'` pendant POST

### Indicateur de Synchronisation

- **Position** : badge permanent dans la navbar (à droite du logo)
- **Synchro récente (< 5 min)** : badge vert `'✅ Synchro'` discret
- **Synchro > 30 min** : badge orange `'⚠ Sync il y a 47min'`
- **Hors-ligne détecté** : barre orange fixe 32px en haut de l'écran `'📡 Hors-ligne — X actions en attente de synchronisation'`
- **Reconnexion** : barre verte `'🔄 Synchronisation en cours...'` puis disparaît après 2 sec

### Empty States

Chaque liste / tableau dispose d'un état vide explicite :

| **Écran**                | **Illustration** | **Message**                                            | **Action suggérée**                  |
|--------------------------|------------------|--------------------------------------------------------|--------------------------------------|
| Inventaire vide          | Icône entrepôt   | `'Votre inventaire est vide'`                          | Bouton `'+ Ajouter une ressource'`   |
| Aucune alerte            | Icône bouclier   | `'Tous les stocks sont dans les seuils normaux ✅'`    | —                                    |
| Aucun transfert          | Icône carton     | `'Aucun transfert en cours'`                           | Bouton `'Créer une demande'`         |
| Aucun établissement      | Icône carte      | `'Aucun établissement configuré'`                      | Bouton `'+ Ajouter un établissement'`|
| Résultats recherche vide | Icône loupe      | `'Aucun résultat pour "{terme}"'`                      | Lien `'Réinitialiser les filtres'`   |

## 9.4 Règles Globales de Développement

| **Règle**                      | **Description**                                                                        |
|--------------------------------|----------------------------------------------------------------------------------------|
| ACID First (DSQL)              | Toute mutation de stock ou allocation de ressource passe par une transaction Aurora DSQL|
| Optimistic UI                  | Afficher l'état prévu immédiatement, rollback visuel en cas d'erreur DSQL              |
| Offline Resilience             | File d'actions hors-ligne stockée dans IndexedDB — sync automatique à la reconnexion  |
| Loading States obligatoires    | Tout appel API affiche un skeleton loader ou spinner — jamais d'écran blanc            |
| Pagination stricte             | Toutes les listes : 25 éléments/page mobile, 50/page desktop — pas de liste infinie   |
| Permissions UI                 | Boutons/actions inaccessibles au rôle courant = masqués (pas juste désactivés)        |
| Confirmation destructions      | Toute action irréversible = modale de confirmation avant exécution                     |
| Responsive Mobile First        | Breakpoints: < 480px (mobile), 480–768px (tablette), > 768px (desktop)                |
| Impression                     | Rapports et reçus : feuille CSS `@media print` dédiée, marges A4 respectées           |
| Accessibilité WCAG AA          | Contraste minimum 4.5:1, taille touche min 44×44px, aria-labels sur tous les inputs   |
| Toast unique                   | Maximum 1 toast visible à la fois — file d'attente si plusieurs déclenchés             |
| Websocket reconnect            | Reconnexion automatique avec back-off exponentiel (1s, 2s, 4s, 8s, max 30s)          |

---

# 10. MODÈLES DE DONNÉES PRINCIPAUX

## 10.1 Entité Resource (Ressource / Article inventaire)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique Aurora DSQL                                     |
| facilityId        | UUID FK       | Oui        | Établissement propriétaire                                         |
| orgId             | UUID FK       | Oui        | Organisation (multi-tenant)                                        |
| name              | String        | Oui        | Nom commercial / générique, 2–150 chars                            |
| dci               | String        | Non        | Dénomination Commune Internationale (médicaments)                  |
| categoryId        | UUID FK       | Oui        | Référence ResourceCategory                                         |
| zoneId            | UUID FK       | Oui        | Zone de stockage dans la facility                                  |
| unitOfMeasure     | Enum          | Oui        | UNIT / DOSE / VIAL / POUCH / BOX / LITER                           |
| currentQty        | Integer       | Oui        | Quantité totale actuelle (somme des lots actifs)                   |
| alertThreshold    | Integer       | Oui        | Seuil déclenchant l'alerte stock bas                               |
| status            | Enum          | Auto       | OK / LOW / CRITICAL / EXPIRED (calculé)                           |
| barcodeGS1        | String        | Non        | Code-barres GS1 international                                      |
| createdAt         | Timestamp     | Auto       | —                                                                  |
| updatedAt         | Timestamp     | Auto       | —                                                                  |

## 10.2 Entité Batch (Lot d'une ressource)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique                                                 |
| resourceId        | UUID FK       | Oui        | Référence Resource                                                 |
| facilityId        | UUID FK       | Oui        | Facility actuelle du lot                                           |
| batchNumber       | String        | Oui        | Numéro de lot fabricant, unique par resource                       |
| quantity          | Integer       | Oui        | Quantité de ce lot (décrémentée à chaque utilisation)             |
| expiryDate        | Date          | Oui        | Date expiration — format ISO 8601                                  |
| manufacturerId    | UUID FK       | Non        | Référence Supplier/Manufacturer                                    |
| receivedAt        | Timestamp     | Oui        | Date de réception dans la facility                                 |
| transferId        | UUID FK       | Non        | Référence Transfer si lot reçu par transfert                       |
| isQuarantined     | Boolean       | Oui        | true = lot mis en quarantaine (incident qualité)                   |
| createdBy         | UUID FK       | Oui        | Agent qui a enregistré la réception                                |

## 10.3 Entité InventoryMovement (Mouvement de stock)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique — table append-only                             |
| resourceId        | UUID FK       | Oui        | Ressource concernée                                                |
| batchId           | UUID FK       | Oui        | Lot concerné                                                       |
| facilityId        | UUID FK       | Oui        | Facility                                                           |
| delta             | Integer       | Oui        | Positif (entrée) ou négatif (sortie)                               |
| reason            | Enum          | Oui        | RECEPTION / USE / TRANSFER_OUT / TRANSFER_IN / EXPIRY / ADJUST / WASTE |
| transferId        | UUID FK       | Non        | Si lié à un transfert                                              |
| location          | String        | Non        | Emplacement physique (salle, armoire)                              |
| createdBy         | UUID FK       | Oui        | Utilisateur auteur du mouvement                                    |
| createdAt         | Timestamp     | Auto       | Immuable — aucun UPDATE/DELETE autorisé sur cette table            |

## 10.4 Entité Facility (Établissement)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique                                                 |
| orgId             | UUID FK       | Oui        | Organisation propriétaire                                          |
| name              | String        | Oui        | Nom complet de l'établissement                                     |
| type              | Enum          | Oui        | HOSPITAL / CLINIC / HEALTH_CENTER / NGO / WAREHOUSE                |
| countryCode       | String        | Oui        | ISO 3166-1 alpha-2                                                 |
| regionId          | UUID FK       | Oui        | Référence Region                                                   |
| address           | String        | Oui        | Adresse postale complète                                           |
| latitude          | Decimal(9,6)  | Non        | Coordonnée GPS pour carte                                          |
| longitude         | Decimal(9,6)  | Non        | Coordonnée GPS pour carte                                          |
| contactName       | String        | Oui        | Nom du coordinateur principal                                      |
| contactPhone      | String        | Oui        | Format international +XXXXXXXXXXX                                  |
| contactEmail      | String        | Non        | Email pour alertes automatiques                                    |
| status            | Enum          | Auto       | ONLINE / OFFLINE / CRITICAL / WARNING (calculé)                   |
| lastSyncAt        | Timestamp     | Auto       | Dernière synchronisation des données                               |
| createdAt         | Timestamp     | Auto       | —                                                                  |

## 10.5 Entité Transfer (Transfert de ressource)

| **Champ**             | **Type**      | **Requis** | **Description**                                                |
|-----------------------|---------------|------------|----------------------------------------------------------------|
| id                    | UUID          | Oui        | Identifiant unique                                             |
| ref                   | String        | Oui        | Référence lisible — Format: TRF-{ANNÉE}-{SEQ}                 |
| orgId                 | UUID FK       | Oui        | Organisation (multi-tenant)                                    |
| requestingFacilityId  | UUID FK       | Oui        | Établissement demandeur                                        |
| sourceFacilityId      | UUID FK       | Oui        | Établissement source                                           |
| resourceId            | UUID FK       | Oui        | Ressource transférée                                           |
| batchId               | UUID FK       | Non        | Lot spécifique si applicable                                   |
| requestedQty          | Integer       | Oui        | Quantité demandée                                              |
| confirmedQty          | Integer       | Non        | Quantité confirmée par la source                               |
| receivedQty           | Integer       | Non        | Quantité effectivement reçue (confirmation réception)          |
| motif                 | Enum          | Oui        | EMERGENCY / PLANNED_SHORTAGE / DONATION / EXPIRY_PREVENTION    |
| priority              | Enum          | Oui        | LOW / NORMAL / HIGH / CRITICAL                                 |
| isEmergency           | Boolean       | Oui        | Déclenche alertes immédiates si true                           |
| status                | Enum          | Oui        | PENDING / CONFIRMED / IN_TRANSIT / DELIVERED / COMPLETED / INCIDENT / CANCELLED |
| neededBy              | Timestamp     | Oui        | Date/heure de besoin                                           |
| notes                 | String        | Non        | Notes pour transporteur, max 300 chars                         |
| transporterName       | String        | Non        | Nom du transporteur                                            |
| transporterPhone      | String        | Non        | Contact transporteur                                           |
| vehicleId             | String        | Non        | Identifiant véhicule                                           |
| requiresColdChain     | Boolean       | Oui        | Déclenche monitoring IoT si true                               |
| receiptPhotoUrl       | String        | Non        | URL photo confirmation réception                               |
| createdBy             | UUID FK       | Oui        | Utilisateur créateur                                           |
| confirmedBy           | UUID FK       | Non        | Utilisateur ayant confirmé côté source                         |
| receivedBy            | UUID FK       | Non        | Utilisateur ayant confirmé réception                           |
| createdAt             | Timestamp     | Auto       | —                                                              |
| completedAt           | Timestamp     | Non        | Timestamp completion                                           |

## 10.6 Entité User (Utilisateur)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique                                                 |
| orgId             | UUID FK       | Oui        | Organisation principale                                            |
| facilityId        | UUID FK       | Non        | Null pour Super Admin / NGO Coordinator multi-sites                |
| email             | String        | Oui        | Email professionnel — unique dans la plateforme                    |
| passwordHash      | String        | Oui        | bcrypt hash — jamais exposé en API                                |
| role              | Enum          | Oui        | SUPER_ADMIN / FACILITY_MANAGER / FIELD_AGENT / NGO_COORDINATOR / AUDITOR / API_CONSUMER |
| name              | String        | Oui        | Nom complet                                                        |
| phone             | String        | Non        | Pour alertes SMS                                                   |
| zone              | String        | Non        | Zone de travail pour Field Agent                                   |
| pinHash           | String        | Non        | PIN 4 chiffres pour signatures réception                           |
| status            | Enum          | Oui        | ACTIVE / DISABLED / PENDING_INVITE                                 |
| loginAttempts     | Integer       | Auto       | Remis à 0 après connexion réussie                                  |
| lockedUntil       | Timestamp     | Non        | Null si non verrouillé                                             |
| lastLoginAt       | Timestamp     | Non        | Dernière connexion réussie                                         |
| createdAt         | Timestamp     | Auto       | —                                                                  |

## 10.7 Entité Alert (Alerte)

| **Champ**         | **Type**      | **Requis** | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| id                | UUID          | Oui        | Identifiant unique                                                 |
| facilityId        | UUID FK       | Oui        | Facility concernée                                                 |
| resourceId        | UUID FK       | Non        | Ressource déclenchante (si applicable)                             |
| alertType         | Enum          | Oui        | LOW_STOCK / CRITICAL_STOCK / EXPIRY_SOON / COLD_CHAIN / OFFLINE_FACILITY / TRANSFER_OVERDUE |
| severity          | Enum          | Oui        | WARNING / CRITICAL                                                 |
| message           | String        | Oui        | Message lisible — ex: `'Stock Sang O- sous seuil critique (4/10)'`|
| metadata          | JSONB         | Non        | Données contextuelles (qty, threshold, batchId, temperature...)    |
| isRead            | Boolean       | Oui        | false par défaut                                                   |
| isResolved        | Boolean       | Oui        | false par défaut                                                   |
| resolvedAt        | Timestamp     | Non        | Timestamp résolution                                               |
| resolvedBy        | UUID FK       | Non        | Utilisateur ayant résolu                                           |
| createdAt         | Timestamp     | Auto       | Généré par règle alerte ou trigger Aurora DSQL                     |

## 10.8 Entité ColdChainEvent (Événement IoT — DynamoDB)

> **Note Architecture** : Cette entité est stockée dans **DynamoDB**, pas dans Aurora DSQL. Raison : les capteurs IoT génèrent des milliers d'événements par heure — DynamoDB offre une ingestion à < 1ms de latence avec mise à l'échelle automatique, alors qu'Aurora DSQL est réservé aux données transactionnelles critiques.

| **Champ**         | **Type**      | **Clé**    | **Description**                                                    |
|-------------------|---------------|------------|--------------------------------------------------------------------|
| transferId        | String        | PK         | Identifiant du transfert (partition key)                           |
| timestamp         | String (ISO)  | SK         | Timestamp précis (sort key) — ex: `2026-06-09T14:32:17.842Z`     |
| deviceId          | String        | —          | Identifiant capteur IoT                                            |
| temperatureCelsius| Decimal       | —          | Température mesurée                                                |
| humidityPct       | Decimal       | Non        | Humidité en % (si capteur dispo)                                   |
| location          | String        | Non        | Coordonnées GPS ou nom de lieu                                     |
| alertTriggered    | Boolean       | —          | true si hors zone acceptable                                       |
| alertType         | String        | Non        | TOO_HOT / TOO_COLD / HUMIDITY_HIGH                                |
| ttl               | Number        | —          | TTL DynamoDB — expire automatiquement après 90 jours               |

---

# 11. ANNEXES TECHNIQUES

## 11.1 Codes d'Erreur API

| **Code HTTP** | **Code Interne**         | **Message**                                        | **Écran(s) concerné(s)**             |
|---------------|--------------------------|----------------------------------------------------|--------------------------------------|
| 400           | ERR_VALIDATION           | Données de formulaire invalides                    | Tous les formulaires                 |
| 401           | ERR_UNAUTHORIZED         | Token expiré ou invalide                           | Redirection → SCR-001                |
| 403           | ERR_FORBIDDEN            | Rôle insuffisant pour cette action                 | Message accès refusé + log audit     |
| 404           | ERR_NOT_FOUND            | Ressource introuvable                              | Page 404 dédiée                      |
| 409           | ERR_CONFLICT             | Conflit de données (ex: doublon lot, race condition)| SCR-010, SCR-020                    |
| 409           | ERR_RESOURCE_UNAVAILABLE | Stock source insuffisant au moment transaction     | SCR-020 → re-recherche source        |
| 410           | ERR_OTP_EXPIRED          | Code OTP expiré                                    | SCR-002                              |
| 422           | ERR_BUSINESS             | Règle métier violée                                | SCR-020, SCR-024                     |
| 423           | ERR_ACCOUNT_LOCKED       | Compte temporairement verrouillé                   | SCR-001 + timer affiché              |
| 429           | ERR_RATE_LIMIT           | Trop de requêtes                                   | Toast + délai countdown affiché      |
| 500           | ERR_SERVER               | Erreur serveur interne                             | Page d'erreur + bouton Réessayer     |
| 503           | ERR_DSQL_UNAVAILABLE     | Aurora DSQL temporairement indisponible            | Retry automatique 3× + fallback read |
| 504           | ERR_TIMEOUT              | Timeout transaction DSQL (> 5s)                   | Toast erreur + action annulée proprement|

## 11.2 Architecture des Transactions Aurora DSQL

Les transactions critiques suivantes utilisent des transactions ACID Aurora DSQL (BEGIN / COMMIT / ROLLBACK) :

| **Opération**                   | **Tables impliquées**                            | **Isolation Level** |
|---------------------------------|--------------------------------------------------|---------------------|
| Création transfert              | `resources`, `batches`, `transfers`, `audit_log` | SERIALIZABLE        |
| Confirmation réception          | `resources`, `batches`, `transfers`, `inventory_movements`, `audit_log` | SERIALIZABLE |
| Mise à jour stock (ajout)       | `resources`, `batches`, `inventory_movements`    | READ COMMITTED      |
| Diffusion broadcast             | `broadcasts`, `transfers` (N insertions)         | READ COMMITTED      |
| Désactivation utilisateur       | `users`, `sessions`, `audit_log`                 | READ COMMITTED      |

Stratégie de retry : En cas de conflit de transaction (`409 ERR_CONFLICT`), le client retente automatiquement 2 fois avec un délai de 200ms, puis affiche l'erreur à l'utilisateur avec bouton `'Réessayer'`.

## 11.3 Architecture DynamoDB — Tables

| **Table**              | **Partition Key**   | **Sort Key**         | **Usage**                                         |
|------------------------|---------------------|----------------------|---------------------------------------------------|
| `cold_chain_events`    | `transferId`        | `timestamp` (ISO)    | Lectures IoT température — TTL 90 jours          |
| `notification_queue`   | `userId`            | `createdAt#alertId`  | Queue push notifications — TTL 7 jours           |
| `user_sessions`        | `userId`            | `sessionId`          | Sessions actives — TTL = expiresAt               |
| `offline_action_queue` | `deviceId`          | `timestamp#actionId` | Actions hors-ligne en attente sync — TTL 30 jours|
| `broadcast_responses`  | `broadcastId`       | `facilityId`         | Réponses aux broadcasts d'urgence                 |

## 11.4 Checklist de Test par Écran

| **Test**                    | **Priorité** | **Description**                                                              |
|-----------------------------|--------------|------------------------------------------------------------------------------|
| Transaction DSQL atomique   | P0           | Vérifier qu'une déconnexion au milieu d'un transfert ne laisse pas d'état incohérent |
| Race condition stock        | P0           | Deux agents créent simultanément un transfert sur le même stock — un seul doit réussir |
| Rendu mobile 375px          | P0           | Tester sur Android + iOS avec viewport 375px minimum                        |
| Mode hors-ligne             | P0           | Désactiver réseau, effectuer actions, reconnecter, vérifier sync cohérente   |
| Permissions par rôle        | P0           | Tester chaque écran avec chaque rôle — aucun accès non autorisé possible     |
| Validation formulaires      | P0           | Champs vides, valeurs limites, injection SQL/XSS, caractères spéciaux        |
| Expiration token JWT        | P0           | Vérifier refresh automatique + redirection login si refresh expiré           |
| WebSocket reconnexion       | P1           | Couper/rétablir connexion — vérifier état alertes cohérent après reconnexion |
| DynamoDB IoT ingestion      | P1           | Simuler 100 événements/min — vérifier affichage correct SCR-028              |
| Export CSV/PDF              | P1           | Vérifier encoding UTF-8, caractères accentués, rendu A4                      |
| Import CSV 500 lignes       | P1           | Tester avec erreurs intercalées — vérifier rapport erreurs précis            |
| Performance 4G simulée      | P1           | Temps chargement < 3s sur réseau 10 Mbps simulé (Lighthouse)                |
| Accessibilité WCAG AA       | P2           | Tester avec lecteur écran (NVDA/VoiceOver), navigation clavier seule         |
| Multi-langue                | P2           | Vérifier affichage FR/EN sur tous les écrans (i18n)                          |
| Impression rapports         | P2           | Bulletin transfert, rapport stock : vérifier rendu CSS @media print A4       |

## 11.5 Variables d'Environnement Requises

```env
# Base de données Aurora DSQL (principal — transactionnel)
AURORA_DSQL_ENDPOINT=<cluster-endpoint>.dsql.<region>.on.aws
AURORA_DSQL_DATABASE=vitalgrid_prod
AURORA_DSQL_USERNAME=vitalgrid_app
AURORA_DSQL_PASSWORD=<secret>
AURORA_DSQL_SSL=true
AURORA_DSQL_MAX_CONNECTIONS=100

# DynamoDB (IoT, Sessions, Notifications)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
DYNAMODB_COLD_CHAIN_TABLE=cold_chain_events
DYNAMODB_SESSIONS_TABLE=user_sessions
DYNAMODB_NOTIFICATIONS_TABLE=notification_queue
DYNAMODB_OFFLINE_QUEUE_TABLE=offline_action_queue

# Auth
JWT_SECRET=<secret_minimum_64_chars>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=24h
REFRESH_TOKEN_LONG_EXPIRES_IN=30d
BCRYPT_ROUNDS=12
PIN_HASH_SECRET=<secret>

# SSO SAML (optionnel)
SAML_ENTRY_POINT=<idp_sso_url>
SAML_ISSUER=vitalgrid
SAML_CERT=<idp_public_cert>

# Stockage médias (photos réceptions, logos)
AWS_S3_BUCKET=vitalgrid-media-prod
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_URL=https://media.vitalgrid.io

# Notifications push
FIREBASE_SERVER_KEY=<fcm_key>
FIREBASE_PROJECT_ID=<project>

# Email transactionnel
SENDGRID_API_KEY=<key>
EMAIL_FROM=noreply@vitalgrid.io
EMAIL_REPLY_TO=support@vitalgrid.io

# SMS (optionnel)
AFRICAS_TALKING_API_KEY=<key>
AFRICAS_TALKING_USERNAME=<username>
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
SMS_SENDER_ID=VitalGrid

# Maps
MAPBOX_PUBLIC_TOKEN=pk.<token>

# Application
NEXT_PUBLIC_APP_URL=https://app.vitalgrid.io
NEXT_PUBLIC_API_URL=https://api.vitalgrid.io
NEXT_PUBLIC_WS_URL=wss://ws.vitalgrid.io
NODE_ENV=production

# Feature flags
ENABLE_IOT_COLD_CHAIN=true
ENABLE_SSO=true
ENABLE_BILLING=true
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
COLD_CHAIN_ALERT_MIN_CELSIUS=2
COLD_CHAIN_ALERT_MAX_CELSIUS=8
DEFAULT_ALERT_THRESHOLD_DAYS_EXPIRY=30
OFFLINE_SYNC_RETRY_MAX=3
```

## 11.6 Stratégie de Déploiement Vercel

| **Environnement** | **Branch**   | **URL**                        | **Base de données**                        |
|-------------------|--------------|--------------------------------|--------------------------------------------|
| Production        | main         | app.vitalgrid.io               | Aurora DSQL production + DynamoDB prod     |
| Staging           | staging      | staging.vitalgrid.io           | Aurora DSQL staging + DynamoDB staging     |
| Preview           | pull-request | *.vercel.app (auto)            | Aurora DSQL dev (shared) + DynamoDB dev    |

**Configuration Vercel v0** : Le frontend est scaffoldé avec Vercel v0 (générateur UI Next.js 15). Les composants critiques de dashboard, du formulaire de transfert et de la carte sont générés initialement via v0 puis customisés. L'intégration Aurora DSQL est déclarée via le Vercel Marketplace Storage (connexion native sans configuration manuelle des credentials).

---

**— FIN DU DOCUMENT DE SPÉCIFICATION DES ÉCRANS —**

VitalGrid | SSD v1.0.0 | 44 écrans | 8 modules | H0: Hack the Zero Stack — AWS × Vercel | © 2026
