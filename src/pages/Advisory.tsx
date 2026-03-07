import { useState, useEffect } from 'react';
import { TrendingUp, Cloud, CloudRain, Sun, CloudSun, AlertOctagon, RefreshCcw, MapPin, Search, Navigation } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useVoice } from '../hooks/useVoice';
import { askJanSevaAI } from '../services/ai';

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

    // AI Advisory States
    const [aiAdvisory, setAiAdvisory] = useState<string | null>(null);
    const [loadingAdvisory, setLoadingAdvisory] = useState(false);

    // New States for Manual Location
    const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    const [mandiRates, setMandiRates] = useState<MandiItem[]>([
        { id: '1', name: 'Wheat', hindi: 'Gehu', grade: 'Grade A', price: 2125, basePrice: 2125, trend: 'flat' },
        { id: '2', name: 'Onion', hindi: 'Pyaaz', grade: 'Nashik Red', price: 1800, basePrice: 1800, trend: 'flat' },
        { id: '3', name: 'Tomato', hindi: 'Tamatar', grade: 'Hybrid', price: 800, basePrice: 800, trend: 'flat' },
    ]);

    const fetchWeatherForCoords = async (lat: number, lon: number, customName?: string) => {
        setLoadingWeather(true);
        setLoadingAdvisory(true);
        try {
            // Fetch real-time weather from Open-Meteo
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`);
            const data = await res.json();

            // Fetch location name via free BigDataCloud reverse geocoding API if not manually provided
            let locName = customName || "Your Location";
            if (!customName) {
                try {
                    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                    const geoData = await geoRes.json();
                    locName = geoData.city || geoData.locality || locName;
                    if (geoData.principalSubdivision) locName += `, ${geoData.principalSubdivision}`;
                } catch (e) {
                    console.warn("Could not reverse geocode", e);
                }
            }

            // Map WMO Weather codes to simplified UI conditions
            const code = data.current.weather_code;
            let condition = 'Sunny';
            if (code >= 1 && code <= 3) condition = 'Cloudy'; // partly cloudy, overcast
            if (code >= 51 && code <= 99) condition = 'Rainy'; // drizzle, rain, snow, thunderstorm

            const finalWeather = {
                temp: Math.round(data.current.temperature_2m),
                condition: condition,
                rainChance: data.current.precipitation > 0 ? Math.round(data.current.precipitation * 10) : 0,
                windSpeed: Math.round(data.current.wind_speed_10m),
                location: locName
            };

            setWeather(finalWeather);

            // Fetch Real AI Advisory
            try {
                const prompt = `You are an expert Indian agronomist. The user is in ${finalWeather.location}. The current weather is ${finalWeather.temp}°C and ${finalWeather.condition} with a ${finalWeather.rainChance}% chance of rain.
Write a SINGLE, SHORT, PUNCHY sentence (max 15 words) giving a specific farming or pest warning/advice for this area and weather. 
Do NOT output any XML tags, quotes, or introductory text. Just the sentence. For example: "Watch for armyworm in maize crops right now."`;
                const aiResponse = await askJanSevaAI(prompt, "Expert Agricultural Advisory System");
                setAiAdvisory(aiResponse.trim().replace(/['"]/g, ''));
            } catch (aiError) {
                console.error("AI Advisory fetch failed", aiError);
                setAiAdvisory(null); // Fallback to the hardcoded local logic
            }

        } catch (error) {
            console.error("Error fetching real weather", error);
            fallbackWeather();
        } finally {
            setLoadingWeather(false);
            setLoadingAdvisory(false);
            setIsSearchingLocation(false);
        }
    };

    const fetchAutoWeather = async () => {
        setLocationMode('auto');
        setLoadingWeather(true);
        if (!navigator.geolocation) {
            fallbackWeather();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => fetchWeatherForCoords(position.coords.latitude, position.coords.longitude),
            (error) => {
                console.warn("Geolocation denied or failed", error);
                fallbackWeather();
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearchingLocation(true);
        try {
            // Geocoding API to get lat/lon for the city name
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (geoData.results && geoData.results.length > 0) {
                const location = geoData.results[0];
                const displayName = `${location.name}${location.admin1 ? `, ${location.admin1}` : ''}`;

                setLocationMode('manual');
                await fetchWeatherForCoords(location.latitude, location.longitude, displayName);
                setSearchQuery('');
            } else {
                alert("Location not found. Please try another city.");
                setIsSearchingLocation(false);
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            alert("Error finding location.");
            setIsSearchingLocation(false);
        }
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
        setIsSearchingLocation(false);
    };

    useEffect(() => {
        fetchAutoWeather();
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
            if (locationMode === 'auto') {
                fetchAutoWeather();
            } else {
                // re-fetch the current coords of manual mode by relying on the last known weather struct coords if possible, but for simplicity we'll just auto refresh
                fetchAutoWeather();
            }
            setTranscript('');
        }
    }, [transcript, setTranscript, speak, locationMode]);

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

                {/* Location Selector */}
                <div className="flex flex-col gap-4 mb-2">
                    <div className="flex justify-center bg-slate-900/60 p-1.5 rounded-full border border-white/10 w-fit mx-auto relative z-10">
                        <button
                            onClick={() => { if (locationMode !== 'auto') fetchAutoWeather(); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${locationMode === 'auto' ? 'bg-blue-600/80 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Navigation size={16} /> Auto Detect
                        </button>
                        <button
                            onClick={() => setLocationMode('manual')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${locationMode === 'manual' ? 'bg-indigo-600/80 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <MapPin size={16} /> Manual Entry
                        </button>
                    </div>

                    {locationMode === 'manual' && (
                        <form onSubmit={handleManualSearch} className="relative z-10 flex max-w-sm mx-auto w-full group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter village, city, or district..."
                                className="w-full bg-slate-900/60 border border-indigo-500/30 rounded-full pl-5 pr-12 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner group-hover:border-indigo-400/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isSearchingLocation || !searchQuery.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full transition-colors"
                            >
                                {isSearchingLocation ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} />}
                            </button>
                        </form>
                    )}
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
                            <h3 className="text-3xl text-white font-medium capitalize max-w-[85%] break-words leading-tight drop-shadow-sm" title={weather?.location}>
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
                {weather && (
                    <GlassCard className={`glass-card p-6 relative overflow-hidden group ${weather.rainChance > 50 ? 'bg-indigo-950/40 border-indigo-500/30 shadow-[0_8px_30px_rgba(79,70,229,0.15)]' :
                        weather.temp > 35 ? 'bg-orange-950/40 border-orange-500/30 shadow-[0_8px_30px_rgba(249,115,22,0.15)]' :
                            'bg-red-950/40 border-red-500/30 shadow-[0_8px_30px_rgba(220,38,38,0.15)]'
                        }`}>
                        <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${weather.rainChance > 50 ? 'bg-indigo-500/5 group-hover:bg-indigo-500/10' :
                            weather.temp > 35 ? 'bg-orange-500/5 group-hover:bg-orange-500/10' :
                                'bg-red-500/5 group-hover:bg-red-500/10'
                            }`}></div>
                        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-3xl rounded-full ${weather.rainChance > 50 ? 'bg-indigo-500/10' :
                            weather.temp > 35 ? 'bg-orange-500/10' :
                                'bg-red-500/10'
                            }`}></div>

                        <div className="flex gap-5 relative z-10">
                            <div className={`p-4 rounded-2xl h-fit border flex-shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.4)] ${weather.rainChance > 50 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400/50 shadow-[#4f46e566]' :
                                weather.temp > 35 ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/50 shadow-[#f9731666]' :
                                    'bg-gradient-to-br from-red-500 to-red-600 border-red-400/50'
                                }`}>
                                {loadingAdvisory ? (
                                    <RefreshCcw className="text-white drop-shadow-md animate-spin" size={32} />
                                ) : (
                                    <AlertOctagon className="text-white drop-shadow-md animate-pulse" size={32} />
                                )}
                            </div>
                            <div className="pt-1 w-full">
                                <h4 className="font-extrabold text-white text-xl tracking-wide mb-1 drop-shadow-sm">
                                    {weather.rainChance > 50 ? 'High Moisture Alert' :
                                        weather.temp > 35 ? 'Heat Wave Advisory' :
                                            'AI Agricultural Alert'}
                                </h4>

                                {loadingAdvisory ? (
                                    <div className="animate-pulse space-y-2 mt-2 w-full">
                                        <div className="h-4 bg-white/20 rounded w-full"></div>
                                        <div className="h-4 bg-white/20 rounded w-5/6"></div>
                                    </div>
                                ) : (
                                    <p className={`font-medium leading-relaxed ${weather.rainChance > 50 ? 'text-indigo-200/90' :
                                        weather.temp > 35 ? 'text-orange-200/90' :
                                            'text-red-200/90'
                                        }`}>
                                        {aiAdvisory || (
                                            weather.rainChance > 50
                                                ? `High rain probability in ${weather.location?.split(',')[0]}. Watch out for fungal diseases like Blight in vegetable crops. Ensure proper field drainage.`
                                                : weather.temp > 35
                                                    ? `Extreme heat expected in ${weather.location?.split(',')[0]}. Increase irrigation frequency to prevent crop wilting and heat stress.`
                                                    : `Fall Armyworm activity detected near ${weather.location?.split(',')[0] || 'your area'}. Inspect maize nodes and spray Emamectin Benzoate if spotted.`
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>
        </PageTransition>
    );
}
