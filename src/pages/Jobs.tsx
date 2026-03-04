import { useState, useEffect } from 'react';
import { Briefcase, MapPin, IndianRupee, Search, Filter, CheckCircle } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { useVoice } from '../hooks/useVoice';

const JOBS = [
    { id: 1, title: 'Construction Worker', location: 'Pune, Maharashtra', salary: '₹15,000/mo', type: 'Full-time' },
    { id: 2, title: 'Farm Laborer', location: 'Nashik, Maharashtra', salary: '₹500/day', type: 'Daily Wage' },
    { id: 3, title: 'Delivery Partner', location: 'Mumbai, Maharashtra', salary: '₹20,000/mo', type: 'Contract' },
    { id: 4, title: 'Textile Weaver', location: 'Surat, Gujarat', salary: '₹18,000/mo', type: 'Full-time' },
    { id: 5, title: 'Dairy Helper', location: 'Pune, Maharashtra', salary: '₹12,000/mo', type: 'Full-time' },
];

export default function Jobs() {
    const [query, setQuery] = useState('');
    const [applied, setApplied] = useState<number[]>([]);
    const { transcript, setTranscript, speak } = useVoice();

    const filteredJobs = JOBS.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.location.toLowerCase().includes(query.toLowerCase())
    );

    const handleApply = (id: number) => {
        if (!applied.includes(id)) {
            setApplied([...applied, id]);
            speak("Avedan safal raha"); // "Application successful"
        }
    };

    useEffect(() => {
        if (!transcript) return;
        const lower = transcript.toLowerCase();

        // Search Command
        if (lower.includes('search') || lower.includes('khoj')) {
            const searchTerm = lower.replace('search', '').replace('khoj', '').trim();
            if (searchTerm) {
                setQuery(searchTerm);
                speak(`Searching for ${searchTerm}`);
                setTranscript('');
            }
        }
        // Apply Command ("Apply first job", "Apply one")
        else if (lower.includes('apply') || lower.includes('avedan')) {
            if (filteredJobs.length > 0) {
                handleApply(filteredJobs[0].id); // Simple logic: apply to first result
                setTranscript('');
            }
        }

    }, [transcript, setTranscript, speak, filteredJobs, applied]);

    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                    <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-2">
                        <Briefcase className="text-blue-400 drop-shadow-lg" size={40} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-indigo-300 tracking-tight">
                        Rozgar Search
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">Find your next opportunity</p>
                </div>

                {/* Search Bar - Floating & Glowing */}
                <div className="relative group max-w-md mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-6 text-blue-400 drop-shadow-md" size={24} />
                        <input
                            type="text"
                            placeholder="Search jobs, locations..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-slate-900/60 backdrop-blur-3xl border border-white/10 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400/50 focus:border-transparent outline-none transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:bg-slate-800/60 text-lg font-medium"
                        />
                        <button className="absolute right-4 p-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-xl text-blue-300 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 mt-10">
                    {filteredJobs.map((job, index) => (
                        <GlassCard key={job.id} delay={index * 0.1} className="glass-card p-6 border-blue-500/10 hover:border-blue-400/30">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-extrabold text-2xl text-white tracking-wide mb-4 drop-shadow-md">{job.title}</h3>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm font-medium">
                                        <span className="flex items-center gap-1.5 bg-slate-800/80 text-slate-200 py-1.5 px-4 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                                            <MapPin size={16} className="text-blue-400 drop-shadow-sm" /> {job.location}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 py-1.5 px-4 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] backdrop-blur-md">
                                            <IndianRupee size={16} /> {job.salary}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full font-extrabold border border-indigo-500/30 uppercase tracking-widest backdrop-blur-md shadow-lg">
                                    {job.type}
                                </span>
                            </div>

                            <button
                                onClick={() => handleApply(job.id)}
                                disabled={applied.includes(job.id)}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-500 text-lg ${applied.includes(job.id)
                                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30 shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_10px_40px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:scale-[0.98]'
                                    }`}
                            >
                                {applied.includes(job.id) ? (
                                    <>
                                        <CheckCircle size={24} className="animate-pulse" /> Application Sent
                                    </>
                                ) : (
                                    'Apply for Position'
                                )}
                            </button>
                        </GlassCard>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-16 text-slate-400 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-xl">
                            <Search size={48} className="mx-auto mb-4 text-slate-500 opacity-50" />
                            <p className="text-lg font-medium">No opportunities found for "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
