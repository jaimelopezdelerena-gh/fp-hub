import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RootLayout() {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500">Cargando...</div>;
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

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <main className="flex-1 w-full bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}
