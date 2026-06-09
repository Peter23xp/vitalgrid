# VitalGrid Plan C — DynamoDB Cold-Chain IoT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher la page `/alerts/cold-chain` sur DynamoDB pour afficher les données IoT de température en temps réel depuis les capteurs de transport.

**Architecture:** Une route API `/api/cold-chain/[transferId]` lit DynamoDB avec le SDK AWS. La page `alerts/cold-chain` est un Client Component qui `fetch` cette route et affiche le graphique SVG avec les vraies lectures capteurs. Les seuils (2–8°C pour les vaccins) sont évalués côté API.

**Tech Stack:** AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`), Next.js 16, React 19, CSS Modules

---

## Task 1 : Installer le SDK DynamoDB

**Files:**
- Modify: `package.json` (via npm install)

- [ ] Installer les dépendances :

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

- [ ] Vérifier :

```bash
npm list @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

Résultat attendu : les deux packages listés sans erreur.

---

## Task 2 : Ajouter les variables DynamoDB

**Files:**
- Modify: `.env.local`

- [ ] Ajouter dans `.env.local` :

```
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_COLD_CHAIN=cold_chain_events
```

> La table DynamoDB `cold_chain_events` doit être créée manuellement dans la console AWS (voir note ci-dessous).

**Note — créer la table DynamoDB :**
1. Console AWS → DynamoDB → Create table
2. Table name: `cold_chain_events`
3. Partition key: `transferId` (String)
4. Sort key: `timestamp` (String — format ISO 8601)
5. Billing: On-demand
6. Créer la table

- [ ] Build check : `npm run build`

---

## Task 3 : Client DynamoDB + Repository

**Files:**
- Create: `src/lib/dynamodb.ts`
- Create: `src/lib/repos/cold-chain.ts`

- [ ] Créer `src/lib/dynamodb.ts` :

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);
```

- [ ] Créer `src/lib/repos/cold-chain.ts` :

```typescript
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export interface ColdChainReading {
  transferId: string;
  timestamp: string;
  celsius: number;
  deviceId: string;
  isAlert: boolean;
}

export interface ColdChainStats {
  latestReading: ColdChainReading | null;
  readings: ColdChainReading[];
  stats: { min: number; max: number; avg: number };
  alerts: ColdChainReading[];
}

const TABLE = process.env.DYNAMODB_TABLE_COLD_CHAIN ?? 'cold_chain_events';
const THRESHOLD_LOW = 2;
const THRESHOLD_HIGH = 8;

