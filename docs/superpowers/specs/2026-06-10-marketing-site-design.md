# VitalGrid — Site Marketing & Page d'inscription

## Goal

Créer le site public de VitalGrid : landing page professionnelle en français ciblant directeurs d'hôpitaux ET coordinateurs ONG, formulaire de démo, et formulaire d'inscription avec approbation manuelle.

---

## Architecture des routes

```
src/app/(marketing)/          ← route group isolé du dashboard
  layout.tsx                  ← navbar + footer publics, pas de sidebar
  page.tsx                    ← landing page /
  demo/page.tsx               ← formulaire demande de démo
  register/page.tsx           ← formulaire inscription (approbation requise)
```

Nouveau layout sans sidebar, sans navbar d'app. La route `/login` existante reste dans `src/app/login/`.

---

## Design visuel — Brand register

### Positionnement esthétique

**Référence nommée :** Médecins Sans Frontières rencontre un outil ops militaire — précision, terrain, gravité sans drama. Pas Stripe. Pas SaaS-crème. Pas ONG-brochure.

**Stratégie couleur : Committed-dark**
- Fond hero : Navy profond (#0F172A) — la surface EST la couleur
- Accent : Sage (#059669) pour les CTAs et highlights
- Fond sections : alternance #0F172A (dark) et #FFFFFF (light)
- Jamais de beige, jamais de crème, jamais de fond teinté gris clair

**Typographie — hors reflex-reject :**
- Display/headlines : **Sora** (Google Fonts) — géométrique, solide, pas Inter, pas Plus Jakarta Sans
- Body : **Noto Sans** — neutre universel, excellent pour le français, multilingue
- Mono : **Fira Code** (déjà en place) — pour les métriques et références techniques

**Ton visuel :**
- Schémas SVG réseau (facilities connectées par des arcs) — pas de stock photos de médecins souriants
- Screenshots du dashboard réel
- Carte Afrique centrale avec points lumineux
- Chiffres typographiques larges (data as design)

---

## Section 1 : Navbar

- Logo `VitalGrid` (Sora Bold, sage accent)
- Liens : Fonctionnalités · Cas d'usage · Tarifs
- Boutons : [Se connecter] (outline) · [Demander une démo] (primary sage)
- Sticky, fond transparent → navy au scroll
- Mobile : hamburger menu

---

## Section 2 : Hero

**Headline (clamp 52-80px, Sora Bold) :**
> "Chaque heure, des médicaments critiques expirent pendant que d'autres manquent à 40 km."

**Sous-titre :**
> "VitalGrid coordonne les stocks médicaux entre établissements en temps réel — pour que rien de critique ne soit gaspillé ou manquant."

**CTAs :** [Demander une démo →] · [Voir la plateforme]

**Visuel :** Schéma SVG animé — 5-6 facilities reliées par des arcs de transfert, un point rouge (stock critique) qui déclenche une connexion vers un point vert (surplus). Dark background.

---

## Section 3 : Problème — 2 audiences

**Titre :** "Deux problèmes. Une solution."

**Layout 2 colonnes :**

Colonne gauche — "Pour les hôpitaux & cliniques" :
- Stock critique découvert trop tard
- Médicaments expirant en entrepôt
- Transferts organisés par téléphone

Colonne droite — "Pour les ONG & coordinateurs" :
- Aucune visibilité inter-facilities en temps réel
- Décisions de redistribution sans données
- Audit impossible après incident

---

## Section 4 : Fonctionnalités (6 cards)

Grid 3×2, fond blanc :
1. **Inventaire temps réel** — stock, lots, expirations, seuils d'alerte
2. **Transferts inter-établissements** — demande, approbation, suivi, confirmation ACID
3. **Alertes intelligentes** — stock bas, expiration proche, température hors zone
4. **Chaîne du froid IoT** — capteurs DynamoDB, graphique température, alertes automatiques
5. **Carte régionale** — visualisation des stocks par zone géographique (Leaflet)
6. **Audit trail immuable** — chaque action tracée, conforme aux standards OMS/UNICEF

---

## Section 5 : Cas d'usage par rôle (3 tabs)

**Tabs :** Facility Manager · Field Agent · NGO Coordinator

Chaque tab : icon rôle + titre + 3 bullets workflow quotidien + screenshot du dashboard correspondant

---

## Section 6 : Chiffres clés

4 métriques large, fond navy :
- `44` écrans couverts
- `< 2 min` pour déclencher un transfert d'urgence
- `ACID` garantie d'intégrité des transactions
- `WCAG AA` accessibilité

---

## Section 7 : Témoignages (placeholders)

3 quotes, fond gris très léger :
- Dr. [Nom], Directeur médical, Hôpital de référence, Goma
- [Prénom], Coordinatrice logistique, MSF
- [Prénom], Responsable supply chain, Ministère de la Santé

---

## Section 8 : Pricing

3 plans, fond blanc :
- **Freemium** — Gratuit · ≤5 facilities · ≤20 utilisateurs · Fonctionnalités de base
- **Standard** — $199/mois · ≤50 facilities · Support email · Toutes fonctionnalités
- **Enterprise** — Sur devis · Facilities illimitées · Support dédié · SLA · SSO SAML

CTA sur chaque plan : [Demander un accès]

---

## Section 9 : CTA final

Fond navy, centré :
> "Prêt à coordonner vos ressources médicales ?"
[Demander une démo →]

---

## Section 10 : Footer

- Logo + tagline courte
- 3 colonnes : Produit (Fonctionnalités, Tarifs, Démo) · Entreprise (À propos, Contact) · Légal (CGU, Confidentialité)
- Copyright © 2026 VitalGrid

---

## Page /demo

Formulaire en 2 colonnes :
- Prénom * + Nom *
- Email professionnel *
- Organisation *
- Pays * (CountrySelect existant)
- Nombre d'établissements (select: 1-5 / 6-20 / 21-50 / 50+)
- Message (textarea optionnel)

Submit → `POST /api/demo-request` → email via SendGrid → message de confirmation affiché

---

## Page /register

Formulaire :
- Prénom * + Nom *
- Email professionnel *
- Organisation *
- Rôle * (Facility Manager / NGO Coordinator / Directeur médical / Autre)
- Pays * (CountrySelect)
- Message optionnel

Submit → `POST /api/access-requests` → INSERT dans table `access_requests` DSQL → email notif à admin → message : *"Votre demande a été envoyée. L'équipe VitalGrid vous contactera sous 48h."*

**Table DSQL à créer :**
```sql
CREATE TABLE IF NOT EXISTS access_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  role         VARCHAR(50)  NOT NULL,
  country_code VARCHAR(2)   NOT NULL,
  message      TEXT,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
)
```

---

## Ordre d'implémentation

1. Route group `(marketing)` + layout (navbar + footer)
2. Composants : `MarketingNav`, `MarketingFooter`, `HeroSVG` (schéma réseau)
3. Landing page — toutes les sections
4. Page /demo avec API route
5. Page /register avec API route + migration DSQL
6. Responsive mobile
