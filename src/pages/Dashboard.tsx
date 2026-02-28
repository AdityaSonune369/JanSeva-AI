import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, Users, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MODULES = [
    { id: 'jobs', label: 'Rozgar', sub: 'Jobs', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'hover:border-blue-400/50' },
    { id: 'schemes', label: 'Yojna', sub: 'Schemes', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/20', border: 'hover:border-green-400/50' },
    { id: 'advisory', label: 'Paramarsh', sub: 'Advisory', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'hover:border-yellow-400/50' },
    { id: 'community', label: 'Samuday', sub: 'Community', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'hover:border-purple-400/50' },
    { id: 'issues', label: 'Samasya', sub: 'Issues', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/20', border: 'hover:border-red-400/50' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    return (
        <div className="p-6 pt-10 min-h-screen">
            <header className="mb-10 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold text-gradient mb-2">JanSeva AI</h1>
                    <p className="text-slate-400 text-lg">How can I help you today?</p>
                </motion.div>

                <div className="absolute right-0 top-0 opacity-20 animate-spin-slow">
                    <Sparkles size={120} className="text-white" />
                </div>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4"
            >
                {MODULES.map((mod) => (
                    <motion.div variants={item} key={mod.id}>
                        <Link
                            to={`/${mod.id}`}
                            className={`flex flex-col items-center justify-center p-6 glass-card border border-white/5 active:scale-95 aspect-square relative group overflow-hidden ${mod.border}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className={`p-4 rounded-2xl mb-4 ${mod.bg} ${mod.color} shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                                <mod.icon size={32} />
                            </div>
                            <span className="font-bold text-white text-lg">{mod.label}</span>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{mod.sub}</span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    JanSeva AI is Online & Listening
                </div>
            </motion.div>
        </div>
    );
}
