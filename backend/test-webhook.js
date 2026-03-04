import fetch from 'node-fetch';

async function testWebhook() {
    const url = 'http://localhost:3001/api/analyze-sentiment';

    // Mock de payload enviado por Supabase Webhooks
    const mockSupabasePayload = {
        type: 'INSERT',
        table: 'answers',
        record: {
            id: 'd9b2e1e0-x0x0-4x0x-y0y0-z0z0z0z0z0z0',
            answer_value: 'Este nuevo sistema de webhooks es increíblemente rápido y eficiente.',
            response_id: '...',
            question_id: '...'
        },
        old_record: null
    };

    console.log("Simulando Webhook de Supabase...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockSupabasePayload)
        });

        const data = await response.json();
        console.log("Respuesta del Backend:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error en la simulación:", error.message);
        console.log("Nota: Asegúrate de que el backend esté corriendo en el puerto 3001.");
    }
}

testWebhook();
