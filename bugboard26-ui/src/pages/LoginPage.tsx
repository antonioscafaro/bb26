import { useState } from 'react';
import { useAuth } from '../context/AuthContext.shared';
import { Icons } from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTI INTERNI ---

const AnimatedInputField = ({ id, label, value, onChange, type = 'text', required = false, children }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    children?: React.ReactNode;
}) => (
    <motion.div
        className="relative"
        whileFocus={{ y: -2, boxShadow: "0px 4px 8px rgba(0,0,0,0.1), 0px 0px 0px 2px var(--primary-container)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
    >
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className="w-full h-14 px-4 pt-5 text-on-surface bg-surface-variant rounded-t-lg border-b-2 border-outline focus:outline-none focus:border-primary peer transition-all duration-200"
            placeholder=" "
            required={required}
        />
        <label
            htmlFor={id}
            className="absolute top-4 left-4 text-on-surface-variant transition-all duration-300 transform origin-top-left pointer-events-none
                       peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                       peer-focus:scale-75 peer-focus:-translate-y-3.5 peer-focus:text-primary
                       peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:text-primary"
        >
            {label}
        </label>
        {children}
    </motion.div>
);

// --- PAGINA DI LOGIN ---

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        try {
            const isLoggedIn = await login(email, password);
            if (isLoggedIn) {
                navigate('/');
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <main className="relative flex items-center justify-center min-h-dvh w-screen bg-background p-4 lg:p-8 overflow-hidden">
            {/* Sfondo con triangoli animati che però non funziona prima o poi capirò come farla funzionare*/}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-primary/20 rounded-sm"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: 0.2 + Math.random() * 0.5,
                            rotate: Math.random() * 360,
                            opacity: 0.3 + Math.random() * 0.4,
                            width: 30 + Math.random() * 40,
                            height: 30 + Math.random() * 40,
                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        }}
                        animate={{
                            x: `calc(${Math.random() * 100}vw - 50px)`,
                            y: `calc(${Math.random() * 100}vh - 50px)`,
                            rotate: (i % 2 === 0 ? 1 : -1) * 360 + Math.random() * 720,
                            opacity: 0.3 + Math.random() * 0.4,
                            scale: 0.2 + Math.random() * 0.5,
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 30 + Math.random() * 20,
                            ease: "linear",
                            delay: Math.random() * 10,
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="z-10 w-full max-w-sm md:max-w-4xl mx-auto flex flex-col md:flex-row overflow-hidden rounded-m3-xl shadow-2xl border border-outline-variant/20 dark:border-white/[.08]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] } }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            >
                {/* Pannello Sinistro - Branding (solo Desktop) */}
                <div className="hidden md:flex md:w-1/2 bg-primary-container p-10 text-on-primary-container relative flex-col justify-center items-start overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="z-10"
                    >
                        <Icons.Logo size={64} />
                        <h1 className="text-5xl font-bold mt-6 tracking-tight">BugBoard26</h1>
                        <p className="mt-2 text-lg opacity-80">Traccia. Collabora. Risolvi.</p>
                    </motion.div>

                    <motion.div
                        className="absolute -bottom-20 -right-20 w-52 h-52 bg-primary/20 rounded-full"
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute -top-24 -left-12 w-48 h-48 bg-primary/10 rounded-full"
                        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
                    />
                </div>

                {/* Pannello Destro - Form di Login */}
                <div className="w-full md:w-1/2 bg-surface p-8 sm:p-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="flex flex-col h-full justify-center"
                    >
                        {/* Mobile Header - Visibile solo su smartphone */}
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            className="md:hidden flex flex-col items-center mb-8 text-center"
                        >
                            <Icons.Logo size={48} />
                            <h1 className="text-3xl font-bold mt-4 tracking-tight text-on-surface">BugBoard26</h1>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <h2 className="text-2xl font-medium text-on-surface text-center md:text-left">Bentornato</h2>
                            <p className="text-on-surface-variant mt-1 text-sm text-center md:text-left">Inserisci le tue credenziali per continuare.</p>
                        </motion.div>

                        <form className="space-y-6 flex flex-col mt-8" onSubmit={handleLogin} noValidate>
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <AnimatedInputField
                                    id="email" label="Email" type="email"
                                    value={email} onChange={(e) => setEmail(e.target.value)} required
                                />
                            </motion.div>

                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <AnimatedInputField
                                    id="password" label="Password" type={showPassword ? 'text' : 'password'}
                                    value={password} onChange={(e) => setPassword(e.target.value)} required
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-4 right-4 text-on-surface-variant"
                                        aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                                        whileHover={{ scale: 1.2, color: 'var(--primary)' }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </motion.button>
                                </AnimatedInputField>
                            </motion.div>

                            <AnimatePresence>
                                {error &&
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-sm text-center text-error font-medium"
                                    >
                                        {error}
                                    </motion.p>
                                }
                            </AnimatePresence>

                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    variant="filled"
                                    disabled={!email || !password || loading}
                                    className="min-w-[108px]"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <LoaderCircle className="animate-spin" size={20} />
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="ready"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                Accedi
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
};