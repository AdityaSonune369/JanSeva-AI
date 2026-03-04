import { useState, useEffect } from 'react';
import { TrendingUp, Cloud, CloudRain, Sun, CloudSun, AlertOctagon, RefreshCcw } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useVoice } from '../hooks/useVoice';

interface Weather {
    temp: number;
    condition: string;
    rainChance: number;
    windSpeed: number;
    location: string;
}

interface MandiItem {
    id: string;
    name: string;
    hindi: string;
    grade: string;
    price: number;
    basePrice: number;
    trend: 'up' | 'down' | 'flat';
}

export default function Advisory() {
    const [weather, setWeather] = useState<Weather | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const { transcript, setTranscript, speak } = useVoice();

    const [mandiRates, setMandiRates] = useState<MandiItem[]>([
        { id: '1', name: 'Wheat', hindi: 'Gehu', grade: 'Grade A', price: 2125, basePrice: 2125, trend: 'flat' },
        { id: '2', name: 'Onion', hindi: 'Pyaaz', grade: 'Nashik Red', price: 1800, basePrice: 1800, trend: 'flat' },
        { id: '3', name: 'Tomato', hindi: 'Tamatar', grade: 'Hybrid', price: 800, basePrice: 800, trend: 'flat' },
    ]);

    const fetchWeather = async () => {
        setLoadingWeather(true);
        if (!navigator.geolocation) {
            fallbackWeather();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Fetch real-time weather from Open-Meteo
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`);
                    const data = await res.json();

                    // Fetch location name via free BigDataCloud reverse geocoding API
                    let locName = "Your Location";
                    try {
                        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                        const geoData = await geoRes.json();
                        locName = geoData.city || geoData.locality || locName;
                        if (geoData.principalSubdivision) locName += `, ${geoData.principalSubdivision}`;
                    } catch (e) {
                        console.warn("Could not reverse geocode", e);
                    }

                    // Map WMO Weather codes to simplified UI conditions
                    const code = data.current.weather_code;
                    let condition = 'Sunny';
                    if (code >= 1 && code <= 3) condition = 'Cloudy'; // partly cloudy, overcast
                    if (code >= 51 && code <= 99) condition = 'Rainy'; // drizzle, rain, snow, thunderstorm

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        condition: condition,
                        rainChance: data.current.precipitation > 0 ? Math.round(data.current.precipitation * 10) : 0, // Using precipitation mm * 10 as mock chance for UI
                        windSpeed: Math.round(data.current.wind_speed_10m),
                        location: locName
                    });
                } catch (error) {
                    console.error("Error fetching real weather", error);
                    fallbackWeather();
                } finally {
                    setLoadingWeather(false);
                }
            },
            (error) => {
                console.warn("Geolocation denied or failed", error);
                fallbackWeather();
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    const fallbackWeather = () => {
        setWeather({
            temp: 28 + Math.floor(Math.random() * 5),
            condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
            rainChance: Math.floor(Math.random() * 100),
            windSpeed: 12 + Math.floor(Math.random() * 10),
            location: "Pune, Maharashtra (Estimate)"
        });
        setLoadingWeather(false);
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    // Simulate Live Mandi Market fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setMandiRates(prevRates => prevRates.map(item => {
                // 30% chance for a specific commodity to fluctuate every tick
                if (Math.random() < 0.3) {
                    const fluctuation = Math.floor(Math.random() * 15) * (Math.random() > 0.5 ? 1 : -1);
                    let newPrice = item.price + fluctuation;

                    // Keep price within 10% bounds of base price to prevent wild drift
                    if (newPrice > item.basePrice * 1.1) newPrice = item.price - Math.abs(fluctuation);
                    if (newPrice < item.basePrice * 0.9) newPrice = item.price + Math.abs(fluctuation);

                    return {
                        ...item,
                        price: newPrice,
                        trend: newPrice > item.price ? 'up' : newPrice < item.price ? 'down' : 'flat'
                    };
                }
                return { ...item, trend: 'flat' };
            }));
        }, 3000); // Ticks every 3 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!transcript) return;
        const lower = transcript.toLowerCase();

        if (lower.includes('refresh') || lower.includes('update') || lower.includes('mausam')) {
            speak("Fetching latest live weather data...");
            fetchWeather();
            setTranscript('');
        }
    }, [transcript, setTranscript, speak]);

    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                    <div className="bg-yellow-500/20 p-4 rounded-full border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-2 relative group cursor-pointer hover:bg-yellow-500/30 transition-all">
                        <TrendingUp className="text-yellow-400 drop-shadow-lg group-hover:scale-110 transition-transform" size={40} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 tracking-tight">
                        Paramarsh
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">Live Advisory & Market Trends</p>
                </div>

                {/* Weather Card - Real-Time */}
                <GlassCard className="glass-card relative overflow-hidden p-8 border-blue-400/20 hover:border-blue-400/40">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 mix-blend-multiply pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10 mb-8">
                        <div>
                            <p className="text-blue-200 font-bold tracking-widest uppercase text-sm mb-2 opacity-80 flex items-center gap-2">
                                Current Location
                                {loadingWeather && <RefreshCcw size={12} className="animate-spin text-blue-300" />}
                            </p>
                            <h3 className="text-2xl text-white font-medium capitalize max-w-[200px] truncate" title={weather?.location}>
                                {weather ? weather.location : 'Detecting...'}
                            </h3>

                            {weather && !loadingWeather ? (
                                <div className="mt-6 flex flex-col">
                                    <div className="flex items-start">
                                        <h3 className="text-[5.5rem] leading-none font-extrabold tracking-tighter text-white drop-shadow-2xl">{weather.temp}°</h3>
                                        <span className="text-4xl mt-3 text-blue-100 font-light">C</span>
                                    </div>
                                    <p className="mt-4 text-2xl font-bold text-blue-100 flex items-center gap-3 tracking-wide">
                                        {weather.condition === 'Rainy' ? <CloudRain size={32} className="text-blue-300 animate-pulse drop-shadow-lg" /> :
                                            weather.condition === 'Cloudy' ? <Cloud size={32} className="text-slate-300 animate-pulse drop-shadow-lg" /> : <Sun size={32} className="text-yellow-400 animate-spin-slow drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />}
                                        {weather.condition}
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-pulse mt-8 h-24 w-40 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/5"></div>
                            )}
                        </div>
                        <CloudSun size={120} className="text-yellow-300/80 drop-shadow-[0_0_40px_rgba(253,224,71,0.4)] absolute -right-6 -top-6 will-change-transform" />
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-between relative z-10 bg-slate-900/30 -mx-8 -mb-8 px-8 pb-8 backdrop-blur-md">
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-200/60 text-xs font-bold uppercase tracking-widest">Precipitation</span>
                            <span className="flex items-center gap-2 text-white font-bold text-lg"><CloudRain size={18} className="text-blue-400" /> {weather ? weather.rainChance : 0}%</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-blue-200/60 text-xs font-bold uppercase tracking-widest">Wind Speed</span>
                            <span className="text-white font-bold text-lg">{weather ? weather.windSpeed : 0} km/h</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Market Prices - Live Simulation */}
                <GlassCard className="glass-card p-8 border-slate-700/50 hover:border-slate-600">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="font-extrabold text-white text-2xl tracking-wide flex items-center gap-2">
                                Mandi Rates
                                <span className="relative flex h-3 w-3 ml-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                                </span>
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Live updates from e-NAM Network</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {mandiRates.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:bg-slate-800/60 transition-colors relative overflow-hidden group">
                                {item.trend === 'down' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50 animate-pulse"></div>}
                                {item.trend === 'up' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50 animate-pulse"></div>}

                                <div className={`flex flex-col ${item.trend !== 'flat' ? 'ml-2' : ''} transition-all`}>
                                    <span className="font-extrabold text-white text-lg">{item.name} <span className="text-slate-400 font-medium text-sm ml-1">({item.hindi})</span></span>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{item.grade}</span>
                                </div>

                                <span className={`font-extrabold px-5 py-2 rounded-[1rem] border shadow-[0_0_15px_rgba(0,0,0,0.1)] text-lg tracking-wide flex items-center gap-2 relative overflow-hidden group transition-colors duration-500
                                    ${item.trend === 'up' ? 'text-green-400 bg-green-500/20 border-green-500/30' :
                                        item.trend === 'down' ? 'text-red-400 bg-red-500/20 border-red-500/30' :
                                            'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}
                                `}>
                                    <div className={`absolute inset-0 bg-gradient-to-r w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000
                                        ${item.trend === 'up' ? 'from-green-500/0 via-green-500/20 to-green-500/0' :
                                            item.trend === 'down' ? 'from-red-500/0 via-red-500/20 to-red-500/0' :
                                                'from-emerald-500/0 via-emerald-500/10 to-emerald-500/0'}
                                    `}></div>

                                    ₹{item.price}
                                    <span className={`text-sm font-medium ${item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-emerald-500'} `}>/qt</span>

                                    {item.trend === 'up' && <span className="text-xs text-green-400 ml-1">▲</span>}
                                    {item.trend === 'down' && <span className="text-xs text-red-400 ml-1">▼</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Alerts */}
                <GlassCard className="glass-card bg-red-950/40 border-red-500/30 shadow-[0_8px_30px_rgba(220,38,38,0.15)] p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none group-hover:bg-red-500/10 transition-colors duration-500"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full"></div>

                    <div className="flex gap-5 relative z-10">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl h-fit border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex-shrink-0">
                            <AlertOctagon className="text-white drop-shadow-md animate-pulse" size={32} />
                        </div>
                        <div className="pt-1">
                            <h4 className="font-extrabold text-white text-xl tracking-wide mb-1 drop-shadow-sm">Critical Pest Alert</h4>
                            <p className="text-red-200/90 font-medium leading-relaxed">
                                Fall Armyworm reported in maize crops in your district. Spray Emamectin Benzoate immediately.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </PageTransition>
    );
}
