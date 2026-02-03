import type { IssuePriority, IssueType } from './index';

export type Filters = {
  types: IssueType[];
  priorities: IssuePriority[];
  assigneeId: string | 'unassigned' | 'all';
};

export type Sorting = {
  by: 'createdAt' | 'priority' | 'title';
  direction: 'asc' | 'desc';
};