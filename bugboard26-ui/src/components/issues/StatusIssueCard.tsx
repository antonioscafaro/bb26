import React from 'react';
import { motion } from 'framer-motion';
import type { Issue } from '../../types';
import { priorityConfig, typeConfig } from '../../config/uiConstants';

interface StatusIssueCardProps {
    issue: Issue;
    onClick: () => void;
    isOpen: boolean;
    onActionClick: (e: React.MouseEvent) => void;
    actionIcon: React.ReactNode;
    footerText: string;
    isAdmin: boolean;
    disabled?: boolean;
}

/**
 * Una card generica per le issue in stati finali (archiviate, rifiutate).
 * @param {StatusIssueCardProps} props
 */
export const StatusIssueCard = ({ issue, onClick, isOpen, onActionClick, actionIcon, footerText, isAdmin, disabled }: StatusIssueCardProps) => (
    <motion.div
        layoutId={`card-container-${issue.id}`}
        onClick={disabled ? undefined : onClick}
        whileHover={disabled ? undefined : { y: -4, boxShadow: '0px 7px 15px rgba(0,0,0,0.08)' }}
        className={`bg-surface rounded-m3-l p-4 shadow-sm cursor-pointer h-full flex flex-col ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ opacity: isOpen ? 0 : (disabled ? 0.5 : 1), pointerEvents: isOpen || disabled ? 'none' : 'auto' }}
    >
        <div className="flex justify-between items-start">
            <motion.h3 layoutId={`card-title-${issue.id}`} className="font-medium text-on-surface mb-2 pr-4">{issue.title}</motion.h3>
            {issue.priority && <span className={`px-2.5 py-1 text-xs font-semibold rounded-m3-sm ${priorityConfig[issue.priority].bg} ${priorityConfig[issue.priority].text}`}>{priorityConfig[issue.priority].name}</span>}
        </div>
        <div className="flex items-center text-sm text-on-surface-variant/80 mb-3">
            {issue.type && typeConfig[issue.type] ? <><span className="mr-1">{typeConfig[issue.type].icon}</span><span>{typeConfig[issue.type].label}</span></> : <span>Generale</span>}
        </div>
        <div className="flex justify-between items-center border-t border-outline-variant pt-3 mt-auto">
            <div className="flex items-center gap-2">
                <img src={issue.reporter.avatarUrl} alt={issue.reporter.name} className="w-6 h-6 rounded-full" />
                <span className="text-xs text-on-surface-variant">{footerText}</span>
            </div>
            {isAdmin && (
                <motion.button onClick={onActionClick} whileTap={{ scale: 0.9 }} aria-label="Azione sulla issue" className="h-8 w-8 rounded-full flex items-center justify-center transition-colors text-on-surface-variant hover:bg-primary/10 hover:text-primary z-10">
                    {actionIcon}
                </motion.button>
            )}
        </div>
    </motion.div>
);