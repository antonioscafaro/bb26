import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.shared';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export const SseManager: React.FC = () => {
    const { currentUser } = useAuth();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!currentUser?.email) return;

        const fireAllEvents = () => {
            window.dispatchEvent(new CustomEvent('project-update'));
            window.dispatchEvent(new CustomEvent('notification-update'));
            window.dispatchEvent(new CustomEvent('issue-update'));
        };

        // Fire once immediately on mount for fast initial load
        fireAllEvents();

        // Then poll periodically
        intervalRef.current = setInterval(fireAllEvents, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentUser]);

    return null; // Component renders nothing
};

