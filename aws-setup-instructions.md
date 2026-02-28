# JanSeva AI - AWS Backend Setup Instructions

To connect your React frontend to Amazon Bedrock, you need to create the backend infrastructure in AWS. Follow these exact steps using the code provided in `backend/bedrock_handler.js`.

## Prerequisites

1. **AWS Account:** You must have an active AWS account.
2. **Bedrock Model Access:**
    - Go to the AWS Console -> **Amazon Bedrock**.
    - In the left navigation pane, under **Bedrock configurations**, select **Model access**.
    - Click **Manage model access** and request access to **Anthropic Claude 3 Haiku**. It usually takes a few minutes to be granted.

## Step 1: Create the Lambda Function

1. Go to the AWS Console -> **AWS Lambda**.
2. Click **Create function**.
3. Select **Author from scratch**.
4. **Function name**: `janseva-bedrock-api`
5. **Runtime**: Select `Node.js 20.x` (or newer).
6. **Architecture**: `x86_64` (default).
7. Click **Create function**.

## Step 2: Add the Code & Permissions

1. In your new Lambda function, scroll down to the **Code source** section.
2. Open the `index.mjs` (or `index.js`) file and **paste the entire contents** of exactly what is in this repository's `backend/bedrock_handler.js` file.
3. Click the **Deploy** button to save the code.
4. **Grant Bedrock Permissions:**
    - Go to the **Configuration** tab of your Lambda function.
    - Select **Permissions** from the left sidebar.
    - Under **Execution role**, click the Role name (it will look like `janseva-bedrock-api-role-xyz`).
    - In the new IAM tab that opens, click **Add permissions** -> **Attach policies**.
    - Search for and attach the `AmazonBedrockFullAccess` policy. (For a production app, you would create a custom, strictly scoped policy, but for a hackathon, this is fastest).

## Step 3: Create the API Gateway (To connect to React)

1. Go back to the top of your Lambda function page.
2. In the **Function overview** diagram, click **+ Add trigger**.
3. Select **API Gateway**.
4. Select **Create a new API**.
5. **API type**: Select `HTTP API`.
6. **Security**: Select `Open` (Note: for a real app, you would add authentication here).
7. **Additional settings**: Ensure **Enable CORS** is checked (this is critical for React to communicate).
8. Click **Add**.

## Step 4: Get your API URL

1. You will now see the API Gateway attached to your Lambda function.
2. Click on the API endpoint URL (it will look something like `https://xyz123.execute-api.us-east-1.amazonaws.com/default/janseva-bedrock-api`).
3. **Copy this URL**.

## Step 5: Update the Frontend

1. Open this project in your code editor.
2. Open or create the `.env` file in the root directory.
3. Add the URL you copied:

    ```bash
    VITE_AWS_API_GATEWAY_URL="https://xyz123.execute-api.us-east-1.amazonaws.com/default/janseva-bedrock-api"
    ```

4. Restart your local Vite server (`npm run dev`). Your app is now connected to Amazon Bedrock!
