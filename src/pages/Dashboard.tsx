import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, Users, AlertTriangle, TrendingUp, Sparkles, User as UserIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const MODULES = [
    { id: 'jobs', label: 'Rozgar', sub: 'Jobs', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'hover:border-blue-400/50 hover:shadow-[0_8px_32px_0_rgba(96,165,250,0.2)]' },
    { id: 'schemes', label: 'Yojna', sub: 'Schemes', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/20', border: 'hover:border-green-400/50 hover:shadow-[0_8px_32px_0_rgba(74,222,128,0.2)]' },
    { id: 'advisory', label: 'Paramarsh', sub: 'Advisory', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'hover:border-yellow-400/50 hover:shadow-[0_8px_32px_0_rgba(250,204,21,0.2)]' },
    { id: 'community', label: 'Samuday', sub: 'Community', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'hover:border-purple-400/50 hover:shadow-[0_8px_32px_0_rgba(192,132,252,0.2)]' },
    { id: 'issues', label: 'Samasya', sub: 'Issues', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/20', border: 'hover:border-red-400/50 hover:shadow-[0_8px_32px_0_rgba(248,113,113,0.2)]' },
    { id: 'chatbot', label: 'Saarthi', sub: 'Chatbot', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-400/20', border: 'hover:border-indigo-400/50 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.2)]' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const item: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

export default function Dashboard() {
    const { currentUser } = useAuth();

    return (
        <div className="p-6 pt-10 min-h-screen relative">
            {/* Profile Button */}
            <Link to="/profile" className="absolute top-6 right-6 z-20">
                <div className="bg-slate-800/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-white/30 transition-colors shadow-lg group">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" className="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" />
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors">
                            <UserIcon className="text-slate-300" size={24} />
                        </div>
                    )}
                </div>
            </Link>

            <header className="mb-14 relative flex flex-col items-center justify-center text-center z-10 pt-4 mt-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="absolute -inset-10 bg-gradient-to-r from-india-saffron/20 via-yellow-400/20 to-india-green/20 blur-[40px] rounded-full opacity-60 animate-pulse-slow pointer-events-none"></div>
                    <h1 className="text-5xl font-extrabold text-gradient mb-3 tracking-tight relative z-10 drop-shadow-lg">JanSeva AI</h1>
                    <p className="text-slate-300 text-lg font-medium tracking-wide relative z-10">How can I help you today?</p>
                </motion.div>

                <div className="absolute right-2 top-0 opacity-10 animate-spin-slow pointer-events-none">
                    <Sparkles size={90} className="text-india-saffron" />
                </div>
                <div className="absolute left-2 top-10 opacity-10 animate-float pointer-events-none">
                    <Sparkles size={50} className="text-india-green" />
                </div>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-5 px-2 relative z-10"
            >
                {MODULES.map((mod) => (
                    <motion.div variants={item} key={mod.id}>
                        <Link
                            to={`/${mod.id}`}
                            className={`flex flex-col items-center justify-center py-6 px-4 glass-card active:scale-95 relative group overflow-hidden ${mod.border}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className={`p-4 rounded-xl mb-4 ${mod.bg} ${mod.color} shadow-lg ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}>
                                <mod.icon size={36} strokeWidth={1.5} />
                            </div>
                            <span className="font-bold text-white text-lg tracking-wide">{mod.label}</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{mod.sub}</span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="mt-14 text-center relative z-10"
            >
                <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full glass-card border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] text-slate-200 text-sm font-bold tracking-wide hover:scale-105 transition-transform duration-300">
                    <div className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                    </div>
                    JanSeva AI is Online & Listening
                </div>
            </motion.div>
        </div>
    );
}
