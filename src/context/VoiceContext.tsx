import { createContext, useState, useContext, useCallback, useEffect } from 'react';
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

    // Helper function to clean markdown and emojis before speaking
    const sanitizeTextForSpeech = (text: string) => {
        return text
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '') // Remove italic markdown
            .replace(/#/g, '') // Remove heading markdown
            .replace(/`/g, '') // Remove code markdown
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replaces links with just their text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis group 1
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove emojis group 2
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove emojis group 3
            .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, ''); // Remove dingbats
    };

    // Load voices ASAP since browsers load them asynchronously
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    const speak = useCallback((text: string, lang = 'mr-IN') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(true);

            const cleanText = sanitizeTextForSpeech(text);
            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Try to find a high-quality, non-robotic voice
            const voices = window.speechSynthesis.getVoices();
            // 1. Try Google's specific language voice (highest quality local)
            // 2. Try any exact match for the language code
            // 3. Try any loose match for the language code
            // 4. BIG FALLBACK: If Marathi is missing on the OS, fall back to Hindi (shares Devanagari script)
            let preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes(lang.split('-')[0])) ||
                voices.find(v => v.lang === lang) ||
                voices.find(v => v.lang.includes(lang.split('-')[0])) ||
                voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
                voices.find(v => v.lang.includes('hi-IN'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            } else {
                utterance.lang = lang; // Fallback to asking browser for language
            }

            // Adjust pitch/rate slightly for a warmer "Saarthi" tone if desired
            utterance.rate = 0.85;
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error("Speech Synthesis Error:", e);
                setIsSpeaking(false);
            };

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
            setError('Voice recognition is not supported in this browser. Please use Chrome or Edge for voice features.');
            setTimeout(() => setError(null), 5000);
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
