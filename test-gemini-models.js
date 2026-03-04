import fs from 'fs';

let apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    try {
        const envFile = fs.readFileSync('.env', 'utf-8');
        const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) apiKey = match[1].replace(/[\r\n]+/g, '').trim();
    } catch (e) { }
}

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function test() {
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
