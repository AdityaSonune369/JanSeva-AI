import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="w-full relative"
        >
            <button
                onClick={() => navigate('/')}
                className="fixed top-4 right-4 z-[100] p-3 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-white transition-all active:scale-95 group focus:outline-none focus:ring-2 focus:ring-india-saffron flex items-center justify-center"
                aria-label="Back to Home"
            >
                <Home size={20} className="group-hover:text-india-saffron transition-colors" />
            </button>
            {children}
        </motion.div>
    );
}
