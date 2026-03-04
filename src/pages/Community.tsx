import { useState, useRef, useEffect } from 'react';
import { Mic, Play, Square, Users, Trash2 } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface AudioPost {
    id: string;
    user: string;
    userId: string;
    time: string;
    createdAt?: any;
    topic: string;
    audioUrl?: string;
    duration: string;
}

export default function Community() {
    const [posts, setPosts] = useState<AudioPost[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const { currentUser } = useAuth();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // Listen to posts in Firestore
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData: AudioPost[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                postsData.push({
                    id: doc.id,
                    user: data.user,
                    userId: data.userId,
                    time: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" }) : 'Just now',
                    topic: data.topic,
                    audioUrl: data.audioUrl,
                    duration: data.duration,
                    createdAt: data.createdAt
                });
            });
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, []);

    const uploadBase64AndCreatePost = async (audioBlob: Blob, durationStr: string) => {
        if (!currentUser) return;

        try {
            // For hackathon simplicity, we convert audio Blob to base64 and save directly in Firestore document
            // In production, we would use Firebase Storage and save the URL in Firestore
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result;

                await addDoc(collection(db, 'posts'), {
                    user: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous Worker',
                    userId: currentUser.uid,
                    createdAt: serverTimestamp(),
                    topic: 'Voice Note',
                    audioUrl: base64Audio,
                    duration: durationStr
                });
            };
        } catch (error) {
            console.error("Error creating post", error);
        }
    };

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
                const durationStr = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`;

                uploadBase64AndCreatePost(blob, durationStr);
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

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'posts', id));
        } catch (error) {
            console.error("Error deleting post", error);
        }
    };

    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                    <div className="bg-purple-500/20 p-4 rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-2">
                        <Users className="text-purple-400 drop-shadow-lg" size={40} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-pink-300 tracking-tight">
                        Samuday
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">Community Voice Feed</p>
                </div>

                {/* Recorder Dock */}
                <GlassCard className="glass-card text-center p-8 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/20 shadow-[0_8px_32px_0_rgba(168,85,247,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <div className="mb-8 relative z-10">
                        <h3 className="text-2xl font-extrabold text-white tracking-wide">Share Your Voice</h3>
                        <p className="text-base text-purple-200/80 mt-2 font-medium">Record a question or update for the community</p>
                    </div>

                    <div className="flex flex-col items-center justify-center relative">
                        {isRecording && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
                                <div className="w-40 h-40 bg-red-500/10 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        )}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`relative p-8 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 z-10 flex items-center justify-center ${isRecording
                                ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-pulse border-2 border-red-300'
                                : 'bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-110 hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] border border-purple-300/50'
                                }`}
                        >
                            {isRecording ? <Square size={36} className="text-white fill-current drop-shadow-md" /> : <Mic size={36} className="text-white drop-shadow-md" />}
                        </button>

                        {isRecording && (
                            <div className="mt-8 flex flex-col items-center">
                                <p className="font-mono text-3xl text-red-400 font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                </p>
                                <div className="flex gap-1 mt-4 h-6 items-center">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-1.5 bg-red-400 rounded-full animate-waveform" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100 + 20}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-300 uppercase tracking-widest text-sm">Recent Broadcasts</h3>
                        <span className="text-purple-400 font-bold text-sm bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">Live</span>
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center p-8 text-slate-400">
                            No posts yet. Be the first to share!
                        </div>
                    )}

                    {posts.map((post, index) => (
                        <GlassCard key={post.id} delay={index * 0.05} className="glass-card p-6 border-slate-700/50 hover:border-purple-500/40 transition-colors group">
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex gap-3 items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                                        <span className="text-slate-300 font-bold text-lg">{post.user.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-2">
                                            {post.user}
                                            {currentUser?.uid === post.userId && <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-md border border-purple-500/30 font-bold">You</span>}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5">{post.time}</p>
                                    </div>
                                </div>
                                {currentUser?.uid === post.userId ? (
                                    <button onClick={() => handleDelete(post.id)} className="text-slate-500 hover:text-red-400 p-2 glass-button rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={20} />
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-purple-300 bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-500/20">
                                        {post.topic}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-300 mb-4 font-medium tracking-wide px-2">{`Discussing: ${post.topic}`}</p>

                            {post.audioUrl ? (
                                <audio controls src={post.audioUrl} className="w-full h-14 mt-2 opacity-90 hover:opacity-100 transition-opacity rounded-2xl bg-black/40 border border-white/5 shadow-inner" />
                            ) : (
                                <div className="bg-slate-900/50 border border-white/5 rounded-[1.5rem] p-4 flex items-center gap-4 group-hover:bg-slate-800/50 transition-colors duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                                    <button className="bg-gradient-to-br from-purple-500 to-indigo-600 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border border-purple-400/50 flex-shrink-0">
                                        <Play size={24} className="fill-current ml-1" />
                                    </button>
                                    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden shadow-inner cursor-pointer relative">
                                        <div className="h-full w-1/3 bg-gradient-to-r from-purple-400 to-indigo-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] relative"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-3 h-3 bg-white rounded-full shadow-md"></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 w-10 text-right">{post.duration}</span>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
}
