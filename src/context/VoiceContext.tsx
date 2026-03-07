import { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

interface VoiceContextType {
    isListening: boolean;
    transcript: string;
    isSpeaking: boolean;
    error: string | null;
    listen: () => void;
    speak: (text: string, lang?: string) => void;
    stopSpeak: () => void;
    setTranscript: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const speak = useCallback((text: string, lang = 'hi-IN') => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const stopSpeak = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    const listen = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition not supported.');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'mr-IN'; // Changed to Marathi

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            // Global VoiceContext Result
            setTranscript(text);
            setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            // Ignore benign timeout errors so we don't annoy the user
            if (event.error !== 'no-speech') {
                setError(event.error);
                setTimeout(() => setError(null), 4000); // Auto-clear after 4s
            }
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        try {
            recognition.start();
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setError("Failed to start microphone. Please check permissions.");
            setTimeout(() => setError(null), 4000);
        }
    }, []);

    return (
        <VoiceContext.Provider value={{ isListening, transcript, isSpeaking, error, listen, speak, stopSpeak, setTranscript }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoiceContext = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error('useVoiceContext must be used within a VoiceProvider');
    }
    return context;
};
