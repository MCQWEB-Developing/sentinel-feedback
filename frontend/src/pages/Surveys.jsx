import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, MessageSquare, Plus, Copy, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ totalResponses: 0, aiAnalysisRate: 0 });
    const navigate = useNavigate();

    // Stats for MVP view
    const stats = [
        { label: 'Encuestas Activas', value: surveys.filter(s => s.is_active).length.toString(), icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
        { label: 'Respuestas Totales', value: metrics.totalResponses.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Análisis IA Efectuados', value: `${metrics.aiAnalysisRate}%`, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ];

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            // 1. Fetch Surveys
            const { data: surveysData, error: surveysError } = await supabase
                .from('surveys')
                .select('*')
                .order('created_at', { ascending: false });

            if (surveysError) throw surveysError;
            setSurveys(surveysData || []);

            if (surveysData && surveysData.length > 0) {
                const activeSurveys = surveysData.filter(s => s.is_active);
                const surveyIds = activeSurveys.map(s => s.id);

                if (surveyIds.length === 0) {
                    setMetrics({ totalResponses: 0, aiAnalysisRate: 0 });
                    return;
                }

                // 2. Aggregate Responses Total (Only active surveys)
                const { count: responsesCount, error: countError } = await supabase
                    .from('responses')
                    .select('*', { count: 'exact', head: true })
                    .in('survey_id', surveyIds);

                if (countError) throw countError;

                // 3. Aggregate AI Analysis Total
                let totalTextAnswers = 0;
                let totalAnalyzed = 0;

                const { data: textQuestionsData, error: tqError } = await supabase
                    .from('questions')
                    .select('id')
                    .eq('question_type', 'text')
                    .in('survey_id', surveyIds);

                const textQuestionIds = textQuestionsData ? textQuestionsData.map(q => q.id) : [];

                if (textQuestionIds.length > 0) {
                    const { data: answersData, error: ansError } = await supabase
                        .from('answers')
                        .select('id, ai_analysis(id)')
                        .in('question_id', textQuestionIds);

                    if (!ansError && answersData) {
                        // Filter the answers that have a related ai_analysis record
                        const validAnalyses = answersData.filter(a => {
                            if (!a.ai_analysis) return false;
                            // PostgREST might return an array if it doesn't strictly infer 1-to-1 or an object. 
                            if (Array.isArray(a.ai_analysis)) return a.ai_analysis.length > 0;
                            return Object.keys(a.ai_analysis).length > 0;
                        });
                        totalAnalyzed = validAnalyses.length;
                    }

                    // This logic is a global statistical approximation for the dashboard MVP
                    // Assuming every response answers every text question
                    totalTextAnswers = responsesCount * textQuestionIds.length;
                }

                let aiRate = 0;
                if (totalTextAnswers > 0 && totalAnalyzed > 0) {
                    aiRate = Math.round((totalAnalyzed / totalTextAnswers) * 100);
                    // Cap at 100% just in case of data inconsistencies
                    aiRate = aiRate > 100 ? 100 : aiRate;
                }

                setMetrics({
                    totalResponses: responsesCount || 0,
                    aiAnalysisRate: aiRate
                });
            }

        } catch (error) {
            console.error("Error fetching surveys and stats:", error);
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (id) => {
        const url = `${window.location.origin}/s/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Enlace público copiado al portapapeles');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta encuesta y TODAS sus respuestas (incluyendo el análisis de IA)? Esta acción es irreversible.')) return;
        try {
            const { error } = await supabase.from('surveys').delete().eq('id', id);
            if (error) throw error;
            toast.success('Encuesta eliminada correctamente');
            setSurveys(surveys.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting survey:', error);
            toast.error('Hubo un error al eliminar la encuesta');
        }
    };

    const handleToggleStatus = async (survey) => {
        try {
            const newStatus = !survey.is_active;
            const { error } = await supabase
                .from('surveys')
                .update({ is_active: newStatus })
                .eq('id', survey.id);

            if (error) throw error;

            await fetchSurveys();
            toast.success(`Encuesta ${newStatus ? 'activada' : 'desactivada'}`);
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Error al cambiar el estado');
        }
    };


    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-10 animate-slide-up">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
                    <p className="text-slate-400">Visión general de tus encuestas y métricas de sentimiento.</p>
                </div>
                <Link to="/create" className="bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all flex items-center space-x-2 transform hover:scale-105">
                    <Plus className="w-5 h-5" />
                    <span>Nueva Encuesta</span>
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-panel bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors shadow-lg">
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recents */}
            <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-semibold mb-6">Mis Encuestas</h3>
                <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-black/20">
                            <tr className="border-b border-white/10">
                                <th className="p-4 font-medium text-slate-400">Título</th>
                                <th className="p-4 font-medium text-slate-400">Estado</th>
                                <th className="p-4 font-medium text-slate-400">Fecha Creada</th>
                                <th className="p-4 font-medium text-slate-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Cargando...</td></tr>
                            ) : surveys.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No hay encuestas creadas aún.</td></tr>
                            ) : (
                                surveys.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium group-hover:text-brand-400 transition-colors">{row.title}</td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleToggleStatus(row)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${row.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                                    title={row.is_active ? 'Desactivar Encuesta' : 'Activar Encuesta'}
                                                >
                                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out shadow-sm ${row.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                                <span className={`ml-3 text-xs font-medium ${row.is_active ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {row.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300">{new Date(row.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleCopyLink(row.id)} className="inline-flex items-center text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg transition-colors" title="Compartir Encuesta Publicamente">
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    <span>Copiar Enlace</span>
                                                </button>
                                                <Link to={`/results/${row.id}`} className="inline-flex items-center text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                                    <span>Resultados</span>
                                                </Link>
                                                <button onClick={() => navigate(`/edit/${row.id}`)} className="p-1.5 text-slate-400 hover:text-blue-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Editar Encuesta y Preguntas">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(row.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Eliminar Encuesta">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
