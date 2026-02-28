import { useState, useRef } from 'react';
import { Mic, Play, Square, Users, Trash2 } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';

interface AudioPost {
    id: number;
    user: string;
    time: string;
    topic: string;
    audioUrl: string;
    duration: string;
}

const MOCK_POSTS: AudioPost[] = [
    { id: 1, user: 'Ramesh Farmer', time: '2 hrs ago', topic: 'Organic Fertilizer', audioUrl: '', duration: '0:45' },
    { id: 2, user: 'Suresh Carpenter', time: '5 hrs ago', topic: 'New Tools Shop', audioUrl: '', duration: '1:20' },
];

export default function Community() {
    const [posts, setPosts] = useState<AudioPost[]>(MOCK_POSTS);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const newPost: AudioPost = {
                    id: Date.now(),
                    user: 'You (Worker)',
                    time: 'Just now',
                    topic: 'Voice Note',
                    audioUrl: url,
                    duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
                };
                setPosts([newPost, ...posts]);
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);

            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);

            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <PageTransition>
            <div className="p-4 space-y-6 pt-10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Users className="text-purple-400" /> Samuday (Community)
                </h2>

                {/* Recorder */}
                <GlassCard className="text-center py-8 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/20 glass-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">Ask a Question</h3>
                        <p className="text-sm text-purple-300">Record your voice to share with others</p>
                    </div>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-6 rounded-full shadow-xl transition-all transform active:scale-95 ${isRecording
                            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                            : 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-110'
                            }`}
                    >
                        {isRecording ? <Square size={32} className="text-white fill-current" /> : <Mic size={32} className="text-white" />}
                    </button>

                    {isRecording && (
                        <p className="mt-4 font-mono text-red-400 font-bold">
                            {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </p>
                    )}
                </GlassCard>

                {/* Feed */}
                <div className="space-y-4">
                    {posts.map((post, index) => (
                        <GlassCard key={post.id} delay={index * 0.1} className="glass-card border-white/5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{post.user}</h3>
                                    <p className="text-xs text-slate-400">{post.time} • {post.topic}</p>
                                </div>
                                {post.user === 'You (Worker)' && (
                                    <button className="text-red-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {post.audioUrl ? (
                                <audio controls src={post.audioUrl} className="w-full h-10 opacity-80 hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="bg-slate-800/50 rounded-full p-2 flex items-center gap-3">
                                    <button className="bg-white/10 p-2 rounded-full shadow-sm text-white hover:bg-white/20 transition-colors">
                                        <Play size={16} className="fill-current" />
                                    </button>
                                    <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{post.duration}</span>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
}
