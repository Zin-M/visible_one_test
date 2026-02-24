import { db } from './src/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function migrate() {
    const hash = await bcrypt.hash('password123', 10);
    console.log('Adding password column...');
    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN password varchar(255)`);
    } catch (e: any) {
        console.log('Column password might already exist', e.message);
    }

    console.log('Seeding password for existing users...');
    await db.execute(sql`UPDATE users SET password = ${hash} WHERE password IS NULL`);

    console.log('Setting password column to NOT NULL...');
    try {
        await db.execute(sql`ALTER TABLE users ALTER COLUMN password SET NOT NULL`);
    } catch (e: any) {
        console.log('Could not set NOT NULL on password', e.message);
    }

    console.log('Adding unique constraint to name...');
    try {
        await db.execute(sql`ALTER TABLE users ADD CONSTRAINT users_name_unique UNIQUE (name)`);
    } catch (e: any) {
        console.log('Unique constraint on name might already exist or conflicting data', e.message);
    }

    process.exit(0);
}
migrate();
