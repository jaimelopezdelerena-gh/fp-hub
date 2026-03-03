import { Link } from 'react-router-dom';
import { FiHeart, FiStar, FiClock, FiFileText, FiSearch } from 'react-icons/fi';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Likes() {
    const { token } = useContext(AuthContext);
    const [likes, setLikes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/user/likes`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok) {
                    setLikes(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchLikes();
    }, [token]);

    const filteredLikes = likes.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const getGradient = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'asir': return 'from-blue-500 to-cyan-500';
            case 'daw': return 'from-purple-500 to-pink-50';
            case 'dam': return 'from-orange-500 to-red-500';
            case 'smr': return 'from-green-500 to-emerald-500';
            default: return 'from-gray-500 to-gray-700';
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 rounded-3xl p-10 mb-10 text-white shadow-xl shadow-pink-500/20">
                <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
                    <FiHeart className="fill-white" /> Mis likes
                </h1>
                <p className="text-white/90 text-lg">Guarda tus apuntes favoritos para estudiarlos después</p>

                <div className="mt-6 relative max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar en tus likes por título o ciclo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full px-6 py-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all backdrop-blur-sm shadow-inner"
                    />
                </div>
            </div>

            {/* List of liked posts */}
            <div className="space-y-6">
                {loading ? <div className="text-center text-gray-500 dark:text-gray-400">Cargando likes...</div> : null}
                {!loading && filteredLikes.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400 p-10 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">No se encontraron referencias.</div>}
                {filteredLikes.map((post) => (
                    <Link key={post._id} to={`/post/${post._id}`} className="block group">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all cursor-pointer transform hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-sm shrink-0 overflow-hidden relative ${post.author?.avatarColor || 'bg-blue-500'}`}>
                                        {post.author?.avatarUrl ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${post.author.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                                        ) : (
                                            <span className="z-10 relative">{post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                                            {post.author?.name || 'Usuario Mínimo'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <FiClock className="w-3.5 h-3.5" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getGradient(post.category)} text-white`}>
                                    {post.category}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h2>

                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                                <div className="flex gap-6">
                                    <span className="flex items-center gap-2 text-pink-500">
                                        <FiHeart className="w-4 h-4 fill-current" /> Liked
                                    </span>
                                </div>
                                <span className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 font-medium transition-colors">
                                    Ver detalle <FiFileText className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
