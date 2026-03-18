import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RootLayout() {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);
    const isAuthPage = location.pathname === '/login' || 
                       location.pathname === '/register' || 
                       location.pathname === '/forgot-password';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl font-black tracking-tighter animate-pulse">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_auto] animate-gradient">IT</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!user && !isAuthPage) {
        return <Navigate to="/login" replace />;
    }

    if (user && isAuthPage) {
        return <Navigate to="/" replace />;
    }

    if (isAuthPage) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center">
                <Outlet />
            </main>
        );
    }

    // Page transition state
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(false);
        const t = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(t);
    }, [location.pathname]);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <main className="flex-1 w-full bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div className={`transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
