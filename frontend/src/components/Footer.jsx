import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start space-x-6 md:order-2">
                        <Link to="/about" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            Sobre Nosotros
                        </Link>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                            &copy; {new Date().getFullYear()} ApuntesIT. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
