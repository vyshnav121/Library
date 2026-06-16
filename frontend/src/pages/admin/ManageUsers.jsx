import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Mail, Loader2, Edit, X, Shield, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function ManageUsers() {
  const { api, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [api]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/users/${editingUser._id}`, {
        role: editingUser.role,
        isActive: editingUser.isActive
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser._id) return alert("You cannot delete your own account.");
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-text tracking-tight">User Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            A directory of all library users including their name, email, role and status.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="py-5 pl-6 pr-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  User
                </th>
                <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Role
                </th>
                <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th scope="col" className="relative py-5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-4">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-text">{u.name}</div>
                          <div className="text-gray-400 flex items-center mt-0.5">
                            <Mail className="h-3 w-3 mr-1" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-bold">
                       {u.isActive ? (
                         <span className="text-green-600 flex items-center">
                           <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></div>
                           Active
                         </span>
                       ) : (
                         <span className="text-red-500 flex items-center">
                           <div className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></div>
                           Blocked
                         </span>
                       )}
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right font-bold text-sm">
                      <button onClick={() => openEditModal(u)} className="text-primary hover:text-primary-dark mr-4 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      {u._id !== currentUser._id && (
                        <button onClick={() => handleDelete(u._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative transform overflow-hidden rounded-2xl bg-surface shadow-2xl transition-all w-full max-w-md">
              <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-text tracking-tight">Advanced Settings</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">User Role</label>
                   <div className="grid grid-cols-1 gap-3">
                      {['user', 'librarian', 'admin'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditingUser({ ...editingUser, role: r })}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            editingUser.role === r 
                              ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                              : 'border-border bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            {r === 'admin' ? <Shield className="h-5 w-5 mr-3" /> : r === 'librarian' ? <ShieldAlert className="h-5 w-5 mr-3" /> : <UserIcon className="h-5 w-5 mr-3" />}
                            <span className="font-bold capitalize">{r}</span>
                          </div>
                          {editingUser.role === r && <div className="h-2 w-2 bg-primary rounded-full"></div>}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-border">
                  <div>
                    <div className="font-bold text-text text-sm">Account Status</div>
                    <div className="text-xs text-gray-400 mt-1">{editingUser.isActive ? 'Active' : 'Blocked'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, isActive: !editingUser.isActive })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editingUser.isActive ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editingUser.isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                <div className="flex flex-col space-y-3 pt-4">
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                    {submitting ? 'Saving...' : 'Update Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
