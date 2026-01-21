/**
 * Migration script to convert tag names to tag IDs
 * in supervisor_profiles.tags and project_ideas.tags
 * 
 * Run: node scripts/migrate-tags-to-ids.js
 */

const mysql = require('mysql2/promise');

async function migrate() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'supconnect'
    });

    console.log('Connected to database');
    console.log('Starting tag migration...\n');

    // Build tag name to ID mapping
    const [tags] = await conn.execute('SELECT id, name FROM tags');
    const tagNameToId = new Map();
    tags.forEach(t => {
        tagNameToId.set(t.name.toLowerCase(), t.id);
    });
    console.log(`Found ${tags.length} tags in database\n`);

    // Helper to check if value is a UUID
    const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Helper to convert names to IDs
    const convertToIds = (tagsJson) => {
        try {
            const parsed = JSON.parse(tagsJson || '[]');
            if (!Array.isArray(parsed) || parsed.length === 0) return null;

            // Check if already using IDs (skip if so)
            if (parsed.some(isUuid)) {
                return null; // Already migrated
            }

            // Convert names to IDs
            const ids = parsed
                .map(name => tagNameToId.get(name.toLowerCase()))
                .filter(id => id !== undefined);

            return ids.length > 0 ? JSON.stringify(ids) : null;
        } catch {
            return null;
        }
    };

    // Migrate supervisor_profiles
    console.log('=== Migrating supervisor_profiles ===');
    const [supervisors] = await conn.execute('SELECT id, tags FROM supervisor_profiles');
    let supUpdated = 0;
    let supSkipped = 0;

    for (const sup of supervisors) {
        const newTags = convertToIds(sup.tags);
        if (newTags) {
            await conn.execute(
                'UPDATE supervisor_profiles SET tags = ? WHERE id = ?',
                [newTags, sup.id]
            );
            supUpdated++;
            console.log(`  Updated supervisor ${sup.id}`);
        } else {
            supSkipped++;
        }
    }
    console.log(`  Updated: ${supUpdated}, Skipped: ${supSkipped}\n`);

    // Migrate project_ideas
    console.log('=== Migrating project_ideas ===');
    const [ideas] = await conn.execute('SELECT id, tags FROM project_ideas');
    let ideaUpdated = 0;
    let ideaSkipped = 0;

    for (const idea of ideas) {
        const newTags = convertToIds(idea.tags);
        if (newTags) {
            await conn.execute(
                'UPDATE project_ideas SET tags = ? WHERE id = ?',
                [newTags, idea.id]
            );
            ideaUpdated++;
            console.log(`  Updated project idea ${idea.id}`);
        } else {
            ideaSkipped++;
        }
    }
    console.log(`  Updated: ${ideaUpdated}, Skipped: ${ideaSkipped}\n`);

    console.log('=== Migration Complete ===');
    console.log(`Supervisors: ${supUpdated} updated, ${supSkipped} skipped`);
    console.log(`Project Ideas: ${ideaUpdated} updated, ${ideaSkipped} skipped`);

    await conn.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
