import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function TakeSurvey() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchSurveyData();
    }, [surveyId]);

    const fetchSurveyData = async () => {
        try {
            // Fetch Survey Options
            const { data: surveyData, error: surveyError } = await supabase
                .from('surveys')
                .select('*')
                .eq('id', surveyId)
                .eq('is_active', true)
                .single();

            if (surveyError) throw surveyError;
            setSurvey(surveyData);

            // Fetch Questions
            const { data: qData, error: qError } = await supabase
                .from('questions')
                .select('*')
                .eq('survey_id', surveyId)
                .order('question_order');

            if (qError) throw qError;
            setQuestions(qData);
        } catch (error) {
            console.error(error);
            setSurvey(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Crear Response entry 
            // Usamos UUID del lado del cliente para evitar el .select() que choca con RLS públicas.
            const responseId = (window.crypto && window.crypto.randomUUID)
                ? window.crypto.randomUUID()
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });

            const { error: responseError } = await supabase
                .from('responses')
                .insert([{ id: responseId, survey_id: surveyId }]);

            if (responseError) throw responseError;

            let hasTextAnswer = false;

            // 2. Insert Answers
            const answersToInsert = questions.map(q => {
                const val = answers[q.id] || '';
                if (q.question_type === 'text' && val.trim() !== '') hasTextAnswer = true;

                const ansId = (window.crypto && window.crypto.randomUUID)
                    ? window.crypto.randomUUID()
                    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });

                return {
                    id: ansId,
                    response_id: responseId,
                    question_id: q.id,
                    answer_value: val.toString()
                };
            });

            const { error: answersError } = await supabase
                .from('answers')
                .insert(answersToInsert);

            if (answersError) throw answersError;

            setSubmitted(true);
        } catch (error) {
            console.error("Submit Error:", error);
            const errorMsg = error.message || error.details || 'Error desconocido';
            toast.error(`Error enviando: ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carngando encuesta...</div>;

    if (!survey) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Encuesta no encontrada o inactiva.</div>;

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="glass-panel max-w-lg w-full p-8 rounded-3xl bg-black/40 border-emerald-500/30 text-center animate-fade-in shadow-2xl">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-brand-400 mb-4">¡Gracias por tu participación!</h2>
                    <p className="text-slate-300">Tus respuestas han sido enviadas exitosamente y nos ayudarán a mejorar.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 bg-linear-to-br from-slate-900 via-brand-900 to-slate-900 p-4 pt-20">
            <div className="max-w-3xl mx-auto">
                <div className="glass-panel p-8 md:p-12 rounded-3xl bg-black/40 border-white/10 shadow-2xl animate-fade-in">
                    <header className="mb-10 text-center border-b border-white/10 pb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{survey.title}</h1>
                        {survey.description && <p className="text-slate-400 text-lg">{survey.description}</p>}
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {questions.map((q, index) => (
                            <div key={q.id} className="space-y-4">
                                <label className="block text-xl font-medium text-slate-200">
                                    <span className="text-brand-500 mr-2">{index + 1}.</span> {q.question_text}
                                </label>

                                {q.question_type === 'text' && (
                                    <textarea
                                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                                        required
                                        rows="4"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder-slate-600"
                                        placeholder="Escribe tu respuesta aquí..."
                                    />
                                )}

                                {q.question_type === 'nps' && (
                                    <div className="flex justify-between items-center gap-2 bg-black/20 p-2 rounded-xl">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                onClick={() => handleAnswerChange(q.id, num.toString())}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${answers[q.id] === num.toString() ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === 'multiple_choice' && (
                                    <div className="space-y-3">
                                        {(q.options || []).map((opt, oIndex) => (
                                            <label key={oIndex} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${answers[q.id] === opt ? 'bg-brand-500/10 border-brand-500 text-white shadow-md' : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/5'}`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${answers[q.id] === opt ? 'border-brand-400 bg-brand-400/20' : 'border-slate-500'}`}>
                                                    {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-brand-400 rounded-full"></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`question_${q.id}`}
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="hidden"
                                                    required
                                                />
                                                <span className="text-sm">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={submitting || questions.length === 0}
                            className="w-full bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white py-4 rounded-xl font-semibold text-lg shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {submitting ? 'Enviando...' : 'Enviar Respuestas'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
