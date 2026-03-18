import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }
        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage('Contraseña restablecida con éxito. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.msg || 'El enlace de recuperación es inválido o ha caducado');
            }
        } catch (err) {
            setError('Error de conectividad con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-all">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
                        Nueva Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Introduce tu nueva contraseña segura para recuperar el acceso a tu cuenta.
                    </p>
                </div>

                {message && (
                    <div className="p-4 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl flex items-start gap-3">
                        <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="sr-only">Nueva Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Nueva contraseña"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Repetir nueva contraseña"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!message}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                            Cancelar y volver al Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
