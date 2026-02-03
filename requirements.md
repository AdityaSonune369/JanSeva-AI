# JanSeva AI - Requirements Document

## 1. Product Vision
**JanSeva AI** is a voice-first, AI-powered Progressive Web Application (PWA) designed to bridge the digital divide for the "next billion users" in India. It empowers semi-urban and rural populations—specifically those with low digital literacy—to access employment opportunities, government schemes, expert advisory, community support, and civic issue reporting using natural language (Voice).

## 2. Target Audience
- **Primary**: Rural and semi-urban workers, daily wage laborers, and citizens with limited reading/typing skills.
- **Secondary**: NGOs and community leaders assisting citizens.
- **Language Focus**: Hindi (primary), Hinglish (conversational), and regional dialects (future scope).

## 3. Core Features & Functional Requirements

### 3.1. Voice Interface (Core)
- **Global Voice Command**: Users must be able to navigate to any section of the app using voice commands (e.g., "Naukri chahiye", "Yojna dikhao").
- **Voice-to-Text (STT)**: Real-time transcription of user speech using Web Speech API.
- **Text-to-Speech (TTS)**: The system should read out important information and AI responses in Hindi/English.
- **Wake Word / Activation**: One-tap activation (or optional wake word) to start listening.

### 3.2. Application Modules
#### A. Rozgar (Jobs)
- **Job Search**: Users can search for jobs by voice (e.g., "Driver job in Delhi").
- **Listing**: Display simple, high-contrast cards for job postings.
- **Apply**: One-tap application process.

#### B. Yojna (Government Schemes)
- **Scheme Discovery**: Filter schemes by user eligibility (gender, age, caste, income) via voice conversation.
- **Details**: Simplified explanation of benefits and required documents.

#### C. Paramarsh (Advisory)
- **AI Expert**: Users can ask questions related to agriculture, health, or legal rights.
- **Contextual Responses**: AI provides accurate, summarized answers powered by LLMs (Gemini).

#### D. Samuday (Community)
- **Connect**: Platform for peer-to-peer sharing of information.
- **Updates**: Local news and announcements.

#### E. Samasya (Issues)
- **Reporting**: Report civic issues (potholes, water supply) by voice description.
- **Evidence**: (Future Scope) Ability to upload photos/videos of the issue.

### 3.3. Artificial Intelligence
- **Conversational Agent**: Integrated Gemini AI to process unstructured queries and act as a conversational partner.
- **Context Awareness**: The AI should understand the context of the current page (e.g., answering job-related questions while on the Jobs page).

## 4. Non-Functional Requirements
- **Accessibility**: High-contrast UI, large touch targets, and complete voice navigation for visually impaired or illiterate users.
- **Performance**:
    - Fast load times on 2G/3G networks.
    - Offline capabilities (PWA) for viewing previously loaded content.
- **UI/UX**:
    - **Language**: Hinglish labels (Rozgar, Yojna) for immediate familiarity.
    - **Aesthetics**: "Glassmorphism" design with dark mode to reduce eye strain and save battery.
    - **Feedback**: Visual indicators for "Listening", "Processing", and "Speaking".
- **Security**: Secure handling of microphone permissions and user data.

## 5. Deployment
- **Platform**: Web (PWA) installable on Android/iOS.
- **Hosting**: Static edge hosting (projects like Vercel/Netlify).
