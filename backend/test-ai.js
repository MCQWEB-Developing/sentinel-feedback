import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Analiza el sentimiento del siguiente texto y clasifícalo en "Positive", "Negative", "Neutral" o "Mixed". Además, extrae hasta 5 palabras clave. Retorna un JSON válido con la estructura: {"sentiment": "str", "confidence_score": 0.0 a 1.0, "keywords": ["word1", "word2"]}. Texto: "muy malo"`;

        console.log("Calling Gemini...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Response text:", responseText);

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        console.log("JSON Match:", jsonMatch ? jsonMatch[0] : null);

        const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
        console.log("Parsed Data:", parsedData);
    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
