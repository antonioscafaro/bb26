// src/pages/Reports.tsx
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, type PieLabelRenderProps } from 'recharts';
import { ArrowRight, LoaderCircle, AlertTriangle } from 'lucide-react';
import { useProjects } from '../context/ProjectContext.shared';
import { useIssues } from '../context/IssueContext.shared';
import { Header } from '../components/layout/Header';
import { Icons } from '../components/common/Icons';
import { MetricCard } from '../components/reports/MetricCard';
import { ChartContainer } from '../components/reports/ChartContainer';
import { Select } from '../components/common/Select';
import api from '../api/axios';
import { Toast } from '../components/common/Toast';
import { getApiErrorMessage } from '../utils/apiErrors';

type PageContext = { onMenuClick: () => void; };

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

// Types matching backend DTOs
interface ReportUtenteDTO {
    utente: { email: string; nome: string; cognome?: string };
    issueCreate: number;
    issueAssegnate: number;
    issueRisolte: number;
    tempoMedioRisoluzionePersonale: number;
    efficienza: number;
}

interface ReportMensileDTO {
    totaleIssueCreate: number;
    totaleIssueRisolte: number;
    totaleIssueAperte: number;
    tempoMedioRisoluzioneGlobale: number;
    distribuzionePerTipo: Record<string, number>;
    distribuzionePerPriorita: Record<string, number>;
    performanceUtenti: ReportUtenteDTO[];
    allerteCritiche: { id: number; titolo: string; prioritaIssue: string }[];
}

// Material 3 inspired color palette - harmonious and accessible
const M3_COLORS = {
    primary: 'hsl(265, 90%, 55%)',        // Purple
    secondary: 'hsl(330, 70%, 55%)',      // Pink
    tertiary: 'hsl(180, 60%, 45%)',       // Teal
    success: 'hsl(145, 60%, 45%)',        // Green
    warning: 'hsl(40, 90%, 55%)',         // Amber
    error: 'hsl(0, 70%, 55%)',            // Red
    info: 'hsl(210, 70%, 55%)',           // Blue
    neutral: 'hsl(265, 20%, 50%)'         // Muted purple
};

const PRIORITY_COLORS: Record<string, string> = {
    NESSUNA: M3_COLORS.neutral,
    BASSA: M3_COLORS.success,
    MEDIA: M3_COLORS.warning,
    ALTA: M3_COLORS.secondary,
    CRITICA: M3_COLORS.error
};

const TYPE_COLORS: Record<string, string> = {
    BUG: M3_COLORS.error,
    FEATURE: M3_COLORS.primary,
    DOCUMENTATION: M3_COLORS.tertiary,
    QUESTION: M3_COLORS.warning
};

