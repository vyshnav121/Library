import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Loader2, BookOpen } from 'lucide-react';

export default function ManageBooks() {
  const { api, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', totalCopies: 1, coverImage: '', category: '', pricePerDay: 0 });
  const [addingBook, setAddingBook] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          api.get('/books'),
          api.get('/categories')
        ]);
        setBooks(booksRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setAddingBook(true);
    try {
      if (editingBookId) {
        await api.put(`/books/${editingBookId}`, newBook);
      } else {
        // Fallback for category if not selected
        let categoryId = newBook.category;
        if (!categoryId) {
          if (categories.length === 0) {
            // Create a default category if none exist
            const { data: newCat } = await api.post('/categories', { name: 'General', description: 'General Category' });
            categoryId = newCat._id;
          } else {
            categoryId = categories[0]._id;
          }
        }
        await api.post('/books', { ...newBook, category: categoryId });
      }
      
      setIsModalOpen(false);
      setEditingBookId(null);
      setNewBook({ title: '', author: '', isbn: '', totalCopies: 1, coverImage: '', category: '', pricePerDay: 0 });
      
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save book');
    } finally {
      setAddingBook(false);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
      setNewBook({ ...newBook, coverImage: data });
    } catch (error) {
      console.error('Error uploading image', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if(window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/books/${id}`);
        setBooks(books.filter(b => b._id !== id));
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const openAddModal = () => {
    setEditingBookId(null);
    setNewBook({ title: '', author: '', isbn: '', totalCopies: 1, coverImage: '', category: '', pricePerDay: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBookId(book._id);
    setNewBook({ 
      title: book.title, 
      author: book.author, 
      isbn: book.isbn, 
      totalCopies: book.totalCopies || 1,
      coverImage: book.coverImage || '',
      category: book.category?._id || book.category || '',
      pricePerDay: book.pricePerDay || 0
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-text tracking-tight">Books Inventory</h1>
          <p className="mt-2 text-sm text-gray-500">
            A list of all books in your library including their title, author, ISBN and availability.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="py-5 pl-6 pr-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Book Info
                </th>
                <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Author & ISBN
                </th>
                <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                   Daily Price
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
                  <td colSpan="5" className="text-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="whitespace-nowrap py-5 pl-6 pr-3">
                      <div className="flex items-center">
                        <div className="h-14 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4 flex items-center justify-center border border-border">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage.startsWith('http') ? book.coverImage : `http://localhost:5000${book.coverImage}`} 
                              alt="" 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text truncate max-w-xs">{book.title}</div>
                          <div className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">{book.category?.name || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <div className="text-text font-medium">{book.author}</div>
                      <div className="text-gray-400 text-xs mt-1 font-medium">{book.isbn}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-text">
                       ${book.pricePerDay?.toFixed(2)}/day
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        book.availableCopies > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {book.availableCopies} / {book.totalCopies} Available
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right font-bold text-sm">
                      <button onClick={() => openEditModal(book)} className="text-primary hover:text-primary-dark mr-4 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteBook(book._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-2xl bg-surface text-left shadow-2xl transition-all w-full max-w-lg">
              <div className="px-8 py-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold text-text">
                  {editingBookId ? 'Edit Book' : 'Add New Book'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddBook}>
                <div className="px-8 py-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={newBook.title}
                      onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                      className="input-field"
                      placeholder="e.g. The Great Gatsby"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Author</label>
                      <input
                        type="text"
                        required
                        value={newBook.author}
                        onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">ISBN</label>
                      <input
                        type="text"
                        required
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <select
                        value={newBook.category}
                        onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price per Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={newBook.pricePerDay}
                        onChange={(e) => setNewBook({...newBook, pricePerDay: Number(e.target.value)})}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Copies</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBook.totalCopies}
                      onChange={(e) => setNewBook({...newBook, totalCopies: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cover Image</label>
                    <input
                      type="file"
                      onChange={uploadFileHandler}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {uploading && <p className="text-xs text-primary mt-2">Uploading...</p>}
                  </div>
                </div>
                <div className="px-8 py-6 bg-gray-50 flex flex-row-reverse space-x-reverse space-x-4 rounded-b-2xl border-t border-border">
                  <button
                    type="submit"
                    disabled={addingBook}
                    className="btn-primary"
                  >
                    {addingBook ? 'Saving...' : editingBookId ? 'Update' : 'Add Book'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-text"
                  >
                    Cancel
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
