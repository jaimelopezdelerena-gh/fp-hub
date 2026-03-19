import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiLock, FiShield } from 'react-icons/fi';

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Step 1: email, Step 2: answer question, Step 3: new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Fetch the security question for the email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
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
                setSecurityQuestion(data.securityQuestion);
                setStep(2);
            } else {
                setError(data.msg || 'No se pudo procesar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify answer & set new password
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }
        if (newPassword.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, answer, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.msg);
                setStep(3);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.msg || 'Respuesta incorrecta');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-all">

                {/* Header */}
                <div>
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-4">
                        <FiArrowLeft className="mr-2" /> Volver al Login
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {step === 1 && 'Introduce tu correo electrónico para buscar tu pregunta de seguridad.'}
                        {step === 2 && 'Responde tu pregunta de seguridad para verificar tu identidad.'}
                        {step === 3 && '¡Contraseña actualizada! Redirigiendo al Login...'}
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                </div>

                {/* Alerts */}
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

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                placeholder="Tu correo electrónico"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Buscando...' : 'Continuar'}
                        </button>
                    </form>
                )}

                {/* Step 2: Answer Question + New Password */}
                {step === 2 && (
                    <form className="space-y-5" onSubmit={handleResetSubmit}>
                        {/* Display the question */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-1">
                                <FiShield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Pregunta de Seguridad</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{securityQuestion}</p>
                        </div>

                        <input
                            type="text"
                            required
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            placeholder="Tu respuesta"
                        />

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                placeholder="Nueva contraseña"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                placeholder="Repetir nueva contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verificando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