export async function getColdChainData(
  transferId: string,
  hoursBack = 24
): Promise<ColdChainStats> {
  const since = new Date(Date.now() - hoursBack * 3600 * 1000).toISOString();

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'transferId = :tid AND #ts >= :since',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: { ':tid': transferId, ':since': since },
      ScanIndexForward: true,
    })
  );

  const readings = (result.Items ?? []) as ColdChainReading[];

  if (readings.length === 0) {
    return { latestReading: null, readings: [], stats: { min: 0, max: 0, avg: 0 }, alerts: [] };
  }

  const temps = readings.map((r) => r.celsius);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const avg = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
  const alerts = readings.filter((r) => r.celsius < THRESHOLD_LOW || r.celsius > THRESHOLD_HIGH);
  const latestReading = readings[readings.length - 1];

  return { latestReading, readings, stats: { min, max, avg }, alerts };
}
```

- [ ] Build check : `npm run build`

---

## Task 4 : Route API cold-chain

**Files:**
- Create: `src/app/api/cold-chain/[transferId]/route.ts`

- [ ] Créer le répertoire :

```bash
mkdir -p src/app/api/cold-chain/\[transferId\]
```

- [ ] Créer `src/app/api/cold-chain/[transferId]/route.ts` :

```typescript
import { NextRequest } from 'next/server';
import { getColdChainData } from '@/lib/repos/cold-chain';
import { apiOk, apiError } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ transferId: string }> }
) {
  try {
    const { transferId } = await params;
    if (!transferId) return apiError('transferId requis');
    const hoursBack = Number(req.nextUrl.searchParams.get('hoursBack') ?? 24);
    const data = await getColdChainData(transferId, hoursBack);
    return apiOk(data);
  } catch (e: unknown) {
    const err = e as Error;
    console.error('cold-chain API error:', err.message);
    return apiError('Erreur DynamoDB', 500);
  }
}
```

- [ ] Build check : `npm run build`

---

## Task 5 : Page cold-chain avec données réelles

**Files:**
- Modify: `src/app/alerts/cold-chain/page.tsx`

- [ ] Remplacer `src/app/alerts/cold-chain/page.tsx` par :

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Thermometer } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import styles from './page.module.css';

interface Reading { timestamp: string; celsius: number; isAlert: boolean; }
interface ColdChainData {
  latestReading: { celsius: number; timestamp: string; deviceId: string } | null;
  readings: Reading[];
  stats: { min: number; max: number; avg: number };
  alerts: Reading[];
}

const THRESHOLD_LOW = 2;
const THRESHOLD_HIGH = 8;

function Sparkline({ readings }: { readings: Reading[] }) {
  if (readings.length < 2) return null;
  const temps = readings.map((r) => r.celsius);
  const minT = Math.min(...temps, THRESHOLD_LOW - 1);
  const maxT = Math.max(...temps, THRESHOLD_HIGH + 1);
  const range = maxT - minT || 1;
  const W = 600;
  const H = 120;
  const xStep = W / (readings.length - 1);
  const toY = (c: number) => H - ((c - minT) / range) * H;

  const points = readings.map((r, i) => `${i * xStep},${toY(r.celsius)}`).join(' ');
  const thresholdLowY = toY(THRESHOLD_LOW);
  const thresholdHighY = toY(THRESHOLD_HIGH);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      <line x1={0} y1={thresholdHighY} x2={W} y2={thresholdHighY} stroke="var(--status-error)" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <line x1={0} y1={thresholdLowY} x2={W} y2={thresholdLowY} stroke="var(--status-info)" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <polyline points={points} fill="none" stroke="var(--brand-sage)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {readings.map((r, i) => r.isAlert && (
        <circle key={i} cx={i * xStep} cy={toY(r.celsius)} r={4} fill="var(--status-error)" />
      ))}
    </svg>
  );
}

export default function ColdChainPage() {
  const [transferId, setTransferId] = useState('');
  const [data, setData] = useState<ColdChainData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = (tid: string) => {
    if (!tid) return;
    setLoading(true);
    apiFetch<ColdChainData>(`/api/cold-chain/${tid}?hoursBack=24`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('transferId') ?? '';
    if (tid) { setTransferId(tid); load(tid); }
  }, []);

  const tempOk = data?.latestReading
    ? data.latestReading.celsius >= THRESHOLD_LOW && data.latestReading.celsius <= THRESHOLD_HIGH
    : null;

  return (
    <div className={`animate-fade-in ${styles.container}`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Link href="/alerts" className={styles.backLink}>← Alertes</Link>
          <h1 className={styles.title}>CHAÎNE DU FROID — MONITORING</h1>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Transfert :</label>
          <input
            type="text"
            className={`input-field ${styles.filterInput}`}
            placeholder="ID du transfert..."
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            onBlur={() => load(transferId)}
          />
        </div>
      </div>

      {!transferId && (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--brand-slate)' }}>
          <Thermometer size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>Saisissez un ID de transfert pour voir les données IoT</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--brand-slate)', fontSize: 13 }}>Chargement des données capteurs...</div>
      )}

      {!loading && data && (
        <>
          <div className={styles.tempCard}>
            <div className={styles.tempMain}>
              <span className={styles.tempValue}>
                {data.latestReading ? `${data.latestReading.celsius}°C` : '--'}
              </span>
              {tempOk !== null && (
                <span className={`badge ${tempOk ? 'success' : 'critical'}`} style={{ marginLeft: 16 }}>
                  {tempOk ? 'Zone acceptable (2–8°C)' : 'HORS ZONE'}
                </span>
              )}
            </div>

            {data.readings.length > 0 ? (
              <div className={styles.chartArea}>
                <Sparkline readings={data.readings} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--brand-slate)', fontSize: 13 }}>
                Aucune lecture dans les dernières 24h
              </div>
            )}

            <div className={styles.statsRow}>
              <span className={styles.statItem}>Min: <strong className="mono">{data.stats.min}°C</strong></span>
              <span className={styles.statItem}>Max: <strong className="mono">{data.stats.max}°C</strong></span>
              <span className={styles.statItem}>Moy: <strong className="mono">{data.stats.avg}°C</strong></span>
            </div>
          </div>

          {data.alerts.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Événements ({data.alerts.length} alertes)</h2>
              <div className={styles.eventList}>
                {data.alerts.map((a, i) => (
                  <div key={i} className={styles.eventItem}>
                    <span className={`${styles.eventDot} ${styles.eventDotAlert}`} />
                    <span className="mono" style={{ fontSize: 12 }}>{new Date(a.timestamp).toLocaleTimeString('fr-FR')}</span>
                    <span style={{ fontSize: 13 }}>Alerte température</span>
                    <span className="mono">{a.celsius}°C</span>
                    <span className="badge critical">Hors zone</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] Build check : `npm run build`
- [ ] Commit :

```bash
git add src/lib/dynamodb.ts src/lib/repos/cold-chain.ts src/app/api/cold-chain src/app/alerts/cold-chain/page.tsx
git commit -m "feat: DynamoDB cold-chain IoT monitoring for /alerts/cold-chain"
```

---

## Tester en local

Une fois la table DynamoDB créée et des données insérées :

```bash
# Insérer une lecture de test (AWS CLI)
aws dynamodb put-item \
  --table-name cold_chain_events \
  --region us-east-1 \
  --item '{
    "transferId": {"S": "test-transfer-001"},
    "timestamp":  {"S": "2026-06-09T14:00:00.000Z"},
    "celsius":    {"N": "3.8"},
    "deviceId":   {"S": "IoT-Sensor-C77"},
    "isAlert":    {"BOOL": false}
  }'
```

Puis naviguer vers `/alerts/cold-chain?transferId=test-transfer-001`.
