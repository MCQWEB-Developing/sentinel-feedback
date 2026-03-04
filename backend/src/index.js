import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const payload = req.body;
    let answerId, textToAnalyze;

    // Detectar si es un Webhook de Supabase o una llamada directa
    if (payload.record && payload.table === 'answers') {
      // Formato Supabase Webhook
      answerId = payload.record.id;
      textToAnalyze = payload.record.answer_value;
    } else {
      // Formato directo anterior (compatibilidad)
      answerId = payload.answerId;
      textToAnalyze = payload.textToAnalyze;
    }

    if (!textToAnalyze || !answerId) {
      return res.status(400).json({ error: 'Missing answerId or textToAnalyze' });
    }

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analiza el sentimiento del siguiente texto y clasifícalo en "Positive", "Negative", "Neutral" o "Mixed". Además, extrae hasta 5 palabras clave. Retorna un JSON válido con la estructura: {"sentiment": "str", "confidence_score": 0.0 a 1.0, "keywords": ["word1", "word2"]}. Texto: "${textToAnalyze}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean markdown formatting if present
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    // Save to Supabase using Service Role (bypassing RLS)
    const { data: analysisResult, error } = await supabase
      .from('ai_analysis')
      .insert({
        answer_id: answerId,
        sentiment: parsedData.sentiment,
        confidence_score: parsedData.confidence_score || 0.8,
        keywords: parsedData.keywords || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase DB Error:', error);
      return res.status(500).json({ error: 'Failed to save analysis to DB' });
    }

    res.status(200).json({ success: true, analysis: analysisResult });
  } catch (error) {
    console.error('Error in AI Analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`SentinelFeedback Backend listening on port ${PORT}`);
  });
}
