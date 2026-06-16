import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  Search,
  Library,
  Clock,
  LogOut,
  Sun,
  Moon,
  Loader2,
  Sparkles,
  X,
  DollarSign,
  Calendar,
  BookText,
  QrCode,
  AlertTriangle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatbot from '../components/AIChatbot';
import Footer from '../components/Footer';

export default function Dashboard() {
  const { user, logout, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('catalog');
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [myFines, setMyFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Modals & Panels State
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowDays, setBorrowDays] = useState(14);

  // AI Summary State
  const [summaryBook, setSummaryBook] = useState(null);
  const [bookSummaryText, setBookSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // QR Modal State
  const [qrBook, setQrBook] = useState(null);

  // PDF Viewer State
  const [pdfBook, setPdfBook] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, historyRes, recommendationsRes, finesRes] = await Promise.all([
        api.get('/books'),
        api.get('/borrow/my-history'),
        api.get('/recommendations'),
        api.get('/borrow/my-fines'),
      ]);
      setBooks(booksRes.data);
      setMyHistory(historyRes.data);
      setRecommendations(recommendationsRes.data);
      setMyFines(finesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openBorrowModal = (book) => {
    setSelectedBook(book);
    setBorrowDays(14);
    setIsBorrowModalOpen(true);
  };

  const handleBorrow = async () => {
    if (!selectedBook) return;
    setActionLoading(selectedBook._id);
    try {
      await api.post('/borrow', { bookId: selectedBook._id, days: borrowDays });
      setIsBorrowModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayFine = async (fine) => {
    setActionLoading(fine._id);
    try {
      await api.post('/borrow/pay', {
        referenceId: fine._id,
        type: 'fine',
        amount: fine.amount,
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFetchSummary = async (book) => {
    setSummaryBook(book);
    setBookSummaryText('');
    setLoadingSummary(true);
    try {
      const { data } = await api.post(`/books/${book._id}/summarize`);
      setBookSummaryText(data.summary);
    } catch (err) {
      setBookSummaryText('Failed to generate summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = selectedBook ? (selectedBook.pricePerDay || 0) * borrowDays : 0;

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-200">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-30 h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight">SmartLibrary</span>
            </div>
            <div className="flex items-center space-x-6">
              {user?.role && user.role !== 'user' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-border/20"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex items-center space-x-3 border-l border-border pl-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                  {user?.name?.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-sm font-bold text-text block leading-none">{user?.name}</span>
                  {user?.isVerified ? (
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Verified</span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Unverified</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Alert Banner */}
        {user && !user.isVerified && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Your email is not verified. Please check the console output for your verification code.</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:underline flex items-center gap-1"
            >
              Verify Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Hero Section */}
        {activeTab === 'catalog' && !searchQuery && (
          <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/95 to-primary/70 p-8 md:p-12 text-white shadow-2xl shadow-primary/10">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md mb-6 tracking-wide">
                <Sparkles className="mr-2 h-4 w-4 text-amber-300 animate-pulse" />
                AI RECOMMENDATIONS ACTIVE
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Meet Librify, your digital library.
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-xl leading-relaxed">
                Unlock instant book summaries, collaborative content feeds, and real-time checkout management.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 hidden lg:block w-1/3 opacity-20 transform translate-x-10 translate-y-10 scale-150">
              <Library className="h-full w-full" />
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-10">
          <nav className="-mb-px flex space-x-10">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`${
                activeTab === 'catalog'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              } whitespace-nowrap py-5 px-1 border-b-2 font-bold text-sm flex items-center transition-all duration-200`}
            >
              <Library className="mr-2 h-5 w-5" />
              Library Catalog
            </button>
            <button
              onClick={() => setActiveTab('mybooks')}
              className={`${
                activeTab === 'mybooks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              } whitespace-nowrap py-5 px-1 border-b-2 font-bold text-sm flex items-center transition-all duration-200`}
            >
              <Clock className="mr-2 h-5 w-5" />
              My Books & Fines
            </button>
          </nav>
        </div>

        {/* Catalog Tab Content */}
        {activeTab === 'catalog' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="max-w-xl flex-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    className="input-field pl-12 py-3.5 shadow-xl shadow-black/5"
                    placeholder="Search by title, author or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AI Recommendations Section */}
            {!searchQuery && recommendations.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-bold tracking-tight text-text">AI Recommendations For You</h3>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-800">
                  {recommendations.map((book) => (
                    <div
                      key={book._id}
                      className="card min-w-[260px] max-w-[260px] flex-shrink-0 flex flex-col h-full bg-surface/40 border-purple-500/20"
                    >
                      <div className="h-40 bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                        {book.coverImage && book.coverImage !== '/images/sample.jpg' ? (
                          <img
                            src={book.coverImage.startsWith('http') ? book.coverImage : `http://localhost:5000${book.coverImage}`}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-gray-500" />
                        )}
                        <span className="absolute top-2 right-2 bg-purple-500/90 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          AI Pick
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-text truncate">{book.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{book.author}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => handleFetchSummary(book)}
                            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                          >
                            <BookText className="w-3.5 h-3.5" /> Summary
                          </button>
                          <button
                            onClick={() => openBorrowModal(book)}
                            disabled={book.availableCopies === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                          >
                            Borrow
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="section-title flex items-center text-xl font-bold tracking-tight mb-8">
              <Library className="mr-2 h-6 w-6 text-primary" />
              Explore All Books
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map((book) => (
                  <div key={book._id} className="card group flex flex-col h-full overflow-hidden border border-border">
                    <div className="h-56 bg-gray-950/20 flex items-center justify-center relative overflow-hidden">
                      {book.coverImage && book.coverImage !== '/images/sample.jpg' ? (
                        <img
                          src={book.coverImage.startsWith('http') ? book.coverImage : `http://localhost:5000${book.coverImage}`}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-gray-500" />
                      )}

                      {book.availableCopies === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-500/90 text-white px-3 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Issued
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-base font-bold text-text truncate max-w-[170px]" title={book.title}>
                            {book.title}
                          </h3>
                          {book.pricePerDay > 0 && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                              ${book.pricePerDay.toFixed(2)}/d
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider">
                          <span>{book.availableCopies} COPIES</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setQrBook(book)}
                              className="p-1 hover:text-primary transition-colors"
                              title="Generate ISBN QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleFetchSummary(book)}
                              className="p-1 hover:text-primary transition-colors"
                              title="AI Book Summary"
                            >
                              <BookText className="w-4 h-4" />
                            </button>
                            {book.pdfUrl && (
                              <button
                                onClick={() => setPdfBook(book)}
                                className="p-1 hover:text-emerald-500 transition-colors"
                                title="Read PDF E-Book"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => openBorrowModal(book)}
                          disabled={book.availableCopies === 0 || actionLoading === book._id}
                          className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === book._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Borrow Book'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Books & History Tab Content */}
        {activeTab === 'mybooks' && (
          <div className="space-y-8">
            {/* Overdue Fines Section */}
            {myFines.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold tracking-tight">Outstanding Fines</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myFines.map((fine) => (
                    <div
                      key={fine._id}
                      className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                        fine.status === 'paid'
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-950/20 border-amber-500/20 text-amber-400 animate-pulse'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm">
                          Fine for: {fine.borrowRecord?.book?.title || 'Overdue Book'}
                        </h4>
                        <p className="text-xs opacity-75 mt-1">Status: {fine.status.toUpperCase()}</p>
                        <p className="text-lg font-black mt-2">${fine.amount.toFixed(2)}</p>
                      </div>
                      {fine.status === 'unpaid' && (
                        <button
                          onClick={() => handlePayFine(fine)}
                          disabled={actionLoading === fine._id}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1"
                        >
                          {actionLoading === fine._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5" /> Pay Now
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Borrow History */}
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-4">Borrowing History</h3>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : myHistory.length === 0 ? (
                <div className="text-center py-12 bg-surface/30 rounded-2xl border border-border">
                  <Clock className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-text">No borrow history</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't borrowed any books yet.</p>
                </div>
              ) : (
                <div className="card overflow-hidden border border-border">
                  <ul role="list" className="divide-y divide-border">
                    {myHistory.map((record) => (
                      <li key={record._id} className="hover:bg-border/10 transition-colors">
                        <div className="px-6 py-6 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-14 w-10 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {record.book?.coverImage && record.book?.coverImage !== '/images/sample.jpg' ? (
                                <img
                                  src={record.book.coverImage.startsWith('http') ? record.book.coverImage : `http://localhost:5000${record.book.coverImage}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-base font-bold text-text truncate max-w-[200px] sm:max-w-xs">
                                {record.book?.title || 'Unknown Book'}
                              </p>
                              <div className="mt-1 flex space-x-4 text-xs text-gray-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> {new Date(record.borrowDate).toLocaleDateString()}
                                </span>
                                {record.totalPrice > 0 && (
                                  <span className="text-primary font-bold">
                                    ${record.totalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {record.book?.pdfUrl && record.status === 'borrowed' && (
                              <button
                                onClick={() => setPdfBook(record.book)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                              >
                                <Eye className="w-3.5 h-3.5" /> Read E-Book
                              </button>
                            )}
                            {record.status === 'borrowed' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                                Active
                              </span>
                            )}
                            {record.status === 'returned' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                Returned
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Borrow Confirmation Modal */}
      {isBorrowModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsBorrowModalOpen(false)}></div>
          <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-6 border-b border-border flex justify-between items-center bg-border/10">
              <h3 className="text-lg font-bold text-text tracking-tight">Confirm Borrowing</h3>
              <button
                onClick={() => setIsBorrowModalOpen(false)}
                className="text-gray-400 hover:text-text p-2 rounded-lg hover:bg-border/20 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <div className="h-16 w-12 rounded-lg bg-gray-950/20 flex-shrink-0 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {selectedBook.coverImage ? (
                    <img src={selectedBook.coverImage} className="w-full h-full object-cover" />
                  ) : (
                    selectedBook.title.charAt(0)
                  )}
                </div>
                <div>
                  <div className="font-bold text-text text-base">{selectedBook.title}</div>
                  <div className="text-xs text-gray-500 font-medium">{selectedBook.author}</div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-text uppercase tracking-wide">
                  Borrow Duration (Days)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={borrowDays}
                      onChange={(e) => setBorrowDays(Number(e.target.value))}
                      className="input-field pl-12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 21, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setBorrowDays(d)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        borrowDays === d
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface text-gray-400 border-border hover:border-primary'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-border/10 rounded-2xl p-5 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 font-medium">Price per day</span>
                  <span className="text-xs font-bold text-text">${selectedBook.pricePerDay?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-sm font-bold text-text">Total Price</span>
                  <span className="text-xl font-black text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBorrow}
                disabled={actionLoading === selectedBook._id}
                className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                {actionLoading === selectedBook._id ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  `Pay $${totalPrice.toFixed(2)} & Checkout`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      <AnimatePresence>
        {summaryBook && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSummaryBook(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-lg border border-border overflow-hidden z-10"
            >
              <div className="px-6 py-6 border-b border-border flex justify-between items-center bg-border/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <h3 className="text-base font-bold text-text tracking-tight">AI Summary Analyzer</h3>
                </div>
                <button
                  onClick={() => setSummaryBook(null)}
                  className="text-gray-400 hover:text-text p-1.5 rounded-lg hover:bg-border/15 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <h4 className="text-lg font-bold text-text">{summaryBook.title}</h4>
                  <p className="text-xs text-gray-500">by {summaryBook.author}</p>
                </div>

                {loadingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">
                      Analyzing Book text and generating summaries...
                    </span>
                  </div>
                ) : (
                  <div className="bg-border/5 p-6 rounded-2xl border border-border leading-relaxed text-sm text-gray-300 whitespace-pre-line">
                    {bookSummaryText}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrBook && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setQrBook(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-sm border border-border overflow-hidden z-10 text-center"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-border/5">
                <h3 className="text-sm font-bold text-text tracking-tight">ISBN QR Code Representation</h3>
                <button
                  onClick={() => setQrBook(null)}
                  className="text-gray-400 hover:text-text p-1 rounded-lg hover:bg-border/15 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center justify-center gap-6">
                <div>
                  <h4 className="font-bold text-base text-text">{qrBook.title}</h4>
                  <p className="text-xs text-gray-500">ISBN: {qrBook.isbn}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrBook.isbn}`}
                    alt={`${qrBook.title} QR`}
                    className="w-36 h-36"
                  />
                </div>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Scan this QR code with any library terminal reader to lookup or issue this book automatically.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Fullscreen Drawer */}
      <AnimatePresence>
        {pdfBook && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-text">{pdfBook.title}</h3>
                  <p className="text-[10px] text-gray-500 font-medium">E-Book Viewer Mode</p>
                </div>
              </div>
              <button
                onClick={() => setPdfBook(null)}
                className="text-gray-400 hover:text-text p-2 rounded-lg hover:bg-border/15 transition-all flex items-center gap-1 font-bold text-xs uppercase tracking-wider"
              >
                Close <X className="w-4 h-4" />
              </button>
            </header>
            <div className="flex-1 w-full h-full bg-slate-900 relative">
              <iframe
                src={pdfBook.pdfUrl}
                title={`${pdfBook.title} E-Book`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AIChatbot />
      <Footer />
    </div>
  );
}
