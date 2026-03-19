import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { FiThumbsUp, FiThumbsDown, FiEye, FiDownload, FiUser, FiCalendar, FiBook, FiArrowLeft, FiAlertTriangle, FiFlag, FiX, FiCheck } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function Post() {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Report Modal States
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetch post details which already increments view counter on backend
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setPost(data);
                } else {
                    setError('Post no encontrado.');
                }
            } catch (err) {
                setError('Error en el servidor al cargar la publicación.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleVote = async (type) => { // 'like' or 'dislike'
        if (!user) {
            alert('Por favor inicie sesión para votar.');
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${type}/${id}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                // Update component state correctly without refreshing entirely
                setPost({ ...post, likes: data.likes, dislikes: data.dislikes });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Por favor inicia sesión para reportar una publicación.');
            return;
        }

        if (!reportReason.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/report/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ reason: reportReason })
            });
            if (res.ok) {
                setReportSuccess(true);
                setReportReason('');
            }
        } catch (err) {
            console.error("Failed to report", err);
        }
    };

    if (loading) return <Loader message="Cargando detalles del apunte..." />;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    const hasLiked = post.likes?.includes(user?.id) || post.likes?.includes(user?._id);
    const hasDisliked = post.dislikes?.includes(user?.id) || post.dislikes?.includes(user?._id);

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <Link
                    to={`/category/${post.category?.toLowerCase()}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <FiArrowLeft /> Volver a {post.category || 'Categoría'}
                </Link>

                {/* Post Header */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 mb-8 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex gap-4 items-center">
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                {post.category || 'ASIR'}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <FiCalendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <FiEye className="w-4 h-4" /> {post.views} lecturas
                            </span>
                        </div>
                        <button onClick={() => setShowReportModal(true)} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm">
                            <FiFlag /> Reportar
                        </button>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 py-6 border-y border-gray-200 dark:border-gray-800">
                        <Link to={`/user/${post.author?._id}`} className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg relative overflow-hidden shrink-0 transition-transform hover:scale-105 group border-2 border-transparent hover:border-blue-400">
                            <div className={`absolute inset-0 w-full h-full ${post.author?.avatarColor || 'bg-blue-500'} -z-10`}></div>
                            {post.author?.avatarUrl ? (
                                <img src={`${import.meta.env.VITE_API_URL}${post.author.avatarUrl}`} className="w-full h-full object-cover z-10" alt="Avatar" />
                            ) : (
                                <span className="z-10 relative">{post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}</span>
                            )}
                        </Link>
                        <div>
                            <Link to={`/user/${post.author?._id}`} className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-500 transition-colors">
                                {post.author?.name || 'Usuario Mínimo'}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estudiante activo de la plataforma</p>
                        </div>
                    </div>

                    {/* Content Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiBook className="text-blue-500" />
                            Descripción del Material
                        </h2>

                        <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p className="whitespace-pre-wrap">{post.description}</p>
                        </div>
                    </div>

                    {/* Action Bar (Download & Voting) */}
                    <div className="flex flex-col gap-6 mt-8">
                        {/* Download Section */}
                        <div className="flex flex-wrap items-center justify-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            {post.files && post.files.length > 0 ? post.files.map((file, idx) => (
                                <a key={idx} href={`${import.meta.env.VITE_API_URL}${file.path}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/40 hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base">
                                    <FiDownload className="w-5 h-5 flex-shrink-0" />
                                    Descargar {file.originalName}
                                </a>
                            )) : (
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No hay archivos adjuntos</p>
                            )}
                        </div>

                        {/* Voting Section */}
                        <div className="flex justify-center sm:justify-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800">
                            <button
                                onClick={() => handleVote('like')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${hasLiked
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105 border-transparent'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-105 shadow-sm'
                                    }`}
                            >
                                <FiThumbsUp className={`w-5 h-5 transition-transform ${hasLiked ? 'fill-current scale-110' : ''}`} />
                                <span>{hasLiked ? 'Te gusta' : 'Me gusta'}</span>
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-sm font-extrabold ${hasLiked ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{post.likes?.length || 0}</span>
                            </button>

                            <button
                                onClick={() => handleVote('dislike')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${hasDisliked
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105 border-transparent'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:scale-105 shadow-sm'
                                    }`}
                            >
                                <FiThumbsDown className={`w-5 h-5 transition-transform ${hasDisliked ? 'fill-current scale-110' : ''}`} />
                                <span>{hasDisliked ? 'No te gusta' : 'No me gusta'}</span>
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-sm font-extrabold ${hasDisliked ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{post.dislikes?.length || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-200 dark:border-gray-800">
                        <button onClick={() => { setShowReportModal(false); setReportSuccess(false); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>

                        {reportSuccess ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full mb-6 mx-auto">
                                    <FiCheck className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-extrabold mb-4 dark:text-white">
                                    Reporte Enviado
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                                    Gracias por ayudarnos a mantener la comunidad limpia. Los administradores revisarán el apunte en breve.
                                </p>
                                <button onClick={() => { setShowReportModal(false); setReportSuccess(false); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30">
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full mb-6 mx-auto">
                                    <FiFlag className="w-8 h-8" />
                                </div>

                                <h2 className="text-2xl font-extrabold mb-4 dark:text-white text-center">
                                    Reportar Publicación
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                                    ¿Por qué quieres reportar el apunte proporcionado por "{post.author?.name}"? Selecciona o escribe el motivo para que un administrador lo revise.
                                </p>

                                <form onSubmit={handleReportSubmit}>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 mb-6"
                                        placeholder="Ej: Contenido inapropiado, spam, título engañoso..."
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                    />

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30">
                                            Enviar Reporte
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

