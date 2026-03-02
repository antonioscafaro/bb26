import { useToaster, resolveValue } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const StackingToaster = () => {
    const { toasts, handlers } = useToaster();
    const { startPause, endPause } = handlers;
    const [isHovered, setIsHovered] = useState(false);

    // Get visible toasts, take newest 5, and REVERSE them so Newest is Index 0 (Front/Top)
    const visibleToasts = toasts
        .filter((t) => t.visible)
        .slice(0, 5)
        .slice(0, 5);

    return (
        <div
            className="fixed top-4 right-4 z-[9999] flex flex-col items-end"
            onMouseEnter={() => {
                startPause();
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                endPause();
                setIsHovered(false);
            }}
        >
            <AnimatePresence mode='popLayout'>
                {visibleToasts.map((t, index) => {
                    // Logic:
                    // Hovered: Relative positioning (Flow Layout), Y=0 (Natural position)
                    // Stacked: Absolute positioning (Pile Layout), Y=Index*Offset (Stacked visual)

                    const scale = isHovered ? 1 : 1 - index * 0.05;
                    const opacity = isHovered ? 1 : 1 - index * 0.1;
                    const zIndex = 50 - index;
                    const y = isHovered ? 0 : index * 10; // Only offset "down" when stacked

                    return (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{
                                opacity,
                                scale,
                                zIndex,
                                y // When relative, this adds to natural position. When absolute, it sets from top.
                                // Actually if relative, y translates from natural. So y=0 is correct.
                            }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{
                                type: 'spring',
                                stiffness: 350,
                                damping: 25,
                                mass: 1
                            }}
                            style={{
                                // Crucial switch for dynamic height support
                                position: isHovered ? 'relative' : 'absolute',
                                right: 0, // Always anchor right
                                marginBottom: isHovered ? '0.5rem' : '0', // Add gap manually via margin when hovered
                                touchAction: 'none'
                            }}
                            className="flex justify-end transform-gpu"
                        >
                            <div className="w-auto origin-top-right">
                                {resolveValue(t.message, t)}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
