import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageSquare, VolumeX } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useVoice } from '../hooks/useVoice';
import { askJanSevaAI } from '../services/ai';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Namaste! Main JanSeva AI Saarthi hoon. Main sarkari yojanaon, nagrik samasyaon, aur is app ke features ke baare mein aapki madad kar sakta hoon. Aaj main aapki kya sahayata karu?',
            sender: 'ai'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { transcript, setTranscript, speak, isSpeaking, stopSpeak } = useVoice();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Handle voice input globally for this page
    useEffect(() => {
        if (!transcript) return;

        // If there's a voice transcript and we're on the Chatbot page, use it as input
        setInput(transcript);
        handleSend(transcript);
        setTranscript(''); // Clear global transcript after using it
    }, [transcript, setTranscript]);

    const handleSend = async (textToSend: string = input) => {
        if (!textToSend.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = "You are JanSeva Saarthi. You are an expert on Indian government schemes, agriculture, and public issues.";

            // Models have a recency bias. Putting instructions AFTER the query forces them to pay attention.
            const enforcedQuery = `User Question: "${textToSend}"

Please provide a helpful, detailed answer to the question above.

--- CRITICAL SYSTEM INSTRUCTIONS (DO NOT IGNORE) ---
1. TRANSLATION: You must identify the language of the User Question. If it is in Marathi (e.g., words like 'kay ahe', 'kasa'), your ENTIRE response MUST be in Marathi (मराठी लिपी). If it is in Hindi, your ENTIRE response MUST be in Hindi (हिंदी लिपि). If English, use English.
2. FORMATTING: You must structure your response using XML tags exactly like this:
<voice>
Write a VERY SHORT 1-sentence summary here in the correct language. DO NOT write the word "VOICE:" or "SUMMARY:". Just write the sentence.
</voice>
<text>
Write the detailed, multi-paragraph response here in the correct language.
</text>`;

            const response = await askJanSevaAI(enforcedQuery, context);

            // Parse out the voice portion and the text portion using XML tags
            let spokenText = response;
            let writtenText = response;

            const voiceMatch = response.match(/<voice>([\s\S]*?)<\/voice>/i);
            const textMatch = response.match(/<text>([\s\S]*?)<\/text>/i);

            if (voiceMatch && voiceMatch[1]) {
                spokenText = voiceMatch[1].trim();
            }

            if (textMatch && textMatch[1]) {
                writtenText = textMatch[1].trim();
            } else if (voiceMatch) {
                // If it provided <voice> but forgot <text>, strip the voice tag from the output
                writtenText = response.replace(/<voice>([\s\S]*?)<\/voice>/i, '').trim();
            } else {
                // Extreme fallback if Claude completely fails formatting
                const bracketMatch = response.match(/\[VOICE:\s*(.*?)\]/i);
                if (bracketMatch && bracketMatch[1]) {
                    spokenText = bracketMatch[1].trim();
                    writtenText = response.replace(/\[VOICE:\s*(.*?)\]/i, '').trim();
                } else if (response.includes('VOICE:')) {
                    const fallbackSplit = response.split('VOICE:');
                    if (fallbackSplit.length > 1) {
                        const afterVoice = fallbackSplit[1].trim();
                        const firstSentenceEnd = afterVoice.indexOf('.');
                        if (firstSentenceEnd !== -1) {
                            spokenText = afterVoice.substring(0, firstSentenceEnd + 1).trim();
                            writtenText = afterVoice.substring(firstSentenceEnd + 1).trim();
                        }
                    }
                }
            }

            // AGGRESSIVE CLEANUP: Remove "VOICE:" or "SUMMARY:" if the AI still stubbornly included it inside the tags
            spokenText = spokenText.replace(/^(VOICE:|SUMMARY:|Voice:|Summary:|voice:|summary:)\s*/i, '').trim();
            writtenText = writtenText.replace(/^(VOICE:|SUMMARY:|Voice:|Summary:|voice:|summary:)\s*/i, '').trim();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: writtenText,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMessage]);
            speak(spokenText); // Read only the short summary out loud
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Maaf kijiye, mujhe abhi uttar dene mein samasya ho rahi hai. Kripya dubaara koshish karein.",
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="flex flex-col h-screen max-h-[100dvh] pt-12 pb-[140px] px-4 overflow-hidden relative">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 mb-6 shrink-0 relative z-10">
                    <div className="bg-indigo-500/20 p-4 rounded-full border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-2">
                        <MessageSquare className="text-indigo-400 drop-shadow-lg" size={36} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-tight">
                        JanSeva Saarthi
                    </h2>
                    <p className="text-slate-400 font-medium text-sm tracking-wide">Your Dedicated Guide for Schemes & Issues</p>
                </div>

                {/* Chat Area */}
                <GlassCard className="flex-1 overflow-y-auto p-4 mb-4 bg-slate-900/40 border border-indigo-500/20 rounded-t-[30px] rounded-b-[20px] shadow-inner relative flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${msg.sender === 'user'
                                    ? 'bg-blue-500/30 '
                                    : 'bg-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                    }`}>
                                    {msg.sender === 'user' ? <User size={16} className="text-blue-300" /> : <Bot size={16} className="text-indigo-300" />}
                                </div>
                                <div className={`p-4 rounded-2xl ${msg.sender === 'user'
                                    ? 'bg-blue-600/40 text-blue-50 border border-blue-500/30 rounded-tr-sm'
                                    : 'bg-slate-800/60 text-slate-200 border border-indigo-500/20 rounded-tl-sm backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                    }`}>
                                    <p className="leading-relaxed text-[15px]">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex gap-3 max-w-[85%] flex-row">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center mt-1">
                                    <Bot size={16} className="text-indigo-300 animate-pulse" />
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-800/60 border border-indigo-500/20 rounded-tl-sm backdrop-blur-md flex items-center gap-1">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </GlassCard>

                {/* Input Area */}
                <div className="shrink-0 relative z-20">
                    {isSpeaking && (
                        <div className="flex justify-center mb-3 animate-fade-in">
                            <button
                                onClick={stopSpeak}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-full px-5 py-2 flex items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all active:scale-95"
                            >
                                <VolumeX size={16} /> Stop Speaking
                            </button>
                        </div>
                    )}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type or use the mic to ask..."
                            className="flex-1 bg-slate-800/60 border border-indigo-500/30 rounded-full px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500 rounded-full h-14 w-14 flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0 group active:scale-95"
                        >
                            <Send className="text-white transform translate-x-[-1px] translate-y-[1px] group-active:scale-90 transition-transform" size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}
