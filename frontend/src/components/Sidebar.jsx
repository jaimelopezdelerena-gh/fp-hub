import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiHome, FiUser, FiHeart, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { logout, user } = useContext(AuthContext);

    // Force Dark mode logic
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const navLinks = [
        { name: 'Inicio', path: '/', icon: <FiHome className="w-5 h-5" /> },
        { name: 'Perfil', path: '/profile', icon: <FiUser className="w-5 h-5" /> },
        { name: 'Likes', path: '/likes', icon: <FiHeart className="w-5 h-5" /> },
        { name: 'Admin', path: '/admin', icon: <FiSettings className="w-5 h-5" /> },
    ];

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    ApuntesIT 24/7
                </span>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400">
                        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-900 w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Header */}
                <div className="h-20 flex flex-col justify-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            ApuntesIT 24/7
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {navLinks.map((link) => {
                        if (link.name === 'Admin' && (!user || user.role !== 'admin')) return null;

                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section (Logout) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                    >
                        <FiLogOut className="w-5 h-5" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 dark:bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <ConfirmModal
                isOpen={showLogoutModal}
                title="¿Cerrar Sesión?"
                message="Tu sesión actual será cerrada y tendrás que volver a introducir tus credenciales."
                confirmText="Cerrar Sesión"
                cancelText="Cancelar"
                isDestructive={true}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </>
    );
}
