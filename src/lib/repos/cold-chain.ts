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
