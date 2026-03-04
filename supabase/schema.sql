-- Initial Schema for SentinelFeedback MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: surveys
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: questions
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'nps')),
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: responses
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    respondent_id TEXT -- Optional analytic tracking
);

-- Table: answers
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: ai_analysis
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE UNIQUE,
    sentiment TEXT CHECK (sentiment IN ('Positive', 'Negative', 'Neutral', 'Mixed')),
    confidence_score FLOAT,
    keywords JSONB,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Creators can do CRUD on their own surveys
CREATE POLICY "Users can manage their own surveys" ON surveys
    FOR ALL USING (auth.uid() = user_id);

-- Anyone can view active surveys (public access for taking the survey)
CREATE POLICY "Anyone can view active surveys" ON surveys
    FOR SELECT USING (is_active = true);

-- Creators can manage questions of their own surveys
CREATE POLICY "Users can manage questions of their own surveys" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM surveys WHERE surveys.id = questions.survey_id AND surveys.user_id = auth.uid()
        )
    );

-- Anyone can view questions of active surveys
CREATE POLICY "Anyone can view questions of active surveys" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM surveys WHERE surveys.id = questions.survey_id AND surveys.is_active = true
        )
    );

-- Responses: Anyone can insert (public surveys), but only survey creator can read
CREATE POLICY "Public can insert responses" ON responses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Creators can read responses" ON responses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM surveys WHERE surveys.id = responses.survey_id AND surveys.user_id = auth.uid()
    )
);

-- Answers: Anyone can insert, creators can read
CREATE POLICY "Public can insert answers" ON answers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Creators can read answers" ON answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM responses 
        JOIN surveys ON responses.survey_id = surveys.id 
        WHERE responses.id = answers.response_id AND surveys.user_id = auth.uid()
    )
);

-- AI Analysis is managed by the backend (Service Role key bypasses RLS)
-- Creators can read AI analysis for their surveys
CREATE POLICY "Creators can read AI analysis" ON ai_analysis FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM answers 
        JOIN responses ON answers.response_id = responses.id
        JOIN surveys ON responses.survey_id = surveys.id
        WHERE answers.id = ai_analysis.answer_id AND surveys.user_id = auth.uid()
    )
);
