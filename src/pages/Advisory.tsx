import { useState, useEffect } from 'react';
import { TrendingUp, Cloud, CloudRain, Sun, CloudSun, AlertOctagon } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useVoice } from '../hooks/useVoice';

interface Weather {
    temp: number;
    condition: string;
    rainChance: number;
}

export default function Advisory() {
    const [weather, setWeather] = useState<Weather | null>(null);
    const { transcript, setTranscript, speak } = useVoice();

    const fetchWeather = async () => {
        // Mock API Call
        const mock: Weather = {
            temp: 28 + Math.floor(Math.random() * 5),
            condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
            rainChance: Math.floor(Math.random() * 100)
        };
        setWeather(mock);
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    useEffect(() => {
        if (!transcript) return;
        const lower = transcript.toLowerCase();

        if (lower.includes('refresh') || lower.includes('update') || lower.includes('mausam')) {
            speak("Checking latest weather updates...");
            setWeather(null); // Show loading
            setTimeout(fetchWeather, 1500);
            setTranscript('');
        }
    }, [transcript, setTranscript, speak]);

    return (
        <PageTransition>
            <div className="p-4 space-y-6 pt-10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <TrendingUp className="text-yellow-400" /> Paramarsh (Advisory)
                </h2>

                {/* Weather Card */}
                <GlassCard className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-blue-900/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium">Pune, Maharashtra</p>
                            {weather ? (
                                <>
                                    <h3 className="text-5xl font-bold mt-2">{weather.temp}°C</h3>
                                    <p className="mt-2 text-lg opacity-90 flex items-center gap-2">
                                        {weather.condition === 'Rainy' ? <CloudRain size={20} /> :
                                            weather.condition === 'Cloudy' ? <Cloud size={20} /> : <Sun size={20} />}
                                        {weather.condition}
                                    </p>
                                </>
                            ) : (
                                <div className="animate-pulse mt-4 h-10 w-24 bg-white/20 rounded"></div>
                            )}
                        </div>
                        <CloudSun size={64} className="text-yellow-300 opacity-80" />
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20 text-sm flex justify-between">
                        <span>Rain Chance: {weather?.rainChance ?? 0}%</span>
                        <span>Wind: 12 km/h</span>
                    </div>
                </GlassCard>

                {/* Market Prices */}
                <GlassCard className="glass-card">
                    <h3 className="font-bold text-white mb-4 text-lg">Mandi Prices (e-NAM)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <span className="font-medium text-slate-300">Wheat (Gehu)</span>
                            <span className="font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">₹2,125/qt</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <span className="font-medium text-slate-300">Onion (Pyaaz)</span>
                            <span className="font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">₹1,800/qt</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-300">Tomato (Tamatar)</span>
                            <span className="font-bold text-red-400 bg-red-500/20 px-3 py-1 rounded-full flex items-center gap-1 border border-red-500/30">
                                ₹800/qt <span className="text-xs">▼</span>
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Alerts */}
                <GlassCard className="bg-red-900/30 border-red-500/30">
                    <div className="flex gap-4">
                        <div className="bg-red-500/20 p-3 rounded-full h-fit">
                            <AlertOctagon className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-400 text-lg">Pest Alert</h4>
                            <p className="text-sm text-red-200 mt-1 leading-relaxed">
                                Fall Armyworm reported in maize crops in your district. Spray Emamectin Benzoate immediately.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </PageTransition>
    );
}
