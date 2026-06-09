# VitalGrid — Architecture & Contraintes Techniques

## Contexte

Système de logistique médicale et humanitaire critique.
Mutualisation des inventaires, localisation des ressources, transferts transfrontaliers, prévention des pénuries.

**Priorités par ordre :**
1. Vie humaine
2. Consistance des données
3. Faible latence
4. Résilience
5. Scalabilité
6. Lisibilité du code

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, Vercel |
| Backend | Microservices stateless, REST |
| Base de données principale | Aurora DSQL (source de vérité unique) |
| Événements IoT / séries temporelles | DynamoDB (cold_chain_events uniquement) |
| Cache | In-memory ou Redis |

---

## Base de données

### Aurora DSQL — règles strictes

- Source de vérité pour toutes les données métier
- Transactions ACID obligatoires pour toute mutation de stock ou d'allocation
- OCC retry systématique (SQLSTATE 40001, max 5 tentatives, backoff exponentiel)
- `CREATE INDEX ASYNC` — jamais synchrone
- Maximum 3 000 lignes par transaction
- Aucune logique métier dans la base (pas de triggers, pas de procédures stockées)
- Aucune jointure inter-domaines (chaque service accède uniquement à ses tables)
- Aucun accès direct entre services — toujours par API

### DynamoDB — usage limité

- Uniquement pour `cold_chain_events` (données capteurs IoT, séries temporelles haute fréquence)
- Table : clé de partition = `transferId`, clé de tri = `timestamp`
- Alertes évaluées par Lambda via DynamoDB Streams

---

## Architecture microservices

Services logiquement séparés, base Aurora DSQL partagée avec accès cloisonné.

### Services à implémenter

| Service | Responsabilité | Tables Aurora DSQL |
|---|---|---|
| API Gateway | Point d'entrée, auth, rate limiting, routage | — |
| Identity & Access | Organisations, utilisateurs, rôles, permissions | `organizations`, `users`, `alert_rules` |
| Inventaire | Stocks, lots, expirations, mouvements | `resources`, `batches`, `inventory_movements` |
| Réservation & Allocation | Réservation atomique, verrouillage logique | `resources`, `batches` (écriture exclusive) |
| Logistique & Transferts | Ordres de transfert, suivi, états | `transfers` |
| Notifications | Alertes, événements asynchrones | `alerts`, `broadcasts` |
| Analytics & Prévisions | Lecture seule, calculs non bloquants | Toutes tables (lecture) |
| Audit & Traçabilité | Historique inviolable, journalisation | `audit_log` (append-only) |

### Règles d'isolation

- Chaque service n'accède qu'à ses tables via une couche repository
- Aucun service n'a de visibilité sur les tables métier des autres
- Les données partagées transitent par API, jamais par jointure directe

---

## Performance

- Cache in-memory ou Redis avec TTL et invalidation métier
- Pagination systématique (25/page mobile, 50/page desktop)
- Opérations lourdes asynchrones (analytics, exports, broadcasts)
- CQRS logique : lectures analytics séparées des écritures critiques
- Aucune requête synchrone longue sur le thread principal

---

## Communication inter-services

- REST pour les actions critiques (mutations, allocations)
- Événements internes pour notifications, audit, analytics
- Chaque appel inclut : timeout, retry, circuit breaker

---

## Résilience & sécurité

- Tolérance aux pannes partielles
- Principe du moindre privilège (IAM roles scoped par service)
- Journalisation de toutes les actions critiques
- `audit_log` en mode append-only (aucun UPDATE ni DELETE autorisé)
- Tokens IAM DSQL renouvelés toutes les 14 minutes (expiry 15 min)

---

## Scalabilité

- Tous les services sont stateless et scalables horizontalement
- La charge mondiale ne doit jamais saturer Aurora DSQL
- Connection pooling obligatoire en production (max 10 connexions par instance)
