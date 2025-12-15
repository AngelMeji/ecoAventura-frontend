import React, { useEffect, useState } from 'react';
import { placesService } from '../../services/placesService';

// Premium Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 transition-all">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all scale-100 opacity-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 font-display">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const AdminUsersTable: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Create Mode States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setLoading(true);
        placesService.getAllUsers()
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return;
        try {
            await placesService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert('Error eliminando usuario');
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser({ ...user }); // Copy
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await placesService.updateUser(editingUser.id, editingUser);
            alert('Usuario actualizado');
            setIsEditOpen(false);
            loadUsers();
        } catch (error) {
            alert('Error actualizando usuario');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await placesService.createUser(newUser);
            alert('Usuario creado con éxito');
            setIsCreateOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            loadUsers();
        } catch (error: any) {
            console.error(error);
            alert('Error creando usuario: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
        }
    };

    if (loading) return (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-eco-primary-600"></div>
            <p>Cargando usuarios...</p>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-6 px-4">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="auth-button w-auto px-6 py-2.5 text-sm flex items-center gap-2 shadow-lg shadow-eco-primary-500/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Crear Nuevo Usuario
                </button>
            </div>

            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                    <tr>
                        <th className="p-4 border-b">ID</th>
                        <th className="p-4 border-b">Usuario</th>
                        <th className="p-4 border-b">Email</th>
                        <th className="p-4 border-b">Rol</th>
                        <th className="p-4 border-b text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-gray-400 font-mono text-xs">#{u.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-eco-primary-50 flex items-center justify-center overflow-hidden border border-eco-primary-100">
                                        {u.avatar ? (
                                            <img
                                                src={u.avatar.startsWith('http') ? u.avatar : `/upload/${u.avatar.split('/').pop()}`}
                                                className="w-full h-full object-cover"
                                                alt={u.name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes('storage')) {
                                                        target.src = `http://localhost:8000/storage/${u.avatar}`;
                                                    }
                                                }}
                                            />
                                        ) : <span className="text-eco-primary-600 font-bold">{u.name[0]}</span>}
                                    </div>
                                    <span className="font-bold text-gray-800">{u.name}</span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600 text-sm">{u.email}</td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                        u.role === 'partner' ? 'bg-eco-primary-50 text-eco-primary-700 border border-eco-primary-100' :
                                            'bg-gray-50 text-gray-600 border border-gray-200'
                                    }`}>
                                    {u.role === 'admin' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                    {u.role === 'partner' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    {u.role === 'user' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}

                                    {u.role === 'admin' ? 'Admin' : u.role === 'partner' ? 'Socio' : 'Usuario'}
                                </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={() => handleEdit(u)}
                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Usuario">
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all"
                            value={editingUser?.name || ''}
                            onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all"
                            type="email"
                            value={editingUser?.email || ''}
                            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all appearance-none cursor-pointer bg-white"
                                value={editingUser?.role || 'user'}
                                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                            >
                                <option value="user">Usuario</option>
                                <option value="partner">Socio</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="auth-button w-auto px-6 py-2.5 shadow-md">Guardar Cambios</button>
                    </div>
                </form>
            </Modal>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Nuevo Usuario">
                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all"
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all"
                            type="email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña *</label>
                        <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all"
                            type="password"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all appearance-none cursor-pointer bg-white"
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="user">Usuario</option>
                                <option value="partner">Socio</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="auth-button w-auto px-6 py-2.5 shadow-md">Crear Usuario</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUsersTable;
