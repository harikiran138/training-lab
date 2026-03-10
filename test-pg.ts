import { Client } from 'pg';

async function testConnection() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'password', // trying common default
    });

    try {
        await client.connect();
        console.log('✅ Connected to Postgres successfully');
        const res = await client.query('SELECT datname FROM pg_database');
        console.log('Databases:', res.rows.map(r => r.datname));
        await client.end();
    } catch (err) {
        console.error('❌ Failed to connect to Postgres:', err.message);
        process.exit(1);
    }
}

testConnection();
