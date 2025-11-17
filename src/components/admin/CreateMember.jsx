import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase';

export default function CreateMember() {
  const [formData, setFormData] = useState({
    loginId: '',
    name: '',
    contact_email: '',
    password: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create auth user with constructed email
      const email = `${formData.loginId}@edc-bills.internal`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );

      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        authUid: userCredential.user.uid,
        loginId: formData.loginId,
        name: formData.name,
        contact_email: formData.contact_email,
        role: formData.role,
        createdAt: serverTimestamp()
      });

      setMessage({
        type: 'success',
        text: `Member ${formData.name} created successfully!`
      });

      // Reset form
      setFormData({
        loginId: '',
        name: '',
        contact_email: '',
        password: '',
        role: 'member'
      });
    } catch (error) {
      console.error('Error creating member:', error);
      setMessage({
        type: 'error',
        text: `Failed to create member: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Member</h2>

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
            Login ID *
          </label>
          <input
            type="text"
            name="loginId"
            required
            value={formData.loginId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="e.g., pritesh123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="Full Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Email *
          </label>
          <input
            type="email"
            name="contact_email"
            required
            value={formData.contact_email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Member'}
        </button>
      </form>
    </div>
  );
}
