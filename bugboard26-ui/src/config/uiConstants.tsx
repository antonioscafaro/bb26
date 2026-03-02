import { Icons } from '../components/common/Icons';
import type { IssuePriority, IssueType } from '../types';
import React from 'react';

export const priorityConfig: Record<IssuePriority, { name: string; bg: string; text: string }> = {
  low: { name: 'Bassa', bg: 'bg-blue-100', text: 'text-blue-800' },
  medium: { name: 'Media', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { name: 'Alta', bg: 'bg-orange-100', text: 'text-orange-800' },
  critical: { name: 'Critica', bg: 'bg-red-100', text: 'text-red-800' },
};

export const typeConfig: Record<IssueType, { label: string; icon: React.ReactElement }> = {
  bug: { label: 'Bug', icon: <Icons.Bug /> },
  feature: { label: 'Feature', icon: <Icons.Feature /> },
  question: { label: 'Question', icon: <Icons.Question /> },
  documentation: { label: 'Documentation', icon: <Icons.Documentation /> },
};

export const API_URL = '/api';
