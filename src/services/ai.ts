import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getAIResponse(prompt: string): Promise<string> {
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Using mock response.");
        return mockResponse(prompt);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error (falling back to mock):", error);
        // Fallback to mock response so the user always gets a reply
        return mockResponse(prompt);
    }
}

function mockResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('job') || lower.includes('naukri') || lower.includes('rozgar')) return "Maine kuch rozgar ke avsar dhundhe hain. Kya aap unhe dekhna chahenge?";
    if (lower.includes('scheme') || lower.includes('yojna')) return "Sarkar ki nayi yojnayein aayi hain. Main aapko dikhata hoon.";
    if (lower.includes('weather') || lower.includes('mausam')) return "Aaj mausam saaf rahega, lekin kal barish ho sakti hai.";
    return "Ji, main aapki baat samajh gaya. Kya main aapko kuch aur jankari de sakta hoon?";
}
