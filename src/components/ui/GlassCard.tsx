import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    delay?: number;
}

export function GlassCard({ children, className, onClick, delay = 0 }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            onClick={onClick}
            className={twMerge(
                "glass rounded-2xl p-6 transition-all",
                onClick && "cursor-pointer hover:shadow-2xl hover:bg-white/80",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
