import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useVoice } from './hooks/useVoice';
import VoiceShell from './components/VoiceShell';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Schemes from './pages/Schemes';
import Advisory from './pages/Advisory';
import Community from './pages/Community';
import Issues from './pages/Issues';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import { useEffect } from 'react';

import { askJanSevaAI } from './services/ai';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transcript, setTranscript, speak } = useVoice();

  // Don't render VoiceShell or global layout on auth page
  const isAuthPage = location.pathname === '/auth';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    if (!transcript || isAuthPage) return;

    const lower = transcript.toLowerCase();
    // App processing global

    const words = transcript.trim().split(/\s+/);
    const isShortCommand = words.length <= 3;
    let targetPath = null;
    let confirmText = "";

    if (lower.includes('job') || lower.includes('naukri') || lower.includes('rozgar') || lower.includes('जॉब') || lower.includes('नौकरी') || lower.includes('रोजगार')) {
      targetPath = '/jobs'; confirmText = "Opening Rozgar";
    } else if (lower.includes('scheme') || lower.includes('yojna') || lower.includes('योजना') || lower.includes('स्कीम')) {
      targetPath = '/schemes'; confirmText = "Opening Yojna";
    } else if (lower.includes('advisory') || lower.includes('salah') || lower.includes('paramarsh') || lower.includes('सलाह') || lower.includes('परामर्श')) {
      targetPath = '/advisory'; confirmText = "Opening Advisory";
    } else if (lower.includes('community') || lower.includes('samuday') || lower.includes('समुदाय') || lower.includes('कम्युनिटी')) {
      targetPath = '/community'; confirmText = "Opening Community";
    } else if (lower.includes('issue') || lower.includes('shikayat') || lower.includes('samasya') || lower.includes('doctor') || lower.includes('समस्या') || lower.includes('शिकायत') || lower.includes('डॉक्टर')) {
      targetPath = '/issues'; confirmText = "Opening Crop Doctor";
    } else if (lower.includes('chat') || lower.includes('saarthi') || lower.includes('bot') || lower.includes('charcha') || lower.includes('मदद')) {
      targetPath = '/chatbot'; confirmText = "Opening Saarthi Chatbot";
    } else if (lower.includes('home') || lower.includes('ghar') || lower.includes('घर')) {
      targetPath = '/'; confirmText = "Going Home";
    }

    if (targetPath) {
      navigate(targetPath);
      if (isShortCommand) {
        speak(confirmText);
        setTranscript('');
        return;
      }
    }

    const handleAIQuery = async () => {
      try {
        // Sending to JanSeva AI
        const currentContext = location.pathname.substring(1) || 'home';
        const aiResponse = await askJanSevaAI(transcript, currentContext);
        speak(aiResponse);
        setTranscript('');
      } catch (error) {
        console.error("AI Query failed:", error);
      }
    };

    handleAIQuery();

  }, [transcript, navigate, setTranscript, location.pathname, isAuthPage, speak]);

  if (isAuthPage) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute bottom-0 w-[400vw] h-[250px] animate-wave"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(37, 99, 235, 0.12)' d='M0,160L48,154.7C96,149,192,139,288,149.3C384,160,480,192,576,192C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '25% 100%'
          }}
        />
        <div
          className="absolute bottom-0 w-[400vw] h-[300px] animate-wave-reverse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(0, 0, 128, 0.15)' d='M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,170.7C672,160,768,160,864,176C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '25% 100%'
          }}
        />
        <div
          className="absolute bottom-0 w-[400vw] h-[350px] animate-wave opacity-70"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(19, 136, 8, 0.08)' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '25% 100%'
          }}
        />
      </div>

      <VoiceShell onCommand={() => { }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
            <Route path="/advisory" element={<ProtectedRoute><Advisory /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </VoiceShell>
    </>
  );
}

import { VoiceProvider } from './context/VoiceContext';

export default function App() {
  return (
    <VoiceProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </VoiceProvider>
  );
}
