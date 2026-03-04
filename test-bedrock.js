import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

async function test() {
    try {
        const client = new BedrockRuntimeClient({ region: "us-east-1" });
        const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

        const claudePayload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 250,
            temperature: 0.7,
            system: "You are a helpful assistant.",
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: "Who are you?" }]
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(claudePayload)
        });

        console.log("Sending request to Bedrock...");
        const response = await client.send(command);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log("Success! Response text:", responseBody.content[0].text);
    } catch (error) {
        console.error("Bedrock SDK Error:");
        console.error(error);
    }
}

test();
