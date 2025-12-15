import React, { useEffect, useState } from 'react';
import { placesService } from '../../services/placesService';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
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

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>;

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-end mb-4 px-4 bg-gray-50 py-2 border-b">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm flex items-center gap-2 text-sm"
                >
                    <span>➕</span> Crear Nuevo Usuario
                </button>
            </div>

            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
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
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-500">#{u.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {u.avatar ? (
                                            <img
                                                src={u.avatar.startsWith('http') ? u.avatar : `/upload/${u.avatar.split('/').pop()}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes('storage')) {
                                                        target.src = `http://localhost:8000/storage/${u.avatar}`;
                                                    }
                                                }}
                                            />
                                        ) : <span className="text-gray-500 font-bold">{u.name[0]}</span>}
                                    </div>
                                    <span className="font-medium text-gray-900">{u.name}</span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600">{u.email}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    u.role === 'partner' ? 'bg-eco-teal-100 text-eco-teal-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {u.role === 'admin' ? '👑 Admin' : u.role === 'partner' ? '🤝 Socio' : '👤 Usuario'}
                                </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button
                                    onClick={() => handleEdit(u)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Usuario">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={editingUser?.name || ''}
                            onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="email"
                            value={editingUser?.email || ''}
                            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={editingUser?.role || 'user'}
                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                            <option value="user">Usuario</option>
                            <option value="partner">Socio</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold shadow-sm">Guardar Cambios</button>
                    </div>
                </form>
            </Modal>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Nuevo Usuario">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            value={newUser.name}
                            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                        <input
                            className="w-full p-2 border rounded-lg"
                            type="password"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">Usuario</option>
                            <option value="partner">Socio</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm">Crear Usuario</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUsersTable;
