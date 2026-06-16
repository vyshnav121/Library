import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function ManageBorrows() {
  const { api } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrows();
  }, [api]);

  const fetchBorrows = async () => {
    try {
      const { data } = await api.get('/borrow');
      setBorrows(data);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      await api.post('/borrow/return', { borrowId });
      fetchBorrows();
    } catch (error) {
      console.error('Error returning book:', error);
      alert(error.response?.data?.message || 'Failed to process return');
    }
  };

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-text tracking-tight">Circulation Records</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track active loans, return dates, and fine statuses across the entire library.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50/50">
                   <tr>
                     <th scope="col" className="py-5 pl-6 pr-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Book & User
                     </th>
                     <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Issue Date
                     </th>
                     <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Due Date
                     </th>
                     <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Days / Price
                     </th>
                     <th scope="col" className="px-3 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                       Loan Status
                     </th>
                     <th scope="col" className="relative py-5 pl-3 pr-6">
                       <span className="sr-only">Actions</span>
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border bg-surface">
                   {loading ? (
                     <tr>
                       <td colSpan="6" className="text-center py-8">
                         <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
                       </td>
                     </tr>
                   ) : borrows.length === 0 ? (
                     <tr>
                       <td colSpan="6" className="text-center py-4 text-sm text-gray-500">No borrow records found.</td>
                     </tr>
                   ) : (
                     borrows.map((record) => (
                       <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="whitespace-nowrap py-5 pl-6 pr-3">
                           <div className="flex items-center">
                             <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold mr-4">
                               <BookOpen className="h-5 w-5" />
                             </div>
                             <div>
                               <div className="text-sm font-bold text-text truncate max-w-xs">{record.book?.title || 'Unknown Book'}</div>
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{record.user?.name || 'Unknown User'}</div>
                             </div>
                           </div>
                         </td>
                         <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-gray-500">
                           {new Date(record.borrowDate).toLocaleDateString()}
                         </td>
                         <td className="whitespace-nowrap px-3 py-5 text-sm font-medium text-gray-500">
                            {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}
                         </td>
                         <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-text">
                            <div className="flex flex-col">
                              <span>{record.borrowDays} Days</span>
                              <span className="text-[10px] text-primary">${record.totalPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                         </td>
                         <td className="whitespace-nowrap px-3 py-5 text-sm font-bold">
                           {record.status === 'borrowed' && (
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                               Active Loan
                             </span>
                           )}
                           {record.status === 'returned' && (
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                               Returned
                             </span>
                           )}
                           {record.status === 'overdue' && (
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
                               Overdue
                             </span>
                           )}
                         </td>
                         <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right font-bold">
                           {record.status === 'borrowed' && (
                             <button
                               onClick={() => handleReturn(record._id)}
                               className="text-primary hover:text-primary-dark transition-colors flex items-center justify-end w-full text-xs uppercase tracking-widest"
                             >
                               <CheckCircle className="h-4 w-4 mr-2" />
                               Process Return
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
         </div>
     );
}
