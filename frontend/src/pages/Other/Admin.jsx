import { FiUsers, FiActivity, FiShield, FiTrash2, FiAlertTriangle, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Admin() {
    const { token, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeReports: 0 });
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [userModal, setUserModal] = useState({ show: false, userId: null, userName: '' });
    const [reportModal, setReportModal] = useState({ show: false, postId: null, status: null, actionText: '' });

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const headers = { 'x-auth-token': token };

                const [statsRes, usersRes, reportsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`, { headers })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (usersRes.ok) setUsers(await usersRes.json());
                if (reportsRes.ok) setReports(await reportsRes.json());

            } catch (err) {
                console.error('Error fetching admin data', err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchAdminData();
        }
    }, [token, user, navigate, authLoading]);

    const handleBlockUser = async () => {
        if (!userModal.userId) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/${userModal.userId}/role`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== userModal.userId));
                setUserModal({ show: false, userId: null, userName: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePostStatus = async () => {
        if (!reportModal.postId || !reportModal.status) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/post/${reportModal.postId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: reportModal.status })
            });
            if (res.ok) {
                // Remove resolved reports from UI
                setReports(reports.filter(r => r.post._id !== reportModal.postId));
                // Reload stats
                const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { 'x-auth-token': token } });
                if (statsRes.ok) setStats(await statsRes.json());
                setReportModal({ show: false, postId: null, status: null, actionText: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));

    if (authLoading || loading) return <div className="p-10 text-center text-gray-500">Cargando Panel de Control...</div>;

    const statsCards = [
        { title: 'Usuarios Totales', value: stats.totalUsers, icon: <FiUsers className="w-6 h-6" />, color: 'bg-blue-500' },
        { title: 'Apuntes Subidos', value: stats.totalPosts, icon: <FiActivity className="w-6 h-6" />, color: 'bg-indigo-500' },
        { title: 'Reportes Activos', value: stats.activeReports, icon: <FiAlertTriangle className="w-6 h-6" />, color: 'bg-orange-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto py-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition-colors px-4 sm:px-0">
                <FiArrowLeft /> Volver al Inicio
            </Link>

            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-10 mb-10 text-white shadow-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
                            <FiShield className="text-blue-400" /> Panel de Control
                        </h1>
                        <p className="text-gray-300 text-lg">Administración global del repositorio</p>
                    </div>
                    <span className="hidden sm:inline-flex bg-red-500/20 text-red-100 border border-red-500/30 px-4 py-2 rounded-lg font-mono text-sm">
                        Nivel: {user?.role}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {statsCards.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Content Moderation */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        Alertas de Moderación
                    </h2>
                    <div className="space-y-4">
                        {reports.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay reportes activos.</p> : reports.map(report => (
                            <div key={report._id} className="p-4 border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4 overflow-hidden">
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link to={`/post/${report.post?._id}`} className="font-bold text-lg text-orange-900 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors truncate">
                                            {report.post?.title || 'Apunte Desconocido'}
                                        </Link>
                                    </div>
                                    <p className="text-sm text-orange-800 dark:text-orange-300 mb-1 break-words">Motivo: {report.reason}</p>
                                    <p className="text-xs text-orange-700/70 dark:text-orange-300/50 truncate">Reportado por: {report.reportedBy?.name || 'Usuario eliminado'}</p>
                                </div>
                                <div className="flex sm:flex-col flex-row gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                                    <button onClick={() => setReportModal({ show: true, postId: report.post?._id, status: 'blocked', actionText: 'bloquear' })} title="Bloquear Publicación" className="flex-1 sm:flex-none p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors flex justify-center items-center">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setReportModal({ show: true, postId: report.post?._id, status: 'active', actionText: 'permitir' })} title="Ignorar y Permitir" className="flex-1 sm:flex-none p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors flex justify-center items-center">
                                        <FiCheck className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Registrations */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestión de Cuentas
                        </h2>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar ID o Correo de usuario..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full mb-4 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {filteredUsers.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">No se encontraron usuarios.</p> : filteredUsers.map((u) => (
                            <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <Link to={`/user/${u._id}`} className="flex items-center gap-3 overflow-hidden group">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm relative overflow-hidden ${u.avatarColor || 'bg-blue-500'}`}>
                                        {u.avatarUrl ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${u.avatarUrl}`} className="absolute inset-0 w-full h-full object-cover z-0" alt="Avatar" />
                                        ) : (
                                            <span className="z-10 relative">{u.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{u.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => setUserModal({ show: true, userId: u._id, userName: u.name })}
                                    disabled={u.role === 'admin'}
                                    className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full shadow-sm ${u.role === 'admin' ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors'}`}
                                >
                                    Bloquear
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Delete Modal */}
            {userModal.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 dark:border-gray-800">
                        <button onClick={() => setUserModal({ show: false, userId: null, userName: '' })} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full mb-6 mx-auto">
                            <FiAlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold mb-4 dark:text-white text-center">
                            Bloquear Usuario
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{userModal.userName}</strong> y todos sus apuntes aportados? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setUserModal({ show: false, userId: null, userName: '' })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleBlockUser} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30">
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Action Modal */}
            {reportModal.show && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-gray-100 dark:border-gray-800">
                        <button onClick={() => setReportModal({ show: false, postId: null, status: null, actionText: '' })} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                        <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ${reportModal.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500'}`}>
                            {reportModal.status === 'blocked' ? <FiTrash2 className="w-8 h-8" /> : <FiCheck className="w-8 h-8" />}
                        </div>
                        <h2 className="text-2xl font-extrabold mb-4 dark:text-white text-center">
                            {reportModal.status === 'blocked' ? 'Bloquear Apunte' : 'Permitir Apunte'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                            ¿Estás seguro de que deseas <strong>{reportModal.actionText}</strong> esta publicación?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setReportModal({ show: false, postId: null, status: null, actionText: '' })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handlePostStatus} className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${reportModal.status === 'blocked' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'}`}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
