import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Sparkles, GripVertical, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const QuestionTypeSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        { value: 'text', label: 'Texto Libre (Análisis IA)' },
        { value: 'multiple_choice', label: 'Opción Múltiple' },
        { value: 'nps', label: 'Escala NPS' }
    ];
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative min-w-[240px]">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer flex justify-between items-center hover:bg-white/5 transition-all"
            >
                <span className="truncate">{selectedOption?.label}</span>
                <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-full glass-panel bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl animate-fade-in origin-top">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`px-4 py-3 cursor-pointer hover:bg-brand-500/20 transition-colors text-sm ${value === opt.value ? 'bg-brand-500/10 text-brand-400 font-medium' : 'text-slate-200'}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function CreateSurvey() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([
        { id: '1', text: '', type: 'text', options: ['Opción 1', 'Opción 2'] }
    ]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
        });
    }, []);

    // Load existing survey data if in "Edit" mode
    useEffect(() => {
        if (id) {
            setLoading(true);
            const fetchSurveyData = async () => {
                try {
                    const { data: survey, error: sErr } = await supabase.from('surveys').select('*').eq('id', id).single();
                    if (sErr) throw sErr;
                    setTitle(survey.title);
                    setDescription(survey.description || '');

                    const { data: qs, error: qErr } = await supabase.from('questions').select('*').eq('survey_id', id).order('question_order', { ascending: true });
                    if (qErr) throw qErr;

                    if (qs && qs.length > 0) {
                        setQuestions(qs.map(q => ({
                            id: q.id,
                            text: q.question_text,
                            type: q.question_type,
                            options: q.options || ['Opción 1', 'Opción 2'],
                            isExisting: true
                        })));
                    }
                } catch (err) {
                    toast.error('Error cargando la encuesta');
                    console.error(err);
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            };
            fetchSurveyData();
        }
    }, [id, navigate]);

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now().toString(), text: '', type: 'text', options: ['Opción 1', 'Opción 2'] }]);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const removeQuestion = (id) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !userId) {
            toast.error('Suministra un título y verifica tu sesión activa.');
            return;
        }

        // Validar preguntas vacías
        if (questions.some(q => !q.text.trim())) {
            toast.error('Todas las preguntas deben tener texto.');
            return;
        }

        setLoading(true);

        try {
            if (id) {
                // Modo Edición
                const { error: surveyError } = await supabase
                    .from('surveys')
                    .update({ title, description })
                    .eq('id', id);

                if (surveyError) throw surveyError;

                // Sync Preguntas
                const { data: currentQs } = await supabase.from('questions').select('id').eq('survey_id', id);
                const currentQIds = (currentQs || []).map(q => q.id);
                const questionsToKeep = questions.filter(q => q.isExisting).map(q => q.id);
                const questionsToDelete = currentQIds.filter(qId => !questionsToKeep.includes(qId));

                if (questionsToDelete.length > 0) {
                    await supabase.from('questions').delete().in('id', questionsToDelete);
                }

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    if (q.isExisting) {
                        await supabase.from('questions').update({
                            question_text: q.text,
                            question_type: q.type,
                            question_order: i + 1,
                            options: q.type === 'multiple_choice' ? q.options : null
                        }).eq('id', q.id);
                    } else {
                        await supabase.from('questions').insert([{
                            survey_id: id,
                            question_text: q.text,
                            question_type: q.type,
                            question_order: i + 1,
                            options: q.type === 'multiple_choice' ? q.options : null
                        }]);
                    }
                }

                toast.success(`¡Encuesta actualizada con éxito!`);
            } else {
                // Modo Creación
                const { data: surveyData, error: surveyError } = await supabase
                    .from('surveys')
                    .insert([{ user_id: userId, title, description }])
                    .select()
                    .single();

                if (surveyError) throw surveyError;

                const surveyId = surveyData.id;

                const questionsToInsert = questions.map((q, index) => ({
                    survey_id: surveyId,
                    question_text: q.text,
                    question_type: q.type,
                    question_order: index + 1,
                    options: q.type === 'multiple_choice' ? q.options : null
                }));

                const { error: questionsError } = await supabase
                    .from('questions')
                    .insert(questionsToInsert);

                if (questionsError) throw questionsError;

                toast.success(`¡Encuesta creada con éxito!`);
            }
            navigate('/');

        } catch (error) {
            console.error("Supabase Save Error:", error);
            const errorMsg = error.message || error.details || 'Error desconocido';
            toast.error(`Error al guardar: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-slide-up">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">{id ? 'Editar Encuesta' : 'Crear Encuesta'}</h2>
                    <p className="text-slate-400">Diseña las preguntas y recaba el feedback de tus usuarios.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>
                    <button disabled={loading} onClick={handleSave} className="bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all flex items-center space-x-2 transform hover:scale-105 disabled:opacity-50">
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Guardando...' : (id ? 'Actualizar Encuesta' : 'Guardar Nueva Encuesta')}</span>
                    </button>
                </div>
            </header>

            {/* Survey Details Form */}
            <section className="glass-panel p-8 rounded-2xl bg-white/5 border border-white/10 mb-8 space-y-6 shadow-xl">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Título de la Encuesta</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        placeholder="Ej: Feedback del nuevo onboarding"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descripción (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows="3"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        placeholder="Introduce breves instrucciones para tus encuestados..."
                    />
                </div>
            </section>

            {/* Questions Section */}
            <section className="space-y-4 relative">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <span>Preguntas</span>
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> IA Activa para texto
                    </span>
                </h3>

                {questions.map((q, index) => (
                    <div key={q.id} style={{ zIndex: questions.length - index }} className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-4 relative group transition-all hover:border-brand-500/50 shadow-lg">
                        <div className="pt-3 cursor-grab text-slate-500">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                    placeholder={`Pregunta ${index + 1}`}
                                />
                                <QuestionTypeSelect
                                    value={q.type}
                                    onChange={(val) => updateQuestion(q.id, 'type', val)}
                                />
                            </div>

                            {q.type === 'text' && (
                                <p className="text-xs text-brand-400 flex items-center space-x-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Las respuestas a esta pregunta serán analizadas automáticamente por Gemini.</span>
                                </p>
                            )}

                            {q.type === 'multiple_choice' && (
                                <div className="pl-4 border-l-2 border-slate-700/50 space-y-3 mt-4">
                                    <p className="text-sm text-slate-400">Define las opciones para que los usuarios elijan:</p>
                                    {(q.options || []).map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0"></div>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOptions = [...q.options];
                                                    newOptions[oIndex] = e.target.value;
                                                    updateQuestion(q.id, 'options', newOptions);
                                                }}
                                                className="bg-transparent border-b border-slate-700 text-sm text-slate-200 px-2 py-1 w-full focus:outline-none focus:border-brand-500"
                                                placeholder={`Opción ${oIndex + 1}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newOptions = q.options.filter((_, i) => i !== oIndex);
                                                    updateQuestion(q.id, 'options', newOptions);
                                                }}
                                                disabled={q.options.length <= 2}
                                                className="text-slate-500 hover:text-red-400 p-1 disabled:opacity-30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newOptions = [...(q.options || []), `Opción ${(q.options?.length || 0) + 1}`];
                                            updateQuestion(q.id, 'options', newOptions);
                                        }}
                                        className="text-brand-400 text-sm hover:text-brand-300 flex items-center mt-2 px-2"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Añadir opción
                                    </button>
                                </div>
                            )}

                            {q.type === 'nps' && (
                                <div className="pl-4 border-l-2 border-slate-700/50 mt-4">
                                    <p className="text-sm text-slate-400 mb-2">Previsualización de la escala analógica (1-10):</p>
                                    <div className="flex items-center gap-1 opacity-50">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <div key={num} className="w-8 h-8 rounded bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-300">
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => removeQuestion(q.id)}
                            disabled={questions.length === 1}
                            className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:invisible mt-2"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full mt-6 py-4 glass-panel bg-white/5 border border-dashed border-white/20 rounded-2xl text-slate-400 hover:text-white hover:border-brand-500 hover:bg-brand-500/5 transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Añadir otra pregunta</span>
                </button>
            </section>

        </div >
    );
}
