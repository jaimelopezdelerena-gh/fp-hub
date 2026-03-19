import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RootLayout() {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);
    const isAuthPage = location.pathname === '/login' || 
                       location.pathname === '/register' || 
                       location.pathname === '/forgot-password';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 animate-pulse drop-shadow-lg">
                        IT
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                        Cargando entorno...
                    </span>
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
            <main className="min-h-screen bg-gray-200 dark:bg-gray-950 flex flex-col justify-center">
                <Outlet />
            </main>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-200 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <main className="flex-1 w-full bg-gray-200 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div key={location.pathname} className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

