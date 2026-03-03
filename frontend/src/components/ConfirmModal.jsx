import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl border border-gray-100 dark:border-gray-800">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <FiX className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg ${isDestructive ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}>
                        <FiAlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>

                    <div className="flex gap-4 w-full">
                        <button onClick={onCancel} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">
                            {cancelText}
                        </button>
                        <button onClick={onConfirm} className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-colors ${isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
