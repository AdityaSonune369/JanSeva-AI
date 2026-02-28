import { BrowserRouter, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useVoice } from './hooks/useVoice';
import VoiceShell from './components/VoiceShell';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Schemes from './pages/Schemes';
import Advisory from './pages/Advisory';
import Community from './pages/Community';
import Issues from './pages/Issues';
import { useEffect } from 'react';

import { getAIResponse } from './services/ai';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { speak, transcript, setTranscript } = useVoice();

  useEffect(() => {
    if (!transcript) return;

    const lower = transcript.toLowerCase();
    console.log("App processing global:", lower);

    const handleNavigation = (path: string) => {
      navigate(path);
      setTranscript(''); // Consume the command
    };

    // Navigation Logic - Return after navigating to prevent AI chat from other components processing it
    if (lower.includes('job') || lower.includes('naukri') || lower.includes('rozgar') || lower.includes('जॉब') || lower.includes('नौकरी') || lower.includes('रोजगार')) { handleNavigation('/jobs'); return; }

    if (lower.includes('scheme') || lower.includes('yojna') || lower.includes('योजना') || lower.includes('स्कीम')) { handleNavigation('/schemes'); return; }

    if (lower.includes('advisory') || lower.includes('salah') || lower.includes('paramarsh') || lower.includes('सलाह') || lower.includes('परामर्श')) { handleNavigation('/advisory'); return; }

    if (lower.includes('community') || lower.includes('samuday') || lower.includes('समुदाय') || lower.includes('कम्युनिटी')) { handleNavigation('/community'); return; }

    if (lower.includes('issue') || lower.includes('shikayat') || lower.includes('samasya') || lower.includes('doctor') || lower.includes('समस्या') || lower.includes('शिकायत') || lower.includes('डॉक्टर')) { handleNavigation('/issues'); return; }

    if (lower.includes('home') || lower.includes('ghar') || lower.includes('घर')) { handleNavigation('/'); return; }

    // NOTE: We do NOT handle AI response here anymore to allow pages to handle specific commands.
    // Ideally, if no page handles it for X seconds, we might trigger AI?
    // For now, let's keep it simple: pages handle their stuff. If it matches nothing, nothing happens.
    // Or we can add a specific "Ask AI" keyword command in the future.

  }, [transcript, navigate, setTranscript]);

  return (
    <VoiceShell onCommand={() => { }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/community" element={<Community />} />
          <Route path="/issues" element={<Issues />} />
        </Routes>
      </AnimatePresence>
    </VoiceShell>
  );
}

import { VoiceProvider } from './context/VoiceContext';

export default function App() {
  return (
    <VoiceProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </VoiceProvider>
  );
}
