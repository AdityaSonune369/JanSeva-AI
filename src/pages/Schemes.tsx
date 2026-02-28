import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../hooks/useVoice';

const SCHEMES = [
    { id: 1, title: 'PM Kisan Samman Nidhi', benefit: '₹6,000/year', eligibility: 'Farmers with land', minAge: 18, occupation: 'farmer' },
    { id: 2, title: 'Ayushman Bharat', benefit: '₹5 Lakh Health Cover', eligibility: 'Low income families', minAge: 0, occupation: 'all' },
    { id: 3, title: 'e-Shram Card', benefit: 'Accident Insurance', eligibility: 'Unorganized workers', minAge: 16, occupation: 'laborer' },
    { id: 4, title: 'PM Vishwakarma', benefit: 'Loan up to ₹1 Lakh', eligibility: 'Artisans', minAge: 18, occupation: 'artisan' },
];

export default function Schemes() {
    const [step, setStep] = useState(0);
    const [age, setAge] = useState('');
    const [occupation, setOccupation] = useState('');
    const { transcript, setTranscript, speak } = useVoice();

    // Voice Form Filling Logic
    useEffect(() => {
        if (!transcript) return;
        const lower = transcript.toLowerCase();

        if (step === 1) {
            const num = lower.match(/\d+/);
            if (num) {
                // eslint-disable-next-line
                setAge(num[0]);
                speak(`Aapki umar ${num[0]} saal hai.`, 'hi-IN');
                setTimeout(() => setStep(2), 1500);
                setTranscript('');
            }
        } else if (step === 2) {
            if (lower.includes('kisan') || lower.includes('farmer')) setOccupation('farmer');
            else if (lower.includes('mazdoor') || lower.includes('labor')) setOccupation('laborer');
            else if (lower.includes('karigar') || lower.includes('artisan')) setOccupation('artisan');

            if (occupation) {
                speak(`Theek hai, aap ${occupation} hain.`, 'hi-IN');
                setTimeout(() => setStep(3), 1500);
                setTranscript('');
            }
        }
    }, [transcript, step, speak, setTranscript, occupation]);

    const filteredSchemes = SCHEMES.filter(s => {
        if (age && parseInt(age) < s.minAge) return false;
        if (occupation && s.occupation !== 'all' && s.occupation !== occupation) return false;
        return true;
    });

    return (
        <PageTransition>
            <div className="p-4 space-y-6 pt-10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <BookOpen className="text-green-500" /> Yojna (Schemes)
                </h2>

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <GlassCard key="step0" className="glass-card text-center py-10">
                                <h3 className="text-xl font-bold mb-4 text-white">Check Eligibility</h3>
                                <p className="text-slate-300 mb-8">Answer 2 simple questions to find schemes for you.</p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="bg-india-green text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-900/50 active:scale-95 transition hover:scale-105"
                                >
                                    Start Check
                                </button>
                            </GlassCard>
                        )}

                        {step === 1 && (
                            <GlassCard key="step1" className="glass-card">
                                <h3 className="text-lg font-bold mb-4 text-white">Q1. What is your Age? (Umar)</h3>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full p-4 text-2xl text-center border border-white/10 bg-slate-800/50 text-white rounded-xl focus:border-india-green outline-none placeholder-slate-600"
                                />
                                <div className="flex justify-between mt-6">
                                    <button onClick={() => setStep(0)} className="p-2 text-slate-400 hover:text-white"><ArrowLeft /></button>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!age}
                                        className="bg-india-green text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-green-600"
                                    >
                                        Next <ArrowRight size={16} className="inline" />
                                    </button>
                                </div>
                                <p className="text-center text-sm text-slate-500 mt-4">Tap mic and say "25 years"</p>
                            </GlassCard>
                        )}

                        {step === 2 && (
                            <GlassCard key="step2" className="glass-card">
                                <h3 className="text-lg font-bold mb-4 text-white">Q2. Your Occupation? (Kaam)</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {['farmer', 'laborer', 'artisan', 'student'].map((occ) => (
                                        <button
                                            key={occ}
                                            onClick={() => { setOccupation(occ); setTimeout(() => setStep(3), 500); }}
                                            className={`p-4 rounded-xl border font-medium capitalize transition-all ${occupation === occ ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-6">
                                    <button onClick={() => setStep(1)} className="p-2 text-slate-400 hover:text-white"><ArrowLeft /></button>
                                </div>
                                <p className="text-center text-sm text-slate-500 mt-4">Tap mic and say "Farmer"</p>
                            </GlassCard>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-slate-200">Recommended Schemes</h3>
                                    <button onClick={() => setStep(0)} className="text-sm text-blue-400 underline">Reset</button>
                                </div>
                                {filteredSchemes.map((scheme) => (
                                    <GlassCard key={scheme.id} className="glass-card">
                                        <h3 className="font-bold text-lg text-white">{scheme.title}</h3>
                                        <p className="text-green-400 font-medium text-sm mt-1">{scheme.benefit}</p>
                                        <p className="text-slate-400 text-xs mt-1">For: {scheme.eligibility}</p>
                                        <button className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-500 transition">
                                            <CheckCircle size={16} /> Apply Now
                                        </button>
                                    </GlassCard>
                                ))}
                                {filteredSchemes.length === 0 && (
                                    <div className="text-center py-10 text-slate-500">
                                        No schemes found for your criteria.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
}
