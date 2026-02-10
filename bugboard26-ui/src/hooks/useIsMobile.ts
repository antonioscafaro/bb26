import { useState, useEffect } from 'react';

/**
 * Hook custom che ritorna `true` se la larghezza della finestra
 * è inferiore a 768px (breakpoint 'md' di Tailwind).
 * @returns {boolean} `true` se è un dispositivo mobile, altrimenti `false`.
 */
export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};