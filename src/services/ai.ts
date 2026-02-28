// src/services/ai.ts

/**
 * Service to interact with the AWS API Gateway which proxies
 * our requests to the AWS Lambda function invoking Amazon Bedrock (Claude 3).
 */

const API_GATEWAY_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL;

export async function askJanSevaAI(query: string, context: string = 'general'): Promise<string> {
    // 1. Check if the AWS environment variable is set
    if (!API_GATEWAY_URL) {
        console.warn("AWS_API_GATEWAY_URL is not set. Falling back to mock response.");
        return await generateMockResponse(query, context);
    }

    try {
        // 2. Make the HTTP request to the AWS Lambda function via API Gateway
        const response = await fetch(API_GATEWAY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, context }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AWS API Gateway Error: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch from AWS. Status: ${response.status}`);
        }

        // 3. Parse the JSON response
        const data = await response.json();

        // AWS Lambda code returns { response: "AI text here" }
        if (data && data.response) {
            return data.response;
        } else {
            console.error("Unexpected response format from AWS Lambda:", data);
            throw new Error("Invalid response format from AWS API Gateway");
        }

    } catch (error) {
        console.error("Error communicating with Amazon Bedrock via Lambda:", error);
        // 4. Offline / Error Fallback heuristic to ensure UI confidence
        return "Muaf kijiye, abhi humara server AWS Bedrock se connect nahi kar paa raha hai. Kripya thodi der baad koshish karein. (Sorry, our server is currently unable to connect to AWS Bedrock. Please try again later.)";
    }
}

// Temporary fallback function if AWS is not configured yet.
const generateMockResponse = async (query: string, context: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    const lowerQuery = query.toLowerCase();

    // Basic keyword matching for demo purposes
    if (lowerQuery.includes('job') || lowerQuery.includes('naukri') || lowerQuery.includes('kaam')) {
        return "Naukri portal mein aapke aas-paas ke sabhi naye avsar uplabdh hain. Aap kis tarah ka kaam dhundh rahe hain? Jaise ki: construction, driving, ya factory work.";
    }

    if (lowerQuery.includes('scheme') || lowerQuery.includes('yojna')) {
        return "Aapke state aur age ke anusar kayi sarkari yojnayein hain. PM Kisan Samman Nidhi aur Ayushman Bharat jaise yojnao ki jankari Yojna section me dekhe.";
    }

    if (lowerQuery.includes('health') || lowerQuery.includes('swasthya') || lowerQuery.includes('bimar')) {
        return "Swasthya samasya ke liye paas ke sarkaari haspatal me jayein. Ayushman Bharat yojna ke tahet aapko 5 lakh tak ka muft ilaaj mil sakta hai. Ye jankari Paramarsh section me uplabdh hain.";
    }

    // Default context-aware response
    if (context === 'jobs') {
        return "Hamare paas rozgar ke kai avsar hain. Kya aap apni skills ke anusar naukri dekhna chahenge?";
    } else if (context === 'schemes') {
        return "Sarkari yojnaon ki soochi yahan uplabdh hai. Apni yogyata check karne ke liye apni umar aur aay batayein.";
    } else if (context === 'issues') {
        return "Aap apni nagrik samasya yahan darj kara sakte hain. Kripya samasya ki jankari aur location dein.";
    }

    return "Namaste! Main JanSeva AI hoon. Main yojnao, rozgar, aur anya sarkari suvidhaon ke gyan me madad karne ke liye yahan hoon. Bataiay main aapki kya madad karu?";
};
