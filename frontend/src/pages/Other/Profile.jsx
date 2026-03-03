import { FiUser, FiMail, FiEdit2, FiShield, FiStar, FiFileText, FiUpload, FiX, FiTrash2, FiHeart, FiInfo } from 'react-icons/fi';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user, setUser, token } = useContext(AuthContext);
    const [bannerColor, setBannerColor] = useState(user?.bannerColor || 'from-blue-500 to-indigo-600');
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [topUsers, setTopUsers] = useState([]);

    // File inputs
    const fileInputRef = useRef(null);

    // Upload Post state
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('ASIR');
    const [files, setFiles] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // User Posts state
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/user/me`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) setUserPosts(await res.json());
            } catch (err) {
                console.error("Error fetching user posts:", err);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchUserPosts();

        const fetchLikedPosts = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/user/likes`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) setLikedPosts(await res.json());
            } catch (err) {
                console.error("Error fetching liked posts:", err);
            }
        };
        fetchUserPosts();

        const refreshProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth`, { headers: { 'x-auth-token': token } });
                if (res.ok) setUser(await res.json());
            } catch (err) { }
        };
        refreshProfile();

        const fetchTopUsers = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/top`);
                if (res.ok) setTopUsers(await res.json());
            } catch (err) { console.error(err) }
        };
        fetchTopUsers();
    }, [token]);

    // Keep banner synced on load
    useEffect(() => {
        if (user && user.bannerColor) setBannerColor(user.bannerColor);
    }, [user]);

    const handleBannerSave = async (color) => {
        setBannerColor(color);
        setIsEditingColor(false);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/banner`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ bannerColor: color })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
            }
        } catch (err) {
            console.error("Error saving banner", err);
        }
    };

    const confirmDelete = (postId) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postToDelete}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setUserPosts(userPosts.filter(p => p._id !== postToDelete));
            }
        } catch (err) {
            console.error("Failed to delete post:", err);
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    const handleAvatarChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const formData = new FormData();
        formData.append('avatar', e.target.files[0]);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/avatar`, {
                method: 'PUT',
                headers: { 'x-auth-token': token },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadPost = async (e) => {
        e.preventDefault();

        if (files.length > 10) {
            setUploadError("El máximo permitido son 10 archivos por apunte.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUploadSuccess('¡Apunte subido con éxito!');
                setTimeout(() => {
                    setShowUploadMenu(false);
                    setUploadSuccess('');
                    setTitle('');
                    setDescription('');
                    setFiles([]);
                }, 1500);
            } else {
                setUploadError(data.msg || "Error al subir tu apunte");
            }
        } catch (err) {
            setUploadError("Error de conectividad");
        }
    };

    if (!user) return <div className="p-10 text-center dark:text-white">Cargando perfil...</div>;

    const colors = [
        'from-blue-500 to-indigo-600',
        'from-pink-500 to-rose-500',
        'from-green-500 to-emerald-600',
        'from-purple-500 to-purple-800',
        'from-orange-400 to-red-500'
    ];
    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${bannerColor} transition-all duration-500`}></div>
                <div className="relative z-10 pt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                    <div onClick={() => fileInputRef.current.click()} className="group w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center shadow-lg relative cursor-pointer overflow-hidden isolate">
                        {user.avatarUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                        ) : (
                            <span className="text-5xl font-bold text-blue-600 dark:text-blue-400 uppercase z-0">{user.name.charAt(0)}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full">
                            <FiUpload className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {!isEditingColor && (
                            <button onClick={() => setIsEditingColor(true)} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-6 py-2.5 rounded-xl font-medium transition-colors">
                                <FiEdit2 className="w-4 h-4" />
                                Editar Banner
                            </button>
                        )}
                        {isEditingColor && (
                            <div className="flex gap-2 mt-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                                {colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleBannerSave(color)}
                                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${color} hover:scale-110 transition-transform`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column (Info) */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                            Información Personal
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <FiMail className="w-5 h-5 text-gray-400" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <FiShield className="w-5 h-5 text-gray-400" />
                                <span>Miembro desde: Feb 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative">
                        <h2 className="text-xl font-bold mb-2 flex items-center justify-between">
                            Puntos de Contribución
                            <button onClick={() => setShowInfoModal(true)} className="p-1 hover:bg-white/20 rounded-full transition-colors opacity-80 hover:opacity-100" title="Ver rangos">
                                <FiInfo className="w-5 h-5" />
                            </button>
                        </h2>
                        <div className="text-4xl font-extrabold mb-1">{user.points || 0}</div>

                        {/* Calculate Current Rank */}
                        {(() => {
                            const p = user.points || 0;
                            let rName = 'Nuevo'; let rIcon = '🛡️';
                            if (p >= 2000) { rName = 'Colaborador'; rIcon = '👑'; }
                            else if (p >= 1000) { rName = 'Ayudante'; rIcon = '🤝'; }
                            else if (p >= 500) { rName = 'Principiante'; rIcon = '🎓'; }

                            return <p className="text-blue-100 text-sm font-semibold">Rango: {rIcon} {rName}</p>
                        })()}
                    </div>
                </div>

                {/* Right Column (Activity) */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <FiFileText className="text-blue-500" /> Mis Últimos Apuntes Subidos
                        </h2>

                        <div className="space-y-4">
                            {loadingPosts ? <p className="text-gray-500 text-sm">Cargando tus apuntes...</p> : null}
                            {!loadingPosts && userPosts.length === 0 && <p className="text-gray-500 text-sm">No has subido apuntes aún.</p>}

                            {userPosts.map(post => (
                                <div key={post._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex justify-between items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link to={`/post/${post._id}`} className="font-semibold text-gray-900 dark:text-white truncate pr-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                {post.title}
                                            </Link>
                                            <span className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold rounded-full">{post.category}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><FiHeart className="w-3.5 h-3.5 text-red-500" /> {post.likes?.length || 0} likes</span>
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => confirmDelete(post._id)} className="shrink-0 p-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-xl transition-colors" title="Borrar Apunte">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setShowUploadMenu(true)} className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-gray-800 transition-colors">
                            + Subir Nuevos Apuntes
                        </button>

                        {/* Upload Modal for Profile */}
                        {showUploadMenu && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
                                    <button onClick={() => setShowUploadMenu(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                        <FiX className="w-6 h-6" />
                                    </button>
                                    <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2"><FiUpload /> Compartir Apuntes</h2>

                                    {uploadError && <p className="text-red-500 mb-4 text-sm font-medium">{uploadError}</p>}
                                    {uploadSuccess && <p className="text-green-500 mb-4 text-sm font-medium">{uploadSuccess}</p>}

                                    <form onSubmit={handleUploadPost} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
                                                <option value="ASIR">ASIR</option>
                                                <option value="DAW">DAW</option>
                                                <option value="DAM">DAM</option>
                                                <option value="SMR">SMR</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                                            <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Ej: Tema 1 - Sistemas Operativos" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Describe brevemente de qué trata..."></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Archivos Adjuntos</label>
                                            <input multiple onChange={(e) => setFiles(e.target.files)} type="file" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
                                        </div>
                                        <button type="submit" className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                                            Publicar Apuntes
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gamification Ranks Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in-up">
                        <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-extrabold mb-6 dark:text-white text-center flex items-center justify-center gap-2">
                            Sistema de Rangos
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center">
                            Gana puntos aportando nuevos apuntes para la comunidad y ve subiendo de rango cuantos mas apuntes subas personalmente.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                                <div className="text-3xl">🛡️</div>
                                <div>
                                    <h3 className="font-bold text-blue-600 dark:text-blue-400">Nuevo</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">0 - 500 puntos</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                                <div className="text-3xl">🎓</div>
                                <div>
                                    <h3 className="font-bold text-yellow-600 dark:text-yellow-400">Principiante</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">500 - 1000 puntos</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30">
                                <div className="text-3xl">🤝</div>
                                <div>
                                    <h3 className="font-bold text-orange-600 dark:text-orange-400">Ayudante</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">1000 - 2000 puntos</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30">
                                <div className="text-3xl">👑</div>
                                <div>
                                    <h3 className="font-bold text-purple-600 dark:text-purple-400">Colaborador</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">2000+ puntos</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button onClick={() => { setShowInfoModal(false); setShowRankingModal(true); }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                                Ver Salón de la Fama
                            </button>
                            <button onClick={() => setShowInfoModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ranking Modal */}
            {showRankingModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative animate-fade-in-up border border-gray-100 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-950 z-10">
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Salón de la Fama</h2>
                            <button onClick={() => setShowRankingModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-2">
                            {topUsers.map((u, idx) => {
                                let title = 'Nuevo', icon = '🛡️', color = 'text-blue-500', bg = 'bg-blue-100 dark:bg-blue-900/30';
                                if (u.points >= 2000) { title = 'Colaborador'; icon = '👑'; color = 'text-purple-500'; bg = 'bg-purple-100 dark:bg-purple-900/30'; }
                                else if (u.points >= 1000) { title = 'Ayudante'; icon = '🤝'; color = 'text-orange-500'; bg = 'bg-orange-100 dark:bg-orange-900/30'; }
                                else if (u.points >= 500) { title = 'Principiante'; icon = '🎓'; color = 'text-yellow-500'; bg = 'bg-yellow-100 dark:bg-yellow-900/30'; }

                                return (
                                    <Link to={`/user/${u._id}`} key={u._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors last:border-0 gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0 overflow-hidden relative ${u.avatarColor || 'bg-blue-500'}`}>
                                                {u.avatarUrl ? (
                                                    <img src={`${import.meta.env.VITE_API_URL}${u.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                                                ) : (
                                                    <span className="z-10 relative">{u.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{u.name}</h3>
                                                <span className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${bg} ${color}`}>
                                                    {icon} {title}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-auto">
                                            <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 group-hover:scale-110 transition-transform origin-right">
                                                {u.points || 0}
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                title="¿Borrar Apunte?"
                message="Esta acción no se puede deshacer y el apunte desaparecerá permanentemente del repositorio."
                confirmText="Sí, borrar apunte"
                cancelText="Cancelar"
                isDestructive={true}
                onConfirm={handleDeletePost}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
}
