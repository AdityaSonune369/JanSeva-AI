import { Mic, Square } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { VoiceVisualizer } from './ui/VoiceVisualizer';

interface VoiceShellProps {
    onCommand: (text: string) => void;
    children: React.ReactNode;
}

export default function VoiceShell({ children }: VoiceShellProps) {
    const { isListening, isSpeaking, transcript, listen, error, stopSpeak } = useVoice();

    // VoiceShell is now purely presentational for many cases
    // We remove the auto-clear effect so multiple listeners can see the transcript
    // unless onCommand is provided and handles it.

    // Actually, let's just expose the visualizer and mic.
    // The parent (App.tsx or Pages) will listen to transcript context.

    return (
        <div className="min-h-screen pb-[15rem] relative overflow-x-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-india-saffron/10 rounded-full blur-[100px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-india-green/10 rounded-full blur-[80px] mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-india-blue/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
            </div>

            {/* Content Wrapper - Explicit z-index to ensure interactivity */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Bottom Voice Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/40 backdrop-blur-[40px] border-t border-white/10 p-6 flex justify-center items-center z-50 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">
                {/* Live Transcript Display */}
                <div className="absolute bottom-36 bg-slate-900/80 backdrop-blur-2xl px-10 py-4 rounded-full text-white font-medium text-xl border border-white/20 shadow-[0_15px_50px_-5px_rgba(0,0,0,0.7)] pointer-events-none transition-all duration-500 ring-1 ring-white/5">
                    {transcript || isListening ? (
                        <span className="text-gradient-saffron tracking-wide">{transcript || "Listening..."}</span>
                    ) : (
                        <span className="tracking-wide text-white/90">Tap mic to speak</span>
                    )}
                </div>

                <div className="absolute left-6">
                    <VoiceVisualizer isListening={isListening} />
                </div>

                <button
                    onClick={listen}
                    className={`relative p-7 rounded-full transition-all duration-500 transform active:scale-95 ${isListening
                        ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)] border border-red-400/50'
                        : 'bg-gradient-to-br from-india-saffron to-saffron-600 shadow-[0_0_30px_rgba(255,153,51,0.5)] border border-white/30 hover:shadow-[0_0_50px_rgba(255,153,51,0.8)]'
                        } hover:-translate-y-1 z-10`}
                >
                    {isListening ? (
                        <div className="animate-pulse">
                            <Mic size={34} className="text-white drop-shadow-md" />
                            <span className="absolute -top-2 -right-2 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                            </span>
                        </div>
                    ) : (
                        <Mic size={34} className="text-white drop-shadow-md" />
                    )}
                </button>

                {isSpeaking && (
                    <button
                        onClick={stopSpeak}
                        className="absolute right-6 p-4 rounded-full glass-button hover:bg-red-500/80 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-red-300 hover:text-white flex items-center justify-center group"
                        title="Stop AI Voice"
                    >
                        <Square size={24} className="group-hover:scale-95 transition-transform fill-current" />
                    </button>
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
