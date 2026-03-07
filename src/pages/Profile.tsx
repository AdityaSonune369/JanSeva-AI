import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { LogOut, User as UserIcon, Settings, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { currentUser, logout, isGuest } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    if (!currentUser && !isGuest) return null;

    return (
        <PageTransition>
            <div className="p-4 space-y-8 pt-12 pb-32">
                <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                    <div className="bg-slate-500/20 p-4 rounded-full border border-slate-500/30 shadow-[0_0_30px_rgba(100,116,139,0.3)] mb-2 relative">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/20" />
                        ) : (
                            <UserIcon className="text-slate-400 drop-shadow-lg" size={40} />
                        )}
                    </div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">
                        {currentUser?.displayName || (isGuest ? 'Guest User' : 'Farmer Profile')}
                    </h2>
                    <p className="text-slate-400 font-medium tracking-wide">{currentUser?.email || (isGuest ? 'Not logged in' : '')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-4 text-center border-t border-white/10 glass-card">
                        <Award className="text-emerald-400 w-8 h-8 mx-auto mb-2" />
                        <h4 className="text-2xl font-black text-white">Level 3</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">Contributor</p>
                    </GlassCard>
                    <GlassCard className="p-4 text-center border-t border-white/10 glass-card">
                        <Calendar className="text-blue-400 w-8 h-8 mx-auto mb-2" />
                        <h4 className="text-2xl font-black text-white">{isGuest ? 'Guest' : 'Member'}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">Since 2026</p>
                    </GlassCard>
                </div>

                <GlassCard className="p-2 space-y-2 glass-card border-none">
                    <button className="w-full flex items-center justify-between p-4 bg-slate-800/20 hover:bg-slate-800/40 rounded-2xl transition-colors border border-transparent hover:border-white/5 group">
                        <div className="flex gap-4 items-center">
                            <Settings className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
                            <span className="text-white font-bold text-lg">Account Settings</span>
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-colors border border-transparent hover:border-red-500/20 group"
                    >
                        <div className="flex gap-4 items-center">
                            <LogOut className="text-red-400" size={24} />
                            <span className="text-red-400 font-bold text-lg">Sign Out</span>
                        </div>
                    </button>
                </GlassCard>
            </div>
        </PageTransition>
    );
}
