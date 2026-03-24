import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.shared';
import { EventSourcePolyfill } from 'event-source-polyfill';

export const SseManager: React.FC = () => {
    const { currentUser } = useAuth();
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!currentUser?.email) return;

        let eventSource: EventSourcePolyfill | null = null;
        let isCancelled = false;

        const connect = () => {
            if (isCancelled) return;

            const url = `/api/sse/subscribe/${encodeURIComponent(currentUser.email)}`;
            console.log("Connecting to SSE:", url);

            eventSource = new EventSourcePolyfill(url, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            eventSource.onopen = () => {
                console.log("SSE Connection Opened");
            };

            eventSource.onerror = (e) => {
                console.warn("SSE Connection Error, will auto-reconnect...", e);
                if (eventSource?.readyState === EventSource.CLOSED) {
                    console.log("SSE: Server closed connection, retrying in 5s...");
                    eventSource.close();
                    retryTimeoutRef.current = setTimeout(() => {
                        if (!isCancelled) connect();
                    }, 5000);
                }
            };

            eventSource.addEventListener('project-update', () => {
                console.log("SSE Received: project-update");
                window.dispatchEvent(new CustomEvent('project-update'));
            });

            eventSource.addEventListener('notification-update', () => {
                console.log("SSE Received: notification-update");
                window.dispatchEvent(new CustomEvent('notification-update'));
            });

            eventSource.addEventListener('issue-update', () => {
                console.log("SSE Received: issue-update");
                window.dispatchEvent(new CustomEvent('issue-update'));
            });
        };

        connect();

        return () => {
            console.log("Closing SSE Connection");
            isCancelled = true;
            if (eventSource) eventSource.close();
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        };
    }, [currentUser]);

    return null;
};
