# JanSeva AI - Design Document

## 1. System Architecture

### 1.1. Technology Stack
- **Frontend Framework**: React 19 with TypeScript.
- **Build Tool**: Vite (for fast development and built-in HMR).
- **Styling**: Tailwind CSS (Utility-first) + Custom CSS Variables.
- **Animations**: Framer Motion (for smooth page transitions and micro-interactions).
- **Icons**: Lucide React.
- **AI Service**: Google Gemini API via `@google/generative-ai`.
- **PWA Support**: `vite-plugin-pwa` for offline capabilities and installation.

### 1.2. Architecture Diagram (Conceptual)
```mermaid
graph TD
    User((User)) -->|Voice/Touch| App[VoiceShell / App]
    App -->|Transcript| VoiceContext[Voice Provider]
    VoiceContext -->|Command| Router[React Router]
    
    subgraph Context Layer
    VoiceContext -- Web Speech API --> Browser[Browser Speech Engine]
    end
    
    subgraph Services
    AIService[AI Service (Gemini)]
    end
    
    Router -->|Render| Page[Active Page]
    Page -->|Query| AIService
    AIService -->|Response| Page
    Page -->|Speak| VoiceContext
```

## 2. Component Design

### 2.1. Core Components
- **VoiceProvider (`context/VoiceContext.tsx`)**: The central nervous system of the app. It manages:
    - `listen()`: Triggers Web Speech API.
    - `speak()`: Triggers Speech Synthesis API.
    - `transcript`: Global state of what the user just said.
- **VoiceShell (`components/VoiceShell.tsx`)**: Wraps the main layout. Contains the permanent "Mic" button and visualizers for voice activity.
- **AppContent (`App.tsx`)**: Handles global command routing (e.g., specific keywords like "Jobs" or "Home" trigger navigation).

### 2.2. Page Modules
- **Dashboard**: Grid layout with high-level entry points (Rozgar, Yojna, etc.).
- **Jobs / Schemes / Community**: Listing pages with card-based layouts.
- **Advisory**: Chat-like interface integrated with the AI service.

## 3. Data Flow & AI Integration

### 3.1. Voice Command Flow
1. User taps mic -> `VoiceContext` starts listening.
2. Resulting text is stored in `transcript`.
3. `App.tsx` effect hook watches `transcript`.
4. If keyword matches (e.g., "naukri"), `useNavigate` serves the new route.
5. `transcript` is cleared to prevent double-firing.

### 3.2. Contextual AI
- **Service**: `src/services/ai.ts` exports `getAIResponse(prompt)`.
- **Fallback**: If API key is missing or network fails, a mock response system ensures the user is never left hanging.
- **Usage**: Pages like `Advisory` call this service with user queries combined with prompt engineering (e.g., "Act as an agricultural expert...").

## 4. UI/UX Design System

### 4.1. Visual Theme
- **Glassmorphism**: Translucent cards (`bg-white/10`, `backdrop-blur`) against a dark gradient background.
- **Color Coding**:
    - **Blue**: Jobs (Trust/Professionalism)
    - **Green**: Schemes (Growth/Prosperity)
    - **Yellow**: Advisory (Warning/Attention/Intellect)
    - **Purple**: Community (Solidarity)
- **Typography**: Clean, sans-serif fonts suitable for Hindi and English.

### 4.2. Interaction Design
- **Micro-interactions**: Buttons scale down on click (`active:scale-95`).
- **Transitions**: Pages fade in/out (`AnimatePresence`) to smooth out navigation jarring.
- **Visual Feedback**:
    - **Pulse Animation**: When the system is listening.
    - **Spinning/Loading**: When AI is processing.

## 5. Security & Privacy
- **Microphone Access**: Requested only when necessary.
- **API Keys**: Stored in `.env` (Vite environment variables) and not exposed in client bundles (though care must be taken with public API keys in PWAs).
