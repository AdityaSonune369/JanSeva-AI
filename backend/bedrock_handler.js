import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client
// The AWS SDK automatically picks up credentials from the Lambda environment
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
    console.log("Event Received:", JSON.stringify(event, null, 2));

    try {
        // 1. Parse the request body
        // When using API Gateway proxy integration, the body is a string
        const body = event.body ? JSON.stringify(event.body) : event;
        const { query, context = "general" } = body;

        if (!query) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" }, // CORS
                body: JSON.stringify({ error: "Missing 'query' in request body" })
            };
        }

        // 2. Format the prompt for Anthropic Claude 3 Haiku
        const systemPrompt = `You are JanSeva AI, a helpful, respectful, and honest voice assistant designed for rural and semi-urban citizens in India. 
Your primary goal is to provide accurate information about government schemes (Yojna), jobs (Rozgar), and general advisory (Agriculture, Health, Legal).
Current Context: The user is currently in the '${context}' section of the app.
Please keep your answers extremely concise (1-3 sentences max) as they will be read aloud via Text-to-Speech. Use simple English or Hinglish if appropriate.`;

        const claudePayload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 250,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: query
                        }
                    ]
                }
            ],
            temperature: 0.7,
            top_p: 0.9,
        };

        // 3. Prepare the Bedrock API Command
        // Model ID for Claude 3 Haiku is typically: anthropic.claude-3-haiku-20240307-v1:0
        // Make sure you have requested access to this model in your Bedrock console
        const command = new InvokeModelCommand({
            contentType: "application/json",
            body: JSON.stringify(claudePayload),
            modelId: "anthropic.claude-3-haiku-20240307-v1:0",
            accept: "application/json",
        });

        // 4. Invoke the Model
        const response = await client.send(command);

        // 5. Parse the Response
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiText = responseBody.content[0].text;

        // 6. Return standard API Gateway response
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work from the React frontend
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                response: aiText,
            }),
        };

    } catch (error) {
        console.error("Error invoking Bedrock:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to process query with AI service.", details: error.message }),
        };
    }
};
