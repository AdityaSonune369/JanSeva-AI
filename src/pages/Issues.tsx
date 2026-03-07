import { Camera, CheckCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Report {
    id: string;
    imageBase64: string;
    result: string;
    createdAt: any;
    status: 'analyzed' | 'pending';
}

export default function Issues() {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [history, setHistory] = useState<Report[]>([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Fetch user's previous reports from Firestore
        const q = query(
            collection(db, 'issues'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData: Report[] = [];
            snapshot.forEach((doc) => {
                reportsData.push({ id: doc.id, ...doc.data() } as Report);
            });
            setHistory(reportsData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                setImage(base64);
                analyzeImage(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveReportToFirebase = async (base64Image: string, analysisResult: string) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'issues'), {
                userId: currentUser.uid,
                imageBase64: base64Image,
                result: analysisResult,
                createdAt: serverTimestamp(),
                status: 'analyzed'
            });
        } catch (error) {
            console.error("Error saving issue to Firestore:", error);
        }
    };

    const analyzeImage = async (base64Image: string) => {
        setAnalyzing(true);
        try {
            const apiEndpoint = import.meta.env.VITE_AWS_API_GATEWAY_URL;
            if (!apiEndpoint) {
                console.warn("VITE_AWS_API_GATEWAY_URL is not defined in .env. Using mock response.");
                setTimeout(() => {
                    setAnalyzing(false);
                    const mockResult = "Early Blight detected on Tomato leaf. Recommended: Apply Copper Oxychloride.";
                    setResult(mockResult);
                    saveReportToFirebase(base64Image, mockResult);
                }, 2500);
                return;
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: 'samasya',
                    imageBase64: base64Image
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            setResult(data.response);

            // Save to Firebase
            saveReportToFirebase(base64Image, data.response);

        } catch (error) {
            console.error("Error analyzing image:", error);
            setResult("Unable to analyze image at this time. Please try again later.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                    <div className="bg-red-500/20 p-4 rounded-full border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-2">
                        <Camera className="text-red-400 drop-shadow-lg" size={40} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-orange-400 tracking-tight">
                        Samasya
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">AI Crop Doctor & Issue Reporting</p>
                </div>

                {!image ? (
                    <div className="space-y-6">
                        <GlassCard className="border-2 border-dashed border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 text-center py-16 px-6 glass-card hover:bg-slate-800/60 hover:border-red-500/40 transition-all duration-500 group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleCapture}
                                className="hidden"
                                id="camera-input"
                            />
                            <label htmlFor="camera-input" className="cursor-pointer flex flex-col items-center relative z-10">
                                <div className="relative mb-8">
                                    <div className="absolute -inset-6 border-2 border-red-500/0 group-hover:border-red-500/50 transition-colors duration-500 rounded-3xl z-0 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl"></div>
                                    </div>

                                    <div className="bg-gradient-to-br from-red-500 to-orange-600 p-6 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] group-hover:scale-110 group-active:scale-95 transition-all duration-500 ring-4 ring-red-500/20 group-hover:ring-red-500/40 relative z-10">
                                        <Camera size={48} className="text-white drop-shadow-xl" />
                                    </div>
                                </div>
                                <h3 className="font-extrabold text-white text-2xl tracking-wide group-hover:text-red-200 transition-colors drop-shadow-md">Scan Crop Issue</h3>
                                <p className="text-slate-400 mt-2 font-medium text-base max-w-[250px] leading-relaxed">Take a photo for instant AI diagnosis. Saved to your profile.</p>
                            </label>
                        </GlassCard>

                        {/* Recent Reports History */}
                        {history.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-slate-300 font-bold tracking-widest uppercase text-sm px-2">Your Recent Reports</h3>
                                {history.map((item) => (
                                    <GlassCard key={item.id} className="p-4 flex gap-4 items-center border border-white/5 hover:border-red-500/30 transition-colors">
                                        <img src={item.imageBase64} alt="Crop" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-white font-bold text-sm line-clamp-1">{item.result.split('.')[0]}</h4>
                                                <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                                                    {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-emerald-400 font-bold mt-1 inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                <CheckCircle size={10} /> Diagnosed
                                            </p>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <GlassCard className="p-0 overflow-hidden relative glass-card border-slate-700/50 shadow-[0_10px_40px_0_rgba(239,68,68,0.2)] rounded-3xl group">
                            <img src={image} alt="Captured" className="w-full h-auto max-h-[400px] object-contain bg-black/40 opacity-90 group-hover:scale-105 transition-transform duration-1000" />

                            {analyzing && (
                                <>
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 transition-all duration-500"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_5px_rgba(239,68,68,0.8)] z-20 animate-scan"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-30">
                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                            <RefreshCw size={48} className="animate-spin text-white drop-shadow-2xl relative z-10" />
                                        </div>
                                        <h3 className="font-extrabold text-xl tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-white animate-pulse">Running Analysis...</h3>
                                    </div>
                                </>
                            )}
                        </GlassCard>

                        {result && (
                            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <GlassCard className="bg-gradient-to-br from-emerald-950/80 to-teal-900/60 border-emerald-500/30 glass-card shadow-[0_10px_40px_rgba(16,185,129,0.2)] p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-700 pointer-events-none"></div>
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex-shrink-0">
                                            <CheckCircle className="text-white drop-shadow-md" size={28} />
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="font-extrabold text-white text-xl tracking-wide mb-1 drop-shadow-sm">Diagnosis & Report Saved</h3>
                                            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 mt-3 shadow-inner">
                                                <p className="text-emerald-50 mt-1 text-base leading-relaxed font-medium">
                                                    {result.split('. ').map((sentence, i) => (
                                                        <span key={i} className={i === 0 ? "font-bold text-emerald-300 block mb-1 text-lg" : "text-slate-300 block"}>
                                                            {sentence}{sentence && i === 0 ? '.' : ''}
                                                        </span>
                                                    ))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        )}

                        {!analyzing && result && (
                            <button
                                onClick={() => { setImage(null); setResult(null); }}
                                className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10"
                            >
                                <Camera size={24} className="text-slate-300 transition-colors" /> Scan Another Item
                            </button>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
