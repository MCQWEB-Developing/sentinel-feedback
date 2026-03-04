import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Crear Encuesta', path: '/create', icon: PlusCircle },
        { name: 'Configuración', path: '/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="h-screen bg-slate-900 bg-linear-to-br from-slate-900 via-brand-900 to-slate-900 flex overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

            {/* Sidebar */}
            <aside className="w-64 m-4 glass-panel rounded-3xl flex flex-col relative z-10 bg-black/40 border-white/10 text-white">
                <div className="p-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-400 to-purple-400 tracking-tight py-1 pr-4 w-max">Sentinel<span className="font-light">Feedback</span></h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors duration-300 rounded-2xl hover:bg-white/5">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen w-full relative z-10 flex overflow-hidden">
                <div className="flex-1 m-4 ml-0 glass-panel rounded-3xl p-8 bg-black/20 border-white/5 text-white overflow-y-auto animate-fade-in shadow-2xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
