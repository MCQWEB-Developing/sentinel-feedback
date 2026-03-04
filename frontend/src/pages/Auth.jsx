import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [errorMatch, setErrorMatch] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMatch('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success(`Bienvenido as ${email}`);
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast.success('Registro exitoso. Revisa tu correo o inicia sesión.');
                setIsLogin(true);
            }
        } catch (error) {
            setErrorMatch(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-linear-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-3xl bg-black/40 border-white/10 text-white shadow-2xl animate-fade-in relative z-10 overflow-hidden">
                {/* Background Orbs local to auth */}
                <div className="absolute top-[-50%] left-[-50%] w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <div className="text-center mb-10 relative z-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-400 to-purple-400 tracking-tight mb-2">
                        Sentinel<span className="font-light">Feedback</span>
                    </h1>
                    <p className="text-slate-400 text-sm">{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta de encuestas IA'}</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                    {errorMatch && (
                        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                            {errorMatch}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400 relative z-10">
                    {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setErrorMatch(''); }}
                        className="text-brand-400 hover:text-brand-300 hover:underline font-medium transition-colors"
                    >
                        {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}
