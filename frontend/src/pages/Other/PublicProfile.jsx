import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShield, FiStar, FiFileText, FiHeart, FiArrowLeft } from 'react-icons/fi';

export default function PublicProfile() {
    const { id } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${id}`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/posts/user/public/${id}`)
                ]);

                if (userRes.ok) setProfileUser(await userRes.json());
                if (postsRes.ok) setUserPosts(await postsRes.json());
            } catch (err) {
                console.error("Error fetching public profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    if (loading) return <div className="p-10 text-center dark:text-white">Cargando perfil público...</div>;
    if (!profileUser) return <div className="p-10 text-center text-red-500">Usuario no encontrado.</div>;

    const getRankInfo = (points) => {
        if (points >= 2000) return { title: 'Colaborador', icon: '👑', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' };
        if (points >= 1000) return { title: 'Ayudante', icon: '🤝', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
        if (points >= 500) return { title: 'Principiante', icon: '🎓', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
        return { title: 'Nuevo', icon: '🛡️', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    };

    const rankInfo = getRankInfo(profileUser.points || 0);

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link to={-1} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors px-4 sm:px-0">
                <FiArrowLeft /> Volver Atrás
            </Link>

            {/* Header Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${profileUser.bannerColor || 'from-blue-500 to-indigo-600'} transition-all duration-500`}></div>
                <div className="relative z-10 pt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg relative overflow-hidden isolate" style={{ backgroundColor: profileUser.avatarColor || '#3b82f6' }}>
                        {profileUser.avatarUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL}${profileUser.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                        ) : (
                            <span className="text-5xl font-bold text-white uppercase z-0">{profileUser.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
                            {profileUser.name}
                            <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${rankInfo.bg} ${rankInfo.color}`}>
                                {rankInfo.icon} {rankInfo.title}
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium capitalize mt-1">Miembro desde: {new Date(profileUser.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="text-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            {profileUser.points || 0}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Puntos Totales</span>
                    </div>
                </div>
            </div>

            {/* User Posts */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FiFileText className="text-blue-500" /> Apuntes Subidos por {profileUser.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPosts.length === 0 && <p className="text-gray-500 text-sm italic col-span-2">Este usuario no ha subido ningún apunte público aún.</p>}

                    {userPosts.map(post => (
                        <Link key={post._id} to={`/post/${post._id}`} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl dark:bg-gray-800/30 hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm relative overflow-hidden shrink-0 ${post.author?.avatarColor || 'bg-blue-500'}`}>
                                    {post.author?.avatarUrl ? (
                                        <img src={`${import.meta.env.VITE_API_URL}${post.author.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                                    ) : (
                                        <span className="z-10 relative">{post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}</span>
                                    )}
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{post.author?.name || 'Usuario'}</span>
                            </div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-2">{post.title}</h3>
                                <span className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold rounded-full">{post.category}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><FiHeart className="w-4 h-4 text-red-500" /> {post.likes?.length || 0}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
