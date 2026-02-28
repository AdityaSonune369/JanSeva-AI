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
            <div className="p-4 space-y-6 pt-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Briefcase className="text-india-blue" /> Rozgar
                    </h2>
                    <button className="p-2 glass-button rounded-full shadow-sm text-slate-300">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs (e.g. Pune)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 shadow-inner bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-india-saffron outline-none backdrop-blur-sm"
                    />
                </div>

                <div className="space-y-4">
                    {filteredJobs.map((job, index) => (
                        <GlassCard key={job.id} delay={index * 0.1} className="glass-card border-none">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{job.title}</h3>
                                    <div className="flex flex-col gap-1 mt-2 text-sm text-slate-300">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span className="flex items-center gap-1 text-green-400 font-bold"><IndianRupee size={14} /> {job.salary}</span>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full font-medium border border-blue-500/30">
                                    {job.type}
                                </span>
                            </div>

                            <button
                                onClick={() => handleApply(job.id)}
                                disabled={applied.includes(job.id)}
                                className={`w-full mt-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${applied.includes(job.id)
                                    ? 'bg-green-500/20 text-green-400 cursor-default border border-green-500/30'
                                    : 'bg-gradient-to-r from-india-blue to-blue-600 text-white shadow-lg shadow-blue-900/50 active:scale-95'
                                    }`}
                            >
                                {applied.includes(job.id) ? (
                                    <>
                                        <CheckCircle size={18} /> Applied
                                    </>
                                ) : (
                                    'Apply Now'
                                )}
                            </button>
                        </GlassCard>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            No jobs found for "{query}"
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
