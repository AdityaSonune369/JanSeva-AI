import { useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { VoiceVisualizer } from './ui/VoiceVisualizer';

interface VoiceShellProps {
    onCommand: (text: string) => void;
    children: React.ReactNode;
}

export default function VoiceShell({ onCommand, children }: VoiceShellProps) {
    const { isListening, isSpeaking, transcript, listen, setTranscript, error } = useVoice();

    // VoiceShell is now purely presentational for many cases
    // We remove the auto-clear effect so multiple listeners can see the transcript
    // unless onCommand is provided and handles it.

    // Actually, let's just expose the visualizer and mic.
    // The parent (App.tsx or Pages) will listen to transcript context.

    return (
        <div className="min-h-screen pb-24 relative overflow-x-hidden">
            {/* Content Wrapper - Explicit z-index to ensure interactivity */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Bottom Voice Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-white/10 p-4 flex justify-center items-center shadow-2xl z-50">
                {/* Live Transcript Display */}
                <div className="absolute bottom-28 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white font-medium text-lg border border-white/20 shadow-lg pointer-events-none transition-opacity duration-300">
                    {transcript || isListening ? (transcript || "Listening...") : "Tap mic to speak"}
                </div>

                <div className="absolute left-6">
                    <VoiceVisualizer isListening={isListening} />
                </div>

                <button
                    onClick={listen}
                    className={`relative p-6 rounded-full transition-all transform active:scale-95 ${isListening
                        ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'bg-gradient-to-r from-india-saffron to-saffron-600 shadow-[0_0_20px_rgba(255,153,51,0.5)]'
                        } hover:scale-105`}
                >
                    {isListening ? (
                        <div className="animate-pulse">
                            <Mic size={32} className="text-white" />
                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        </div>
                    ) : (
                        <Mic size={32} className="text-white" />
                    )}
                </button>

                {isSpeaking && (
                    <div className="absolute right-6 animate-bounce text-india-green">
                        <Volume2 size={24} />
                    </div>
                )}
            </div>

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-4 py-2 rounded-full text-sm shadow-xl z-50">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