export const Reports = () => {
    const { onMenuClick } = useOutletContext<PageContext>();
    const { projects } = useProjects();
    const { state } = useIssues();
    const { users } = state;

    const currentDate = new Date();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [reportData, setReportData] = useState<ReportMensileDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const months = [
        { value: 1, label: 'Gennaio' }, { value: 2, label: 'Febbraio' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Aprile' }, { value: 5, label: 'Maggio' }, { value: 6, label: 'Giugno' },
        { value: 7, label: 'Luglio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Settembre' },
        { value: 10, label: 'Ottobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Dicembre' }
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    }, []);

    // Auto-generate report on mount or when filters change
    useEffect(() => {
        handleGenerateReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReportData(null);

        try {
            let endpoint: string;
            const params: { mese: number; anno: number; userId?: string } = {
                mese: selectedMonth,
                anno: selectedYear
            };

            if (selectedUserId !== 'all') {
                params.userId = selectedUserId;
            }

            if (selectedProjectId === 'all') {
                endpoint = '/progetti/report';
            } else {
                endpoint = `/progetti/${selectedProjectId}/report`;
            }

            const response = await api.get<ReportMensileDTO>(endpoint, { params });
            setReportData(response.data);
        } catch (error) {
            console.error("Failed to fetch report:", error);
            Toast.error(getApiErrorMessage(error, 'Impossibile generare il report.'));
        } finally {
            setIsLoading(false);
        }
    };

    // Transform data for charts with smooth gradients
    const typeChartData = useMemo(() => {
        if (!reportData?.distribuzionePerTipo) return [];
        return Object.entries(reportData.distribuzionePerTipo)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name.charAt(0) + name.slice(1).toLowerCase(),
                value: Math.round(value * 10) / 10,
                fill: TYPE_COLORS[name] || M3_COLORS.neutral
            }));
    }, [reportData]);

    const priorityChartData = useMemo(() => {
        if (!reportData?.distribuzionePerPriorita) return [];
        return Object.entries(reportData.distribuzionePerPriorita)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name.charAt(0) + name.slice(1).toLowerCase(),
                value: Math.round(value * 10) / 10,
                fill: PRIORITY_COLORS[name] || M3_COLORS.neutral
            }));
    }, [reportData]);

    const userPerformanceData = useMemo(() => {
        if (!reportData?.performanceUtenti) return [];
        return reportData.performanceUtenti.map(u => ({
            name: u.utente.nome + (u.utente.cognome ? ` ${u.utente.cognome.charAt(0)}.` : ''),
            issueRisolte: u.issueRisolte,
            efficienza: u.efficienza
        }));
    }, [reportData]);

    const renderCustomLabel = (props: PieLabelRenderProps) => {
        const cx = Number(props.cx);
        const cy = Number(props.cy);
        const midAngle = Number(props.midAngle);
        const innerRadius = Number(props.innerRadius);
        const outerRadius = Number(props.outerRadius);
        const percent = Number(props.percent);
        if (percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <Header onMenuClick={onMenuClick} />
            <motion.div layout className="p-4 sm:p-6 flex-grow overflow-y-auto">
                <motion.div layout variants={itemVariants} className="bg-surface p-6 rounded-m3-l shadow-sm max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="project-select" className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Progetto</label>
                                <Select id="project-select" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="h-14">
                                    <option value="all">Tutti i progetti</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="user-select" className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Utente</label>
                                <Select id="user-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="h-14">
                                    <option value="all">Tutti gli utenti</option>
                                    {users.map(u => <option key={u.id} value={u.email}>{u.name} {u.surname || ''}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="month-select" className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Mese</label>
                                <Select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="h-14">
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="year-select" className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Anno</label>
                                <Select id="year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="h-14">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </Select>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center mt-4 lg:mt-0">
                            <motion.button
                                type="button"
                                onClick={handleGenerateReport}
                                disabled={isLoading}
                                aria-label="Genera Report"
                                className="h-14 w-14 rounded-m3-l bg-primary text-on-primary flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:bg-on-surface/20 disabled:text-on-surface/40 flex-shrink-0"
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isLoading ? (
                                        <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
                                            <LoaderCircle className="animate-spin" size={24} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="icon" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
                                            <ArrowRight size={24} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div key="report-data" initial="hidden" animate="visible" exit="hidden" variants={containerVariants} className="mt-6 max-w-6xl mx-auto space-y-6">
                            {/* Main Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard title="Issue Create" value={reportData.totaleIssueCreate} />
                                <MetricCard title="Issue Risolte" value={reportData.totaleIssueRisolte} />
                                <MetricCard title="Issue Attualmente Aperte" value={reportData.totaleIssueAperte} subtitle="Conteggio in tempo reale, varia per utente e progetto" />
                                <MetricCard title="Tempo Medio Ris." value={reportData.tempoMedioRisoluzioneGlobale.toFixed(1)} unit="ore" />
                            </div>

                            {/* Distribution Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartContainer title="Distribuzione per Tipo">
                                    {typeChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <defs>
                                                    {typeChartData.map((entry, index) => (
                                                        <linearGradient key={`gradient-type-${index}`} id={`gradient-type-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <Pie
                                                    data={typeChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    labelLine={false}
                                                    label={renderCustomLabel}
                                                    stroke="none"
                                                >
                                                    {typeChartData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={`url(#gradient-type-${index})`} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => `${value}%`}
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface)',
                                                        borderColor: 'var(--outline-variant)',
                                                        borderRadius: '16px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => <span style={{ color: 'var(--on-surface)' }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-on-surface-variant">
                                            Nessun dato disponibile
                                        </div>
                                    )}
                                </ChartContainer>
                                <ChartContainer title="Distribuzione per Priorità">
                                    {priorityChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <defs>
                                                    {priorityChartData.map((entry, index) => (
                                                        <linearGradient key={`gradient-priority-${index}`} id={`gradient-priority-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <Pie
                                                    data={priorityChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    labelLine={false}
                                                    label={renderCustomLabel}
                                                    stroke="none"
                                                >
                                                    {priorityChartData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={`url(#gradient-priority-${index})`} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => `${value}%`}
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface)',
                                                        borderColor: 'var(--outline-variant)',
                                                        borderRadius: '16px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => <span style={{ color: 'var(--on-surface)' }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center text-on-surface-variant">
                                            Nessun dato disponibile
                                        </div>
                                    )}
                                </ChartContainer>
                            </div>

                            {/* User Performance */}
                            {userPerformanceData.length > 0 && (
                                <ChartContainer title="Performance Utenti">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={userPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={M3_COLORS.primary} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={M3_COLORS.primary} stopOpacity={0.6} />
                                                </linearGradient>
                                                <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={M3_COLORS.tertiary} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={M3_COLORS.tertiary} stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" opacity={0.5} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="var(--on-surface-variant)"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={{ stroke: 'var(--outline-variant)' }}
                                            />
                                            <YAxis
                                                stroke="var(--on-surface-variant)"
                                                fontSize={12}
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={{ stroke: 'var(--outline-variant)' }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'var(--surface-variant)', opacity: 0.3, radius: 8 }}
                                                contentStyle={{
                                                    backgroundColor: 'var(--surface)',
                                                    borderColor: 'var(--outline-variant)',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}
                                            />
                                            <Bar
                                                dataKey="issueRisolte"
                                                name="Issue Risolte"
                                                fill="url(#barGradientPrimary)"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="efficienza"
                                                name="Efficienza %"
                                                fill="url(#barGradientSecondary)"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                height={36}
                                                formatter={(value) => <span style={{ color: 'var(--on-surface)' }}>{value}</span>}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            )}

                            {/* Critical Alerts */}
                            {reportData.allerteCritiche && reportData.allerteCritiche.length > 0 && (
                                <motion.div variants={itemVariants} className="bg-error-container/80 backdrop-blur-sm p-5 rounded-m3-l border border-error/20">
                                    <h3 className="text-lg font-semibold text-on-error-container flex items-center gap-2 mb-3">
                                        <AlertTriangle size={20} /> Allerte Critiche ({reportData.allerteCritiche.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {reportData.allerteCritiche.map(issue => (
                                            <li key={issue.id} className="text-sm text-on-error-container/90 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
                                                {issue.titolo} <span className="text-on-error-container/60">(ID: {issue.id})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : !isLoading && (
                        <motion.div key="placeholder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} variants={itemVariants} className="text-center p-12 mt-6 bg-surface-variant/40 rounded-m3-xl max-w-5xl mx-auto">
                            <Icons.Reports className="mx-auto h-12 w-12 text-on-surface-variant/60 mb-4" />
                            <p className="text-lg text-on-surface-variant font-medium">Pronto a generare un report</p>
                            <p className="text-sm text-on-surface-variant/80">Seleziona i filtri desiderati e clicca la freccia per generare il report.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};