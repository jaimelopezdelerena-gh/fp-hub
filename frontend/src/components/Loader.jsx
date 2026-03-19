export default function Loader({ message = 'Cargando contenido...' }) {
    return (
        <div className="flex-1 min-h-[80vh] flex items-center justify-center p-8 bg-gray-200 dark:bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 animate-pulse drop-shadow-lg">
                    IT
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                    {message}
                </span>
            </div>
        </div>
    );
}

