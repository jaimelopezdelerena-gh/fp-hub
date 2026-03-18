import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.msg);
            } else {
                setError(data.msg || 'Fallo al procesar la solicitud');
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
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-6">
                        <FiArrowLeft className="mr-2" /> Volver al Login
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Introduce tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
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
                    <div>
                        <label htmlFor="email" className="sr-only">Correo electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Correo institucional o personal"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                    </button>
                </form>
            </div>
        </div>
    );
}
