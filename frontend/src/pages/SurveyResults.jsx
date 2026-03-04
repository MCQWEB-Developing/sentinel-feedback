import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Users, BrainCircuit, MessageSquare, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SurveyResults() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [stats, setStats] = useState({ totalResponses: 0, npsScore: 0, sentiments: { Positive: 0, Neutral: 0, Negative: 0, Mixed: 0 } });
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedResponse, setExpandedResponse] = useState(null);

    useEffect(() => {
        fetchResults();
    }, [id]);

    const fetchResults = async () => {
        try {
            // Fetch survey details
            const { data: surveyData, error: surveyError } = await supabase
                .from('surveys')
                .select('*')
                .eq('id', id)
                .single();

            if (surveyError) throw surveyError;
            setSurvey(surveyData);

            // Fetch all questions for context mapping
            const { data: qData, error: qError } = await supabase
                .from('questions')
                .select('id, question_text, question_type')
                .eq('survey_id', id);

            if (qError) throw qError;
            const questionMap = qData.reduce((acc, curr) => {
                acc[curr.id] = curr;
                return acc;
            }, {});

            // Fetch responses, answers, and ai_analysis
            const { data: resData, error: resError } = await supabase
                .from('responses')
                .select(`
                    id, 
                    submitted_at, 
                    answers (
                        id, 
                        question_id, 
                        answer_value, 
                        ai_analysis (sentiment, keywords, confidence_score)
                    )
                `)
                .eq('survey_id', id)
                .order('submitted_at', { ascending: false });

            if (resError) throw resError;

            // Process data for dashboard stats
            let totalRes = resData.length;
            let totalNpsScore = 0;
            let npsCount = 0;
            let sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0, Mixed: 0 };

            const processedResponses = resData.map(res => {
                const formattedAnswers = res.answers.map(ans => {
                    const qInfo = questionMap[ans.question_id];
                    let aiData = null;

                    if (qInfo?.question_type === 'nps') {
                        const score = parseInt(ans.answer_value);
                        if (!isNaN(score)) {
                            totalNpsScore += score;
                            npsCount++;
                        }
                    }

                    if (ans.ai_analysis) {
                        aiData = Array.isArray(ans.ai_analysis) ? ans.ai_analysis[0] : ans.ai_analysis;
                        if (aiData && sentimentCounts[aiData.sentiment] !== undefined) {
                            sentimentCounts[aiData.sentiment]++;
                        }
                    }

                    return {
                        id: ans.id,
                        question: qInfo?.question_text || 'Pregunta eliminada',
                        type: qInfo?.question_type,
                        value: ans.answer_value,
                        ai: aiData
                    };
                });

                return {
                    id: res.id,
                    submitted_at: res.submitted_at,
                    answers: formattedAnswers
                };
            });

            setStats({
                totalResponses: totalRes,
                npsScore: npsCount > 0 ? (totalNpsScore / npsCount).toFixed(1) : 0,
                sentiments: sentimentCounts
            });

            setResponses(processedResponses);
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('No se pudieron cargar los resultados.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (responseId) => {
        setExpandedResponse(expandedResponse === responseId ? null : responseId);
    };

    if (loading) {
        return <div className="text-slate-400 p-8 text-center animate-pulse">Cargando métricas de IA...</div>;
    }

    if (!survey) {
        return <div className="text-slate-400 p-8 text-center">Encuesta no encontrada.</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg self-start">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{survey.title}</h2>
                    <p className="text-brand-400 font-medium mt-1">Reporte de Resultados y Análisis IA</p>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/20 rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Respuestas</p>
                            <p className="text-3xl font-bold text-white">{stats.totalResponses}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><TrendingUp className="w-6 h-6" /></div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Promedio NPS</p>
                            <p className="text-3xl font-bold text-white">{stats.npsScore} <span className="text-sm text-slate-500">/ 10</span></p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg lg:col-span-2 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <BrainCircuit className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-lg font-semibold">Sentimiento Procesado por Gemini</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-black/20 rounded-xl p-3 border border-emerald-500/20">
                                <p className="text-3xl font-bold text-emerald-400">{stats.sentiments.Positive}</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Positivo</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-blue-500/20">
                                <p className="text-3xl font-bold text-blue-400">{stats.sentiments.Neutral}</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Neutral</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-red-500/20">
                                <p className="text-3xl font-bold text-red-400">{stats.sentiments.Negative}</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Negativo</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 border border-amber-500/20">
                                <p className="text-3xl font-bold text-amber-400">{stats.sentiments.Mixed}</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Mixto</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responses List */}
            <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-brand-400" />
                        <span>Feed de Respuestas</span>
                    </h3>
                </div>

                {responses.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-black/20 rounded-xl border border-dashed border-white/10">
                        Aún no hay respuestas para esta encuesta.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {responses.map((res, index) => (
                            <div key={res.id} className="bg-black/20 border border-white/5 hover:border-white/10 transition-colors rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleExpand(res.id)}
                                    className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                                            #{stats.totalResponses - index}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Enviado el {new Date(res.submitted_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-slate-500">
                                        {expandedResponse === res.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </button>

                                {expandedResponse === res.id && (
                                    <div className="p-6 pt-2 border-t border-white/5 bg-black/40 space-y-6 animate-fade-in">
                                        {res.answers.map(ans => (
                                            <div key={ans.id} className="space-y-2">
                                                <p className="text-sm font-medium text-slate-300">{ans.question}</p>

                                                {ans.type === 'nps' ? (
                                                    <div className="inline-block px-3 py-1 bg-brand-500/20 text-brand-400 font-bold rounded-lg border border-brand-500/30">
                                                        Puntuación: {ans.value} / 10
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-slate-200">
                                                        {ans.value}
                                                    </div>
                                                )}

                                                {/* AI Insights Card */}
                                                {ans.ai && (
                                                    <div className="mt-3 flex flex-wrap items-center gap-3 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/20">
                                                        <BrainCircuit className="w-4 h-4 text-emerald-400 shrink-0" />
                                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-sm 
                                                            ${ans.ai.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                ans.ai.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                                                                    ans.ai.sentiment === 'Neutral' ? 'bg-blue-500/20 text-blue-400' :
                                                                        'bg-amber-500/20 text-amber-400'}
                                                        `}>
                                                            {ans.ai.sentiment}
                                                        </span>
                                                        <span className="text-xs text-emerald-400/70 border-l border-emerald-500/30 pl-3">
                                                            Confianza: {(ans.ai.confidence_score * 100).toFixed(0)}%
                                                        </span>
                                                        {ans.ai.keywords && ans.ai.keywords.length > 0 && (
                                                            <div className="flex gap-2 flex-wrap ml-auto">
                                                                {ans.ai.keywords.map((kw, i) => (
                                                                    <span key={i} className="text-[10px] bg-black/40 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/20">
                                                                        #{kw}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
