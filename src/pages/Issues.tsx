import { Camera, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';

export default function Issues() {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                analyzeImage();
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = () => {
        setAnalyzing(true);
        // Mock analysis delay
        setTimeout(() => {
            setAnalyzing(false);
            setResult("Early Blight detected on Tomato leaf. Recommended: Apply Copper Oxychloride.");
        }, 2500);
    };

    return (
        <PageTransition>
            <div className="p-4 space-y-6 pt-10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Camera className="text-red-500" /> Samasya (Crop Doctor)
                </h2>

                {!image ? (
                    <GlassCard className="border border-dashed border-white/20 bg-slate-800/30 text-center py-12 glass-card">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCapture}
                            className="hidden"
                            id="camera-input"
                        />
                        <label htmlFor="camera-input" className="cursor-pointer flex flex-col items-center group">
                            <div className="bg-white/10 p-6 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform ring-1 ring-white/10">
                                <Camera size={48} className="text-blue-400" />
                            </div>
                            <span className="font-bold text-white text-xl">Take a Photo</span>
                            <p className="text-slate-400 mt-2">Upload crop photo for diagnosis</p>
                        </label>
                    </GlassCard>
                ) : (
                    <div className="space-y-6">
                        <GlassCard className="p-0 overflow-hidden relative glass-card border-none">
                            <img src={image} alt="Captured" className="w-full h-72 object-cover opacity-90" />
                            {analyzing && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <RefreshCw size={48} className="animate-spin mb-4 text-india-saffron" />
                                    <p className="font-bold text-lg">Analyzing Crop...</p>
                                </div>
                            )}
                        </GlassCard>

                        {result && (
                            <GlassCard className="bg-green-900/30 border-green-500/30 glass-card">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-500/20 p-2 rounded-full">
                                        <CheckCircle className="text-green-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-400 text-lg">Diagnosis Complete</h3>
                                        <p className="text-green-200 mt-2 leading-relaxed">{result}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        <button
                            onClick={() => { setImage(null); setResult(null); }}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold shadow-lg active:scale-95 transition border border-white/10"
                        >
                            Scan Another
                        </button>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
