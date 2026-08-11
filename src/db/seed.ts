import { db } from './index';
import { apiCacheState, roadEvents } from './schema';

async function seed() {
  console.log('Seeding database...');

  try {
    // Insert dummy API cache state
    await db.insert(apiCacheState).values({
      endpoint: '/api/v1/road-events',
      etag: 'W/"123456789"',
    }).onConflictDoNothing();

    // Insert dummy road events
    await db.insert(roadEvents).values([
      {
        id: 'evt-001',
        eventType: 'construction',
        location: 'I-88 Eastbound',
        description: 'Road work near Exit 10, right lane closed.',
        latitude: 41.8781,
        longitude: -87.6298,
        rawPayload: { source: 'DOT', impact: 'moderate' }
      },
      {
        id: 'evt-002',
        eventType: 'accident',
        location: 'Route 66',
        description: 'Multi-vehicle collision, expect delays.',
        latitude: 35.1107,
        longitude: -106.6100,
        rawPayload: { source: 'Police', impact: 'severe' }
      }
    ]).onConflictDoNothing();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();
