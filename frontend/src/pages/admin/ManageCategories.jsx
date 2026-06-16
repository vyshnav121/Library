import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Loader2, Tags } from 'lucide-react';

export default function ManageCategories() {
  const { api } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [api]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, newCategory);
      } else {
        await api.post('/categories', newCategory);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category? This might affect books in this category.')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setNewCategory({ name: cat.name, description: cat.description || '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-text tracking-tight">Book Categories</h1>
          <p className="mt-2 text-sm text-gray-500">
            Organize your library collection with custom genres and categories.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          <button
            onClick={() => { setEditingId(null); setNewCategory({ name: '', description: '' }); setIsModalOpen(true); }}
            className="btn-primary flex items-center px-6 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-gray-500">
            No categories found. Create one to start organizing your books!
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="card p-6 flex flex-col group">
              <div className="flex items-start justify-between">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Tags className="h-6 w-6 text-primary" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-text">{cat.name}</h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{cat.description || 'No description provided.'}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 border border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text">
                  {editingId ? 'Edit Category' : 'New Category'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text mb-2 uppercase tracking-wide">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Science Fiction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Describe this category..."
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                    {submitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Save Category'}
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
