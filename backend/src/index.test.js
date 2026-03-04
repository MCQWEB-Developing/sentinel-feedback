import request from 'supertest';
import app from './index.js';

describe('SentinelFeedback API', () => {
    test('POST /api/analyze-sentiment should return 400 if text is missing', async () => {
        const response = await request(app)
            .post('/api/analyze-sentiment')
            .send({ answerId: 'test-id' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing answerId or textToAnalyze');
    });

    test('POST /api/analyze-sentiment should return 400 if answerId is missing', async () => {
        const response = await request(app)
            .post('/api/analyze-sentiment')
            .send({ textToAnalyze: 'Hello' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Missing answerId or textToAnalyze');
    });
});
