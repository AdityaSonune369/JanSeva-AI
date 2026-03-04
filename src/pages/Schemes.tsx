import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../hooks/useVoice';

const SCHEMES = [
    { id: 1, title: 'PM Kisan Samman Nidhi', benefit: '₹6,000/year', eligibility: 'Farmers with land', minAge: 18, occupation: 'farmer', url: 'https://pmkisan.gov.in/' },
    { id: 2, title: 'Ayushman Bharat (PM-JAY)', benefit: '₹5 Lakh Health Cover', eligibility: 'Low income families', minAge: 0, occupation: 'all', url: 'https://beneficiary.nha.gov.in/' },
    { id: 3, title: 'e-Shram Card', benefit: 'Accident Insurance', eligibility: 'Unorganized workers', minAge: 16, occupation: 'laborer', url: 'https://eshram.gov.in/' },
    { id: 4, title: 'PM Vishwakarma', benefit: 'Loan up to ₹3 Lakh', eligibility: 'Artisans', minAge: 18, occupation: 'artisan', url: 'https://pmvishwakarma.gov.in/' },
    { id: 5, title: 'PM Awas Yojana (PMAY-G)', benefit: 'Housing Subsidy', eligibility: 'Rural poor households', minAge: 18, occupation: 'all', url: 'https://pmayg.nic.in/' },
    { id: 6, title: 'Kisan Credit Card (KCC)', benefit: 'Subsidised farming loans', eligibility: 'Active Farmers', minAge: 18, occupation: 'farmer', url: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card' },
    { id: 7, title: 'PM Jeevan Jyoti Bima', benefit: '₹2 Lakh Life Insurance', eligibility: 'Bank account holders', minAge: 18, occupation: 'all', url: 'https://www.myscheme.gov.in/schemes/pmjjby' },
    { id: 8, title: 'PM Svanidhi Yojana', benefit: '₹10k-50k for Street Vendors', eligibility: 'Street Vendors', minAge: 18, occupation: 'laborer', url: 'https://pmsvanidhi.mohua.gov.in/' },
    { id: 9, title: 'National Scholarship Portal', benefit: 'Educational grant', eligibility: 'Students (Merit/Means)', minAge: 6, occupation: 'student', url: 'https://scholarships.gov.in/' },
    { id: 10, title: 'Atal Pension Yojana (APY)', benefit: 'Monthly post-retirement pension', eligibility: 'Unorganized sector workers', minAge: 18, occupation: 'laborer', url: 'https://npscra.nsdl.co.in/scheme-details.php' },
    { id: 11, title: 'Sukanya Samriddhi Yojana', benefit: 'High interest savings for girl child', eligibility: 'Parents of girl children', minAge: 0, occupation: 'all', url: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx' },
    { id: 12, title: 'PM Jan Dhan Yojana (PMJDY)', benefit: 'Zero balance bank account & insurance', eligibility: 'Unbanked Indians', minAge: 10, occupation: 'all', url: 'https://pmjdy.gov.in/' },
    { id: 13, title: 'PM Suraksha Bima Yojana', benefit: '₹2 Lakh Accidental Insurance for ₹20/yr', eligibility: 'Bank account holders', minAge: 18, occupation: 'all', url: 'https://www.myscheme.gov.in/schemes/pmsby' },
    { id: 14, title: 'PM Mudra Yojana', benefit: 'Business Loans up to ₹10 Lakh', eligibility: 'Micro/Small Enterprises', minAge: 18, occupation: 'artisan', url: 'https://www.mudra.org.in/' },
    { id: 15, title: 'PM Ujjwala Yojana', benefit: 'Free LPG connection', eligibility: 'BPL women households', minAge: 18, occupation: 'all', url: 'https://www.pmuy.gov.in/' },
    { id: 16, title: 'Stand-Up India Scheme', benefit: 'Loans from ₹10L to ₹1Cr', eligibility: 'SC/ST/Women Entrepreneurs', minAge: 18, occupation: 'artisan', url: 'https://www.standupmitra.in/' },
    { id: 17, title: 'Skill India Mission (PMKVY)', benefit: 'Free industry-relevant skill training', eligibility: 'School/College dropouts & youth', minAge: 15, occupation: 'student', url: 'https://www.pmkvyofficial.org/' },
    { id: 18, title: 'PM Fasal Bima Yojana (PMFBY)', benefit: 'Crop Insurance against natural calamities', eligibility: 'Farmers taking crop loans', minAge: 18, occupation: 'farmer', url: 'https://pmfby.gov.in/' },
    { id: 19, title: 'Soil Health Card Scheme', benefit: 'Free soil testing & nutrient advice', eligibility: 'All Farmers', minAge: 18, occupation: 'farmer', url: 'https://soilhealth.dac.gov.in/' },
    { id: 20, title: 'PM Krishi Sinchayee Yojana', benefit: 'Subsidy on irrigation equipment', eligibility: 'Farmers', minAge: 18, occupation: 'farmer', url: 'https://pmksy.gov.in/' },
    { id: 21, title: 'MGNREGA', benefit: '100 days of guaranteed wage employment', eligibility: 'Rural adults willing to do unskilled manual work', minAge: 18, occupation: 'laborer', url: 'https://nrega.nic.in/' },
    { id: 22, title: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana', benefit: 'Skill training & placement', eligibility: 'Rural youth from poor families', minAge: 15, occupation: 'student', url: 'http://ddugky.gov.in/' },
    { id: 23, title: 'PM Garib Kalyan Anna Yojana', benefit: 'Free food grains (5kg/month)', eligibility: 'Ration card holders (AAY/PHH)', minAge: 0, occupation: 'all', url: 'https://nfsa.gov.in/' },
    { id: 24, title: 'National Rural Livelihood Mission (DAY-NRLM)', benefit: 'Support for Self Help Groups (SHGs)', eligibility: 'Rural poor women', minAge: 18, occupation: 'artisan', url: 'https://aajeevika.gov.in/' },
    { id: 25, title: 'UDAAN Scheme (CBSE)', benefit: 'Free mentoring/tutorials for engineering tests', eligibility: 'Girl students (Class XI-XII) in Science stream', minAge: 15, occupation: 'student', url: 'https://cbseacademic.nic.in/udaan.html' },
    { id: 26, title: 'Inspire Scholarship', benefit: '₹80,000/year for Science degrees', eligibility: 'Top 1% in Class 12 Boards pursuing Basic Sciences', minAge: 16, occupation: 'student', url: 'https://online-inspire.gov.in/' },
    { id: 27, title: 'PM Vidya Lakshmi Karyakram', benefit: 'Single portal for Educational Loans', eligibility: 'Students seeking higher education loans', minAge: 16, occupation: 'student', url: 'https://www.vidyalakshmi.co.in/Students/' },
    { id: 28, title: 'PM Matru Vandana Yojana (PMMVY)', benefit: 'Maternity benefit of ₹5,000', eligibility: 'Pregnant women & lactating mothers', minAge: 19, occupation: 'all', url: 'https://pmmvy.wcd.gov.in/' },
    { id: 29, title: 'Beti Bachao Beti Padhao', benefit: 'Awareness and welfare of girl child', eligibility: 'Girl Children', minAge: 0, occupation: 'all', url: 'https://wcd.nic.in/bbbp-schemes' },
    { id: 30, title: 'Gramin Bhandaran Yojana', benefit: 'Subsidy for building rural godowns', eligibility: 'Farmers & Farmer Groups', minAge: 18, occupation: 'farmer', url: 'https://www.nabard.org/' },
    { id: 31, title: 'PMEGP (Employment Generation)', benefit: 'Subsidy (15-35%) for new micro-enterprises', eligibility: 'Any individual, above 18 years age', minAge: 18, occupation: 'artisan', url: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp' }
];

export default function Schemes() {
    const [step, setStep] = useState(0);
    const [pageState, setPageState] = useState([0, 0]);
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

    // Apple-style sliding animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    const [, direction] = pageState;

    const handleNext = (newStep: number) => {
        setPageState([newStep, 1]);
        setStep(newStep);
    };

    const handleBack = (newStep: number) => {
        setPageState([newStep, -1]);
        setStep(newStep);
    };


    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32 overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10">
                    <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-2">
                        <BookOpen className="text-emerald-400 drop-shadow-lg" size={40} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-teal-300 tracking-tight">
                        Yojna Wizard
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">Discover government schemes</p>
                </div>

                <div className="relative w-full max-w-lg mx-auto perspective-1000">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full"
                            >
                                <GlassCard className="glass-card text-center py-16 px-8 min-h-[450px] flex flex-col justify-center border-emerald-500/10 hover:border-emerald-500/30">
                                    <h3 className="text-3xl font-extrabold mb-6 text-white drop-shadow-md">Check Eligibility</h3>
                                    <p className="text-slate-300 mb-12 text-lg font-medium tracking-wide leading-relaxed">Answer 2 simple questions to find the perfect schemes crafted for you.</p>
                                    <button
                                        onClick={() => handleNext(1)}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-[2rem] font-extrabold text-xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] active:scale-95 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(16,185,129,0.6)] hover:-translate-y-1 w-full"
                                    >
                                        Start Check
                                    </button>
                                </GlassCard>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full"
                            >
                                <GlassCard className="glass-card py-12 px-8 min-h-[450px] flex flex-col border-emerald-500/20">
                                    <h3 className="text-2xl font-extrabold mb-8 text-white tracking-wide text-center">Q1. What is your Age?</h3>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 25"
                                            className="w-full p-8 text-6xl font-extrabold text-center bg-slate-900/50 border-2 border-white/10 text-white rounded-[2.5rem] focus:border-emerald-500 focus:shadow-[0_0_30px_rgba(16,185,129,0.2)] focus:bg-slate-800/80 outline-none placeholder-slate-600 transition-all duration-300 backdrop-blur-3xl"
                                        />
                                        <p className="text-center text-sm font-medium text-emerald-400 mt-6 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                                            🎙️ Tap mic and say "25 years"
                                        </p>
                                    </div>
                                    <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                                        <button onClick={() => handleBack(0)} className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-slate-300 transition-all active:scale-95"><ArrowLeft size={24} /></button>
                                        <button
                                            onClick={() => handleNext(2)}
                                            disabled={!age}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full font-bold disabled:opacity-30 disabled:grayscale hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center gap-3 text-lg"
                                        >
                                            Next <ArrowRight size={22} />
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full"
                            >
                                <GlassCard className="glass-card py-12 px-6 min-h-[450px] flex flex-col border-emerald-500/20">
                                    <h3 className="text-2xl font-extrabold mb-8 text-white tracking-wide text-center">Q2. Your Occupation?</h3>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <div className="grid grid-cols-2 gap-4">
                                            {['farmer', 'laborer', 'artisan', 'student'].map((occ) => (
                                                <button
                                                    key={occ}
                                                    onClick={() => { setOccupation(occ); setTimeout(() => handleNext(3), 400); }}
                                                    className={`p-6 rounded-[2rem] border-2 font-extrabold text-xl capitalize transition-all duration-300 ${occupation === occ ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] transform scale-[1.05]' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    {occ}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-center text-sm font-medium text-emerald-400 mt-8 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                                            🎙️ Tap mic and say "Farmer"
                                        </p>
                                    </div>
                                    <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                                        <button onClick={() => handleBack(1)} className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-slate-300 transition-all active:scale-95"><ArrowLeft size={24} /></button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full pb-10"
                            >
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <h3 className="font-extrabold text-2xl text-white drop-shadow-md">Your Matches</h3>
                                    <button onClick={() => handleBack(0)} className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Start Over</button>
                                </div>
                                <div className="space-y-5 px-1">
                                    {filteredSchemes.map((scheme) => (
                                        <GlassCard key={scheme.id} className="glass-card p-6 border-emerald-500/10 hover:border-emerald-500/30">
                                            <h3 className="font-extrabold text-2xl text-white tracking-wide mb-5 drop-shadow-md">{scheme.title}</h3>

                                            <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-4 mt-4 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                                                <p className="text-emerald-400 font-extrabold text-lg flex items-center justify-between">Benefit <span className="text-right text-emerald-300">{scheme.benefit}</span></p>
                                            </div>

                                            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 mt-3">
                                                <p className="text-slate-300 text-sm font-medium flex items-center justify-between">For <span className="text-right">{scheme.eligibility}</span></p>
                                            </div>

                                            <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all duration-300 active:scale-[0.98] border border-emerald-400/30">
                                                <CheckCircle size={24} /> Apply Now <ArrowRight size={20} />
                                            </a>
                                        </GlassCard>
                                    ))}
                                    {filteredSchemes.length === 0 && (
                                        <div className="text-center py-16 text-slate-400 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-xl mt-4">
                                            <p className="text-lg font-medium tracking-wide">No perfectly matched schemes found.</p>
                                            <button onClick={() => handleBack(0)} className="mt-4 text-emerald-400 underline font-bold">Try different answers</button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
}
