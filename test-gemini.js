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

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const payload = {
    contents: [{
        parts: [{ text: "Respond with the word 'SUCCESS'" }]
    }]
};

async function test() {
    try {
        console.log("Testing URL:", url.split('key=')[0] + 'key=HIDDEN');
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
