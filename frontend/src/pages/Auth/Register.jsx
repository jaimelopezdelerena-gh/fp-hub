import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (name.includes(' ')) {
            return setError('El nombre de usuario no puede contener espacios');
        }
        if (name.length > 15) {
            return setError('El nombre de usuario no puede tener más de 15 caracteres');
        }
        if (!securityQuestion || !securityAnswer.trim()) {
            return setError('Debes elegir una pregunta de seguridad y escribir tu respuesta');
        }
        try {
            await register(name, email, password, securityQuestion, securityAnswer);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 transition-all">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
                {error && <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-center text-sm font-medium">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Nombre Completo</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                                    maxLength={15}
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="NombreDeUsuario"
                                />
                            </div>
                        </div>
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
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="Correo electrónico (@educa.madrid.org)"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
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
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="Contraseña"
                                />
                            </div>
                        </div>
                        {/* Security Question Section */}
                        <div className="pt-2">
                            <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pregunta de seguridad
                            </label>
                            <select
                                id="securityQuestion"
                                value={securityQuestion}
                                onChange={(e) => setSecurityQuestion(e.target.value)}
                                required
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            >
                                <option value="" disabled>Selecciona una pregunta...</option>
                                <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                                <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                                <option value="¿Cuál era el apellido de tu profesor favorito?">¿Cuál era el apellido de tu profesor favorito?</option>
                                <option value="¿Cuál es tu equipo de deportes favorito?">¿Cuál es tu equipo de deportes favorito?</option>
                                <option value="¿Cuál es el segundo apellido de tu madre?">¿Cuál es el segundo apellido de tu madre?</option>
                            </select>
                        </div>
                        <div>
                            <input
                                id="securityAnswer"
                                type="text"
                                required
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                placeholder="Tu respuesta secreta"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                        >
                            Comenzar
                            <span className="absolute right-0 inset-y-0 flex items-center pr-3">
                                <FiArrowRight className="h-5 w-5 text-blue-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all" />
                            </span>
                        </button>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        Al registrarte aceptas nuestros Términos de Servicio y Condiciones.
                    </p>
                </form>
            </div>
        </div>
    );
}
