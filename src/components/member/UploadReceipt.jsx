import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function UploadReceipt() {
  const { userData } = useAuth();
  const [trips, setTrips] = useState([]);
  const [tripMembers, setTripMembers] = useState([]);
  const [formData, setFormData] = useState({
    trip_id: '',
    bill_payer_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    category: 'food',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserTrips();
  }, []);

  useEffect(() => {
    if (formData.trip_id) {
      fetchTripMembers(formData.trip_id);
    }
  }, [formData.trip_id]);

  const fetchUserTrips = async () => {
    try {
      // Fetch trips where current user is a member
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      const userTrips = tripsSnapshot.docs
        .filter(doc => {
          const tripData = doc.data();
          return tripData.members && tripData.members.includes(userData.id);
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      setTrips(userTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchTripMembers = async (tripId) => {
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (tripDoc.exists()) {
        const tripData = tripDoc.data();
        const memberIds = tripData.members || [];

        // Fetch user details for each member
        const membersData = await Promise.all(
          memberIds.map(async (memberId) => {
            const userDoc = await getDoc(doc(db, 'users', memberId));
            if (userDoc.exists()) {
              return { id: userDoc.id, ...userDoc.data() };
            }
            return null;
          })
        );

        setTripMembers(membersData.filter(m => m !== null));
      }
    } catch (error) {
      console.error('Error fetching trip members:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate file
      if (!formData.file) {
        throw new Error('Please select a file');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(formData.file.type)) {
        throw new Error('Only JPG, PNG, and PDF files are allowed');
      }

      const maxSize = 20 * 1024 * 1024; // 20MB
      if (formData.file.size > maxSize) {
        throw new Error('File size must be less than 20MB');
      }

      // Get bill payer details
      const billPayer = tripMembers.find(m => m.id === formData.bill_payer_id);
      if (!billPayer) {
        throw new Error('Bill payer not found');
      }

      // Create receipt document first to get ID
      const receiptRef = await addDoc(collection(db, 'receipts'), {
        trip_id: formData.trip_id,
        uploader_id: userData.authUid,
        uploader_name: userData.name,
        bill_payer_id: billPayer.authUid,
        bill_payer_name: billPayer.name,
        bill_payer_email: billPayer.contact_email,
        amount: parseFloat(formData.amount),
        currency: 'INR',
        date: formData.date,
        time: formData.time,
        category: formData.category,
        description: formData.description,
        file_path: '', // Will update after upload
        file_url: '',
        created_at: serverTimestamp(),
        created_by: userData.authUid
      });

      // Upload file to storage
      const fileExtension = formData.file.name.split('.').pop();
      const filePath = `receipts/${formData.trip_id}/${receiptRef.id}_${Date.now()}.${fileExtension}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, formData.file);

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Update receipt document with file info
      await addDoc(collection(db, 'receipts'), {
        id: receiptRef.id,
        trip_id: formData.trip_id,
        uploader_id: userData.authUid,
        uploader_name: userData.name,
        bill_payer_id: billPayer.authUid,
        bill_payer_name: billPayer.name,
        bill_payer_email: billPayer.contact_email,
        amount: parseFloat(formData.amount),
        currency: 'INR',
        date: formData.date,
        time: formData.time,
        category: formData.category,
        description: formData.description,
        file_path: filePath,
        file_url: downloadURL,
        created_at: serverTimestamp(),
        created_by: userData.authUid
      });

      setMessage({
        type: 'success',
        text: `Receipt uploaded successfully! Email notification sent to ${billPayer.name}.`
      });

      // Reset form
      setFormData({
        trip_id: formData.trip_id,
        bill_payer_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        category: 'food',
        description: '',
        file: null
      });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setMessage({
        type: 'error',
        text: `Failed to upload receipt: ${error.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Trip *
          </label>
          <select
            name="trip_id"
            required
            value={formData.trip_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          >
            <option value="">-- Select Trip --</option>
            {trips.map(trip => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
        </div>

        {formData.trip_id && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bill Payer *
              </label>
              <select
                name="bill_payer_id"
                required
                value={formData.bill_payer_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">-- Select Bill Payer --</option>
                {tripMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount (INR) *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="accom">Accommodation</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Receipt File * (JPG, PNG, or PDF, max 20MB)
              </label>
              <input
                type="file"
                name="file"
                required
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Receipt'}
            </button>
          </>
        )}

        {!formData.trip_id && trips.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            You are not part of any trips yet. Contact admin to be added to a trip.
          </div>
        )}
      </form>
    </div>
  );
}
