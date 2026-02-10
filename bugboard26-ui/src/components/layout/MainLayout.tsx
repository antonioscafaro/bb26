import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.shared';
import { useProjects } from '../../context/ProjectContext.shared';
import { useIssues } from '../../context/IssueContext.shared';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icons } from '../common/Icons';
import { NavLink } from './NavLink';
import { UserProfile } from '../users/UserProfile';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { USER_ROLE } from '../../constants';

const NotifiedNavLink = ({ to, icon, children, onClick, showIndicator }: {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
    showIndicator: boolean;
}) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center justify-between h-14 px-4 text-sm font-medium rounded-m3-xl transition-colors ${isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-variant'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{children}</span>
            </div>
            <AnimatePresence>
                {showIndicator && (
                    <motion.div
                        key="indicator"
                        className="w-3 h-3 bg-primary rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                )}
            </AnimatePresence>
        </Link>
    );
};


export const MainLayout = () => {
    const { currentUser } = useAuth();
    const { selectedProject, selectedProjectId } = useProjects();
    const { state: issueState } = useIssues();
    const isMobile = useIsMobile();

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isAdminMenuOpen, setAdminMenuOpen] = useState(!isMobile);
    const [isProjectMenuOpen, setProjectMenuOpen] = useState(true);

    const unreadCount = useMemo(() =>
        issueState.notifications.filter(n => !n.isRead).length,
        [issueState.notifications]
    );

    const location = useLocation();
    const [hasNewRejected, setHasNewRejected] = useState(false);

    const rejectedIssues = useMemo(() => {
        if (!selectedProjectId || !currentUser) return [];
        return issueState.issues.filter(issue =>
            issue.projectId === selectedProjectId && // Issue projectId is number/string? Types say string. Backend usually number. 
            // We should use strict equality or loose depending on context. 
            // In project context 'selectedProjectId' is string (from URL) or number? 
            // Let's assume matches context logic.
            String(issue.projectId) === String(selectedProjectId) &&
            issue.status === 'rejected' &&
            (currentUser.role === USER_ROLE.ADMIN || issue.assignee?.id === currentUser.id)
        );
    }, [issueState.issues, selectedProjectId, currentUser]);

    useEffect(() => {
        if (!selectedProjectId || !currentUser) return;

        const storageKey = `rejected_last_seen_ts_${selectedProjectId}_${currentUser.id}`;
        const stored = localStorage.getItem(storageKey);
        const lastSeenTs = stored ? parseInt(stored, 10) : 0;

        // Calculate max timestamp of current rejected issues
        const maxIssueTs = rejectedIssues.reduce((max, issue) => {
            const ts = new Date(issue.updatedAt).getTime();
            return ts > max ? ts : max;
        }, 0);

        if (location.pathname.includes('/rejected')) {
            // User is viewing the page. Update knowledge to current max.
            if (maxIssueTs > lastSeenTs) {
                localStorage.setItem(storageKey, maxIssueTs.toString());
            }
            setHasNewRejected(false);
        } else {
            // User is not on page. Check if we have anything newer than last seen.
            if (maxIssueTs > lastSeenTs) {
                setHasNewRejected(true);
            } else {
                setHasNewRejected(false);
            }
        }
    }, [rejectedIssues, location.pathname, selectedProjectId, currentUser]);

    const baseProjectUrl = selectedProjectId ? `/project/${selectedProjectId}` : '';

    useEffect(() => {
        const isOverlayOpen = isSidebarOpen || isNotificationsOpen;
        document.body.style.overflow = isOverlayOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isSidebarOpen, isNotificationsOpen]);

    useEffect(() => {
        setAdminMenuOpen(!isMobile);
        setProjectMenuOpen(true);
    }, [isMobile]);

    const handleMenuClick = () => setSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);
    const toggleNotifications = () => setNotificationsOpen(prev => !prev);
    const closeNotifications = () => setNotificationsOpen(false);

    if (!currentUser) return null;

    return (
        <div className="h-dvh w-screen bg-background flex font-sans">
            <aside className={`absolute md:relative z-30 h-full bg-surface w-72 flex-shrink-0 flex flex-col p-2 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 `}>
                <div className="h-20 flex-shrink-0 flex items-center px-4 relative">
                    <Link to="/" onClick={closeSidebar} className="h-full flex items-center">
                        <Icons.Logo />
                        <span className="text-xl font-bold text-on-surface ml-2">BugBoard26</span>
                    </Link>
                </div>

                <nav className="flex-grow p-2 space-y-2 overflow-y-auto no-scrollbar">
                    <NavLink to="/" icon={<Icons.Dashboard />} onClick={closeSidebar}>Progetti</NavLink>
                    {selectedProjectId && (
                        <motion.div layout className="overflow-hidden">
                            <button onClick={() => isMobile && setProjectMenuOpen(!isProjectMenuOpen)} className="w-full flex items-center justify-between px-4 pt-4 pb-2 text-xs font-bold text-on-surface-variant" disabled={!isMobile}>
                                <span className="truncate">{selectedProject?.name || 'Progetto Corrente'}</span>
                                {isMobile && <motion.div animate={{ rotate: isProjectMenuOpen ? 180 : 0 }}><ChevronDown size={16} /></motion.div>}
                            </button>
                            <AnimatePresence initial={false}>
                                {isProjectMenuOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="py-2 space-y-2">
                                            <NavLink to={`${baseProjectUrl}/board`} icon={<Icons.Dashboard />} onClick={closeSidebar}>Dashboard</NavLink>
                                            <NavLink to={`${baseProjectUrl}/my-issues`} icon={<Icons.MyIssues />} onClick={closeSidebar}>Le mie Issues</NavLink>
                                            <NotifiedNavLink to={`${baseProjectUrl}/rejected`} icon={<Icons.Rejected />} onClick={closeSidebar} showIndicator={hasNewRejected}>Rifiutate</NotifiedNavLink>
                                            {currentUser?.role === USER_ROLE.ADMIN && (
                                                <NavLink to={`${baseProjectUrl}/archive`} icon={<Icons.Archive />} onClick={closeSidebar}>Archivio</NavLink>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    {currentUser?.role === USER_ROLE.ADMIN && (
                        <motion.div layout className="overflow-hidden">
                            <button onClick={() => isMobile && setAdminMenuOpen(!isAdminMenuOpen)} className="w-full flex items-center justify-between gap-3 px-4 pt-4 pb-2 text-xs font-bold text-on-surface-variant" disabled={!isMobile}>
                                <span>Area Admin</span>
                                {isMobile && <motion.div animate={{ rotate: isAdminMenuOpen ? 180 : 0 }}><ChevronDown size={16} /></motion.div>}
                            </button>
                            <AnimatePresence initial={false}>
                                {isAdminMenuOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="py-2 space-y-2">
                                            <NavLink to="/users" icon={<Icons.MyIssues />} onClick={closeSidebar}>Gestione Utenti</NavLink>
                                            <NavLink to="/reports" icon={<Icons.Reports />} onClick={closeSidebar}>Reports</NavLink>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </nav>

                <div className="p-2 space-y-2 mt-auto">
                    <button onClick={toggleNotifications} className="w-full flex items-center justify-between gap-3 h-14 px-4 text-sm font-medium rounded-m3-xl text-on-surface-variant hover:bg-surface-variant transition-colors">
                        <div className="flex items-center gap-3"><Icons.Notification /><span>Notifiche</span></div>
                        {unreadCount > 0 && <div className="bg-primary text-on-primary text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{unreadCount}</div>}
                    </button>
                    <UserProfile currentUser={currentUser} />
                </div>
            </aside>

            {isSidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 bg-black/30 z-20 md:hidden"></div>}

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Outlet context={{ onMenuClick: handleMenuClick, currentUser }} />
            </main>

            <NotificationDrawer isOpen={isNotificationsOpen} onClose={closeNotifications} />
        </div>
    );
};