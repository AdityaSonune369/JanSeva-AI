export const handler = async (event) => {
    console.log("Event Received:", JSON.stringify(event, null, 2));

    // Handle CORS Preflight (OPTIONS) request automatically
    if (event.httpMethod === 'OPTIONS' || (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS')) {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: "CORS preflight successful" })
        };
    }

    try {
        const body = event.body ? JSON.parse(event.body) : event;
        const { query, context = "general", imageBase64 } = body;

        if (!query && !imageBase64) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing 'query' or 'image' in request body" })
            };
        }

        let systemPrompt = `You are JanSeva AI, a highly knowledgeable, respectful, and helpful voice assistant designed for citizens in India. 
Your primary goal is to provide accurate information about government schemes (Yojna), jobs (Rozgar), and general advisory (Agriculture, Health, Legal).
However, you are also encouraged to answer ANY question the user asks, even if it is out of scope. 
Current Context: The user is currently in the '${context}' section of the app.
CRITICAL INSTRUCTION ON TONE: You MUST speak like a real human voice assistant (like Siri, Alexa, or a helpful phone operator). START your answers directly by talking to the user (e.g., "Sure, I can tell you about that!"). Do NOT structure your answers like a Wikipedia article, an essay, or a Google Search result. Do NOT use bullet points, numbered lists, or formal essay structures. Talk naturally, friendly, and conversationally in paragraphs. Keep your sentences easy to listen to. Use English or Hinglish as appropriate.`;

        if (context === "samasya" && imageBase64) {
            systemPrompt = `You are an expert agricultural AI. The user has uploaded an image of a leaf or crop. 
Analyze the image specifically for signs of diseases, pests, or nutrient deficiencies.
If you identify an issue, state the name of the disease clearly and provide a short, highly recommended treatment or action (e.g., "Apply Copper Oxychloride").
If the image is NOT of a plant or crop (e.g., a mountain, a person, a dog), politely inform the user that you can only analyze crop and plant images.
Keep your response concise and structured like a diagnosis card.`;
        }

        const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
        const client = new BedrockRuntimeClient({ region: "us-east-1" });

        // Using Amazon's 1st party Nova model which supports multimodal input
        const modelId = "amazon.nova-lite-v1:0";

        let messageContent = [];

        if (imageBase64) {
            // Nova expects images to be passed in a specific format within the content array
            // Format: Base64 string without the data URI prefix
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

            // Map common MIME types to formats supported by Nova ('png', 'jpeg', 'gif', 'webp')
            let format = 'jpeg';
            if (mimeType.includes('png')) format = 'png';
            if (mimeType.includes('gif')) format = 'gif';
            if (mimeType.includes('webp')) format = 'webp';

            messageContent.push({
                image: {
                    format: format,
                    source: {
                        bytes: base64Data
                    }
                }
            });
        }

        if (query) {
            messageContent.push({ text: query });
        } else if (imageBase64) {
            messageContent.push({ text: "Please analyze this image." });
        }

        const novaPayload = {
            system: [{ text: systemPrompt }],
            messages: [
                {
                    role: "user",
                    content: messageContent
                }
            ],
            inferenceConfig: {
                max_new_tokens: 250,
                temperature: 0.7
            }
        };

        const command = new InvokeModelCommand({
            modelId: modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(novaPayload)
        });

        const response = await client.send(command);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        let aiText = "Sorry, I could not generate a response.";
        if (responseBody.output && responseBody.output.message && responseBody.output.message.content) {
            aiText = responseBody.output.message.content[0].text.trim();
        }

        // Clean up Markdown symbols so the Voice engine doesn't read them out loud literally
        const sanitizedText = aiText
            .replace(/[*#_=~]+|\[|\]/g, '') // Remove *, #, _, =, ~, [, ]
            .replace(/\n\s*\n/g, '\n')      // Remove excessive blank lines
            .trim();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                response: sanitizedText,
            }),
        };

    } catch (error) {
        console.error("Error invoking Bedrock API:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to process query with AI service.", details: error.message }),
        };
    }
};
