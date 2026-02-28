import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VoiceContextType {
    isListening: boolean;
    transcript: string;
    isSpeaking: boolean;
    error: string | null;
    listen: () => void;
    speak: (text: string, lang?: string) => void;
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
        recognition.lang = 'hi-IN'; // Default to Hindi

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            console.log("Global VoiceContext Result:", text);
            setTranscript(text);
            setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        try {
            recognition.start();
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setError("Failed to start");
        }
    }, []);

    return (
        <VoiceContext.Provider value={{ isListening, transcript, isSpeaking, error, listen, speak, setTranscript }}>
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
