# JanSeva AI

**JanSeva AI** is a comprehensive, voice-first application designed to break down digital barriers and provide accessible, multilingual access to essential services. Built with a modern tech stack and focusing on inclusivity, it bridges the gap between technology and everyday needs.

This project was developed for the hackathon submission to showcase an ecosystem comprising different AI-driven features for social and community welfare.

## 🚀 Live Demo

*(Insert Live Link here if deployed, e.g., on Vercel)*

## ✨ Key Features

- **Voice-First Interface**: Navigate the entire platform, input data, and receive spoken responses using advanced Speech-to-Text (STT) and Text-to-Speech (TTS) integrations, making the application accessible to users with low literacy or visual impairments.
- **Paramarsh (Advisory & Healthcare)**: Upload an image (e.g., of a crop or a health concern) and receive AI-driven multimodal analysis using **AWS Bedrock**. Generates actionable insights, context-aware advice, and treatment plans verbally and visually.
- **Yojna & Rozgar (Schemes & Jobs)**: AI-powered search for government schemes and employment opportunities tailored to the user's demographic and skills.
- **Community Chatbot**: Engage with a personalized AI assistant that dynamically adjusts its response detail and complexity based on user preferences. Interactive features include pausing AI generation mid-response.
- **Firebase Backend**: Real-time user authentication, secure profile management, and scalable data storage.
- **Mesmerizing UI/UX**: Designed using Tailwind CSS and Framer Motion, the application boasts a premium, glassmorphism-inspired aesthetic with highly interactive and engaging visual themes (like neon colors, futuristic glows, and smooth transitions).

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling & Animation**: Tailwind CSS v4, Framer Motion, Lucide React
- **Backend Services**: Firebase (Auth, Firestore), AWS API Gateway & Lambda (Proxy for Gemini AI)
- **AI/ML**: Google Gemini (via AWS Proxy), AWS Bedrock Runtime (for Multimodal/Visual analysis)

## 📦 Setting Up Locally

To run this project locally on your machine, follow these steps:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Firebase project with Authentication and Firestore enabled.
- AWS Account with Bedrock capabilities configured for the image analysis features.

### 2. Clone the repository

```bash
git clone https://github.com/AdityaSonune369/janseva-ai.git
cd janseva-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add your keys (refer to `.env.example` if applicable, or include your Firebase and AWS proxy URLs):

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_GEMINI_PROXY_URL="your_aws_lambda_proxy_url"
```

### 5. Run the Local Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📂 Project Structure Overview

```text
/src
 ├── /components    # Reusable UI components (buttons, headers, navigation)
 ├── /context       # React context for global state (e.g., VoiceContext)
 ├── /pages         # Main view pages (Dashboard, Auth, Advisory, Chatbot)
 ├── /utils         # Helper functions and configurations (Firebase init)
 ├── App.tsx        # Application root and routing
 └── index.css      # Global Tailwind styles
/backend          # AWS Lambda proxy scripts and Bedrock testing configurations
```

## 🤝 Contribution

Contributions are always welcome! Feel free to fork the repository, make your changes, and submit a PR for review.

## 📝 License

This project is open-source and available under the MIT License.
