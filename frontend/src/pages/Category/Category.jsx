import { Link, useParams } from 'react-router-dom';
import { FiDownload, FiThumbsUp, FiThumbsDown, FiEye, FiClock, FiFileText, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Category() {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadMenu, setShowUploadMenu] = useState(false);

    // Upload form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState([]);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/category/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setPosts(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [id]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!user) {
            setUploadError("Debes iniciar sesión para subir apuntes.");
            return;
        }

        if (files.length > 10) {
            setUploadError("El máximo de archivos por apunte es de 10.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', id?.toUpperCase());
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                // Post created successfully.
                setShowUploadMenu(false);
                setTitle('');
                setDescription('');
                setUploadError('');
                // Fetch posts again
                const reload = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/category/${id}`);
                const reloadedData = await reload.json();
                if (reload.ok) setPosts(reloadedData);
            } else {
                setUploadError(data.msg || "Error al subir tu apunte");
            }
        } catch (err) {
            setUploadError("Error de conectividad");
        }
    }

    const getGradient = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'asir': return 'from-blue-500 to-cyan-500';
            case 'daw': return 'from-purple-500 to-pink-500';
            case 'dam': return 'from-orange-500 to-red-500';
            case 'smr': return 'from-green-500 to-emerald-500';
            default: return 'from-gray-500 to-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors">
                    <FiArrowLeft /> Volver al Inicio
                </Link>

                {/* Category Header */}
                <div className={`rounded-3xl p-10 mb-10 bg-gradient-to-r ${getGradient(id)} text-white shadow-xl`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2 text-white">Apuntes de {id?.toUpperCase()}</h1>
                            <p className="text-white/80 text-lg">Encuentra y comparte el mejor material del ciclo</p>
                        </div>
                        <button onClick={() => setShowUploadMenu(true)} className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-white">
                            <FiUpload className="w-5 h-5 text-white" />
                            Subir Apuntes
                        </button>
                    </div>
                </div>

                {/* Action Bar (Mobile) */}
                <div className="sm:hidden mb-8">
                    <button onClick={() => setShowUploadMenu(true)} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30">
                        Subir Apuntes
                    </button>
                </div>

                {/* Upload Modal */}
                {showUploadMenu && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
                            <button onClick={() => setShowUploadMenu(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <FiX className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">Subir apuntes a la categoría de {id?.toUpperCase()}</h2>
                            {uploadError && <p className="text-red-500 mb-4 text-sm">{uploadError}</p>}
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                    <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Ej: Tema 1 - Sistemas Operativos" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Describe brevemente de qué trata..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Archivos Adjuntos</label>
                                    <input multiple onChange={(e) => setFiles(e.target.files)} type="file" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                                    Publicar Material
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Post List */}
                <div className="space-y-6">
                    {loading ? <p className="text-center text-gray-500 dark:text-gray-400">Cargando publicaciones...</p> : null}
                    {!loading && posts.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 p-10 bg-white dark:bg-gray-900 rounded-2xl">Aún no hay apuntes en esta categoría. ¡Sé el primero en subir uno!</p>}
                    {posts.map(testPost => (
                        <Link key={testPost._id} to={`/post/${testPost._id}`} className="block group">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all cursor-pointer transform hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm relative overflow-hidden shrink-0 ${testPost.author?.avatarColor || 'bg-blue-500'}`}>
                                            {testPost.author?.avatarUrl ? (
                                                <img src={`${import.meta.env.VITE_API_URL}${testPost.author.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                                            ) : (
                                                <span className="z-10 relative">{testPost.author?.name ? testPost.author.name.charAt(0).toUpperCase() : 'U'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {testPost.author?.name || 'Usuario Mínimo'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <FiClock className="w-3.5 h-3.5" />
                                                {new Date(testPost.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getGradient(id)} text-white`}>
                                        {testPost.category}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{testPost.title}</h2>
                                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-6">{testPost.description}</p>

                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <div className="flex gap-6">
                                        <span className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                            <FiEye className="w-4 h-4" /> {testPost.views}
                                        </span>
                                        <span className="flex items-center gap-2 hover:text-green-600 transition-colors">
                                            <FiThumbsUp className="w-4 h-4" /> {testPost.likes?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                            <FiThumbsDown className="w-4 h-4" /> {testPost.dislikes?.length || 0}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                                        Ver detalle <FiFileText className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
