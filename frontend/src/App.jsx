import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Surveys from './pages/Surveys';
import CreateSurvey from './pages/CreateSurvey';
import TakeSurvey from './pages/TakeSurvey';
import SurveyResults from './pages/SurveyResults';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Surveys />} />
          <Route path="create" element={<CreateSurvey />} />
          <Route path="edit/:id" element={<CreateSurvey />} />
          <Route path="results/:id" element={<SurveyResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Public route for respondents */}
        <Route path="/s/:surveyId" element={<TakeSurvey />} />
      </Routes>
    </Router>
  );
}

export default App;
