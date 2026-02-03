# JanSeva AI - Project Proposal & Requirements
>
> **Status:** Planning Phase | **Version:** Draft 1.0

## 1. Product Vision

**JanSeva AI** is proposed as a voice-first, AI-powered Progressive Web Application (PWA) designed to bridge the digital divide for the "next billion users" in India. The goal is to empower semi-urban and rural populations—specifically those with low digital literacy—to access employment opportunities, government schemes, expert advisory, community support, and civic issue reporting using natural language (Voice).

## 2. Target Audience

- **Primary**: Rural and semi-urban workers, daily wage laborers, and citizens with limited reading/typing skills.
- **Secondary**: NGOs and community leaders assisting citizens.
- **Language Focus**: Hindi (primary), Hinglish (conversational), and regional dialects (future scope).

## 3. Core Features & Functional Requirements

### 3.1. Voice Interface (Core)

- **Global Voice Command**: Users shall be able to navigate to any section of the app using voice commands (e.g., "Naukri chahiye", "Yojna dikhao").
- **Voice-to-Text (STT)**: The system will utilize the Web Speech API for real-time transcription.
- **Text-to-Speech (TTS)**: Important information and AI responses will be read aloud in Hindi/English.
- **Wake Word / Activation**: One-tap activation to start listening.

### 3.2. Proposed Application Modules

#### A. Rozgar (Jobs)

- **Job Search**: Voice-enabled search for jobs (e.g., "Driver job in Delhi").
- **Listing**: Simple, high-contrast cards for job postings.
- **Apply**: Simplified one-tap application process.

#### B. Yojna (Government Schemes)

- **Scheme Discovery**: Filtering schemes by user eligibility via voice conversation.
- **Details**: Simplified explanation of benefits.

#### C. Paramarsh (Advisory)

- **AI Expert**: Users can ask natural language questions (Agriculture, Health, Legal).
- **Contextual Responses**: AI to provide accurate, summarized answers.

#### D. Samuday (Community)

- **Connect**: Platform for peer-to-peer sharing.
- **Updates**: Local news and announcements.

#### E. Samasya (Issues)

- **Reporting**: Report civic issues by voice description.
- **Evidence**: Future capability to upload photos/videos.

### 3.3. Artificial Intelligence Strategy

- **Conversational Agent**: Integration with Gemini AI to process unstructured queries.
- **Context Awareness**: The AI will be designed to understand page-level context.

## 4. Non-Functional Requirements

- **Accessibility**: High-contrast UI and voice-first navigation strategies.
- **Performance**: Optimized for 2G/3G networks with Offline PWA capabilities.
- **UI/UX Strategy**:
  - **Language**: Hinglish labels for familiarity.
  - **Aesthetics**: Modern "Glassmorphism" with dark mode for visual comfort.
- **Security**: Strict handling of microphone permissions.

## 5. Deployment Plan

- **Platform**: Web (PWA) installable on Android/iOS.
- **Hosting**: Static edge hosting (e.g., Vercel/Netlify).
