import { FiCode, FiHeart, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-[80vh] flex items-center bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="text-left w-full mb-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                        <FiArrowLeft /> Volver al Inicio
                    </Link>
                </div>

                <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-8">
                    <FiCode className="w-8 h-8" />
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                    Sobre el Proyecto
                </h1>

                <div className="prose prose-lg dark:prose-invert mx-auto text-gray-600 dark:text-gray-300 space-y-6">
                    <p>
                        Esta plataforma inicialmente se había diseñado para las entregas de la asignatura de Lenguaje de Marcas.
                    </p>
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl mt-10 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
                            El objetivo de la página.
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Era sacar buena nota solamente, pero al final ha sido y siempre va a ser aprender.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-6 rounded-3xl mt-8 border border-blue-100 dark:border-blue-900/30 text-center">
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                            Correo para contactar con nosotros: <a href="mailto:repositoriodeIT@gmail.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">repositoriodeIT@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
