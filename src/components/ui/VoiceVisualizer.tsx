import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
    isListening: boolean;
}

export function VoiceVisualizer({ isListening }: VoiceVisualizerProps) {
    if (!isListening) return null;

    return (
        <div className="flex gap-1 items-center justify-center h-8">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        height: [10, 24, 10],
                        backgroundColor: ["#FF9933", "#138808", "#FF9933"]
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className="w-2 rounded-full bg-india-saffron"
                />
            ))}
        </div>
    );
}
