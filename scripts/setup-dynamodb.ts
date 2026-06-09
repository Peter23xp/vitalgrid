import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.DYNAMODB_REGION ?? 'us-east-1';
const TABLE  = process.env.DYNAMODB_TABLE_COLD_CHAIN ?? 'cold_chain_events';

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const doc = DynamoDBDocumentClient.from(client);

async function run() {
  // 1. Créer la table
  console.log(`\nCréation de la table "${TABLE}"...`);
  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE,
      AttributeDefinitions: [
        { AttributeName: 'transferId', AttributeType: 'S' },
        { AttributeName: 'timestamp',  AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'transferId', KeyType: 'HASH'  },
        { AttributeName: 'timestamp',  KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log(`  ✓ Table créée`);
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    if (e.name === 'ResourceInUseException') {
      console.log(`  ℹ Table déjà existante`);
    } else {
      throw err;
    }
  }

  // Attendre que la table soit active
  console.log('  Attente activation...');
  for (let i = 0; i < 15; i++) {
    const desc = await client.send(new DescribeTableCommand({ TableName: TABLE }));
    if (desc.Table?.TableStatus === 'ACTIVE') {
      console.log('  ✓ Table active');
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 2. Insérer des enregistrements de test
  console.log('\nInsertion des données de test...');
  const now = Date.now();
  const records = [
    { celsius: 3.8,  isAlert: false, offset: 0 },
    { celsius: 4.1,  isAlert: false, offset: 5 },
    { celsius: 5.2,  isAlert: false, offset: 10 },
    { celsius: 4.8,  isAlert: false, offset: 15 },
    { celsius: 7.8,  isAlert: true,  offset: 20 },
    { celsius: 6.2,  isAlert: false, offset: 25 },
    { celsius: 3.9,  isAlert: false, offset: 30 },
    { celsius: 4.0,  isAlert: false, offset: 35 },
    { celsius: 2.4,  isAlert: false, offset: 40 },
    { celsius: 1.2,  isAlert: true,  offset: 45 },
    { celsius: 3.1,  isAlert: false, offset: 50 },
    { celsius: 3.5,  isAlert: false, offset: 55 },
  ];

  for (const r of records) {
    const ts = new Date(now - (60 - r.offset) * 60 * 1000).toISOString();
    await doc.send(new PutCommand({
      TableName: TABLE,
      Item: {
        transferId: 'test-transfer-001',
        timestamp:  ts,
        celsius:    r.celsius,
        deviceId:   'IoT-Sensor-C77',
        isAlert:    r.isAlert,
      },
    }));
  }

  console.log(`  ✓ ${records.length} lectures insérées pour transferId "test-transfer-001"`);
  console.log('\n✅ DynamoDB prêt\n');
  console.log('  → Navigue vers : http://localhost:3000/alerts/cold-chain?transferId=test-transfer-001\n');
}

run().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
