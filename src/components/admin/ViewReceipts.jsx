import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { generatePDF, generateCSV } from '../../utils/exportUtils';

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({
    trip_id: '',
    category: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTrips();
    fetchReceipts();
  }, []);

  const fetchTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'));
      const tripsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(tripsData);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'receipts');

      // Apply filters
      const constraints = [];
      if (filters.trip_id) {
        constraints.push(where('trip_id', '==', filters.trip_id));
      }
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints, orderBy('created_at', 'desc'));
      } else {
        q = query(q, orderBy('created_at', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      let receiptsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply date filters client-side
      if (filters.start_date) {
        receiptsData = receiptsData.filter(r => r.date >= filters.start_date);
      }
      if (filters.end_date) {
        receiptsData = receiptsData.filter(r => r.date <= filters.end_date);
      }

      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    fetchReceipts();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch signed URLs for all receipts
      const receiptsWithUrls = await Promise.all(
        receipts.map(async (receipt) => {
          try {
            const fileRef = ref(storage, receipt.file_path);
            const url = await getDownloadURL(fileRef);
            return { ...receipt, downloadUrl: url };
          } catch (error) {
            console.error('Error getting URL for receipt:', receipt.id, error);
            return { ...receipt, downloadUrl: null };
          }
        })
      );

      const selectedTrip = trips.find(t => t.id === filters.trip_id);
      await generatePDF(receiptsWithUrls, selectedTrip);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      generateCSV(receipts);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const viewReceipt = async (receipt) => {
    try {
      const fileRef = ref(storage, receipt.file_path);
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing receipt:', error);
      alert('Failed to open receipt');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">View All Receipts</h2>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip
            </label>
            <select
              name="trip_id"
              value={filters.trip_id}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">All Trips</option>
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="accom">Accommodation</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || receipts.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting PDF...' : 'Export PDF'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={receipts.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      {loading ? (
        <div className="text-center py-8">Loading receipts...</div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No receipts found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Payer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.map(receipt => (
                <tr key={receipt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.date} {receipt.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.uploader_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.bill_payer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {receipt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.currency} {receipt.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {receipt.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewReceipt(receipt)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
