import { 
  Bug, Lightbulb, BookText, HelpCircle, Plus, Menu, 
  LayoutDashboard, User, Sun, Moon, Laptop, LogOut,
  CircleDot, UserCircle, Calendar, FileText, Flag, Shapes, Tags, Baseline,
  Paperclip, Upload, ArrowUp, ArrowDown, Filter, Archive, LineChart, Ghost,
  Pencil as Edit, Trash2 as Trash, XCircle, Bell
} from 'lucide-react';

export const Icons = {
  Rejected: (props: { className?: string }) => <XCircle className={`h-5 w-5 ${props.className}`} />,
  Bug: (props: { className?: string }) => <Bug className={`h-4 w-4 mr-1.5 ${props.className}`} />,
  Feature: (props: { className?: string }) => <Lightbulb className={`h-4 w-4 mr-1.5 ${props.className}`} />,
  Documentation: (props: { className?: string }) => <BookText className={`h-4 w-4 mr-1.5 ${props.className}`} />,
  Question: (props: { className?: string }) => <HelpCircle className={`h-4 w-4 mr-1.5 ${props.className}`} />,
  Plus: (props: { className?: string }) => <Plus className={`h-6 w-6 ${props.className}`} />,
  Menu: (props: { className?: string }) => <Menu className={`h-6 w-6 ${props.className}`} />,
  Dashboard: (props: { className?: string }) => <LayoutDashboard className={`h-5 w-5 ${props.className}`} />,
  MyIssues: (props: { className?: string }) => <User className={`h-5 w-5 ${props.className}`} />,
  Reports: (props: { className?: string }) => <LineChart className={`h-5 w-5 ${props.className}`} />,
  Archive: (props: { className?: string }) => <Archive className={`h-5 w-5 ${props.className}`} />,
  Sun: (props: { className?: string }) => <Sun className={`h-5 w-5 mr-3 ${props.className}`} />,
  Moon: (props: { className?: string }) => <Moon className={`h-5 w-5 mr-3 ${props.className}`} />,
  System: (props: { className?: string }) => <Laptop className={`h-5 w-5 mr-3 ${props.className}`} />,
  LogOut: (props: { className?: string }) => <LogOut className={`h-5 w-5 mr-3 ${props.className}`} />,
  Logo: ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="text-primary">
      <rect x="10" y="10" width="80" height="80" rx="20" fill="currentColor" opacity="0.2" />
      <g transform="translate(25, 25) scale(2.2)" className="text-primary">
        <Bug strokeWidth={2.5} />
      </g>
    </svg>
  ),
  Title: (props: { className?: string }) => <Baseline className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Description: (props: { className?: string }) => <FileText className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Priority: (props: { className?: string }) => <Flag className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Type: (props: { className?: string }) => <Shapes className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Labels: (props: { className?: string }) => <Tags className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Status: (props: { className?: string }) => <CircleDot className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Assignee: (props: { className?: string }) => <UserCircle className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Deadline: (props: { className?: string }) => <Calendar className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Attachment: (props: { className?: string }) => <Paperclip className={`h-5 w-5 text-on-surface-variant ${props.className}`} />,
  Upload: (props: { className?: string }) => <Upload className={`h-8 w-8 text-on-surface-variant ${props.className}`} />,
  ArrowUp: (props: { className?: string }) => <ArrowUp className={`h-4 w-4 ${props.className}`} />,
  ArrowDown: (props: { className?: string }) => <ArrowDown className={`h-4 w-4 ${props.className}`} />,
  Filter: (props: { className?: string }) => <Filter className={`h-5 w-5 ${props.className}`} />,
  Ghost: (props: { className?: string }) => <Ghost className={`h-12 w-12 text-on-surface-variant/60 mb-4 ${props.className}`} />,
  Edit: (props: { className?: string }) => <Edit className={`h-4 w-4 ${props.className}`} />,
  Trash: (props: { className?: string }) => <Trash className={`h-4 w-4 ${props.className}`} />,
  Notification: (props: { className?: string }) => <Bell className={`h-5 w-5 ${props.className}`} />,
};