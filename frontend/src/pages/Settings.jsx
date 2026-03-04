import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password change states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error('Error fetching user info:', error);
            toast.error('No se pudo cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Contraseña actualizada correctamente');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Hubo un error al actualizar la contraseña');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-slate-400 p-8 text-center animate-pulse">Cargando configuración...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <header className="mb-10 animate-slide-up">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Configuración</h2>
                <p className="text-slate-400">Administra tu cuenta, perfil privado y preferencias de seguridad.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Perfil Section */}
                <div className="glass-panel p-8 bg-black/20 border border-white/5 shadow-2xl rounded-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">Perfil de Usuario</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Correo Electrónico (Solo Lectura)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-300 opacity-70 cursor-not-allowed"
                            />
                            <p className="mt-2 text-xs text-slate-500">Para cambiar tu correo electrónico, contacta al administrador del sistema.</p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <label className="block text-sm font-medium text-slate-400 mb-2">ID de Usuario Interno</label>
                            <code className="block bg-black/40 px-4 py-3 rounded-xl border border-white/5 text-slate-400 text-xs truncate">
                                {user?.id}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Seguridad Section */}
                <div className="glass-panel p-8 bg-black/20 border border-white/5 shadow-2xl rounded-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">Seguridad</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength="6"
                                placeholder="Minimo 6 caracteres"
                                className="w-full bg-black/20 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-3 text-white transition-all placeholder-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength="6"
                                placeholder="Repita la nueva contraseña"
                                className="w-full bg-black/20 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-3 text-white transition-all placeholder-slate-600"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-4">
                            <button
                                type="submit"
                                disabled={saving || !newPassword || !confirmPassword}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 border border-white/5 disabled:hover:scale-100"
                            >
                                <Save className="w-4 h-4" />
                                <span>{saving ? 'Guardando...' : 'Actualizar Contraseña'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Version Info */}
            <div className="text-center mt-12 pt-8 border-t border-white/5 text-slate-500 text-sm">
                <p>SentinelFeedback MVC MVP</p>
                <p className="mt-1">Versión 1.0.0-beta</p>
            </div>
        </div>
    );
}
