import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UploadReceipt from './member/UploadReceipt';
import MyReceipts from './member/MyReceipts';

export default function MemberDashboard() {
  const { userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'upload', name: 'Upload Receipt' },
    { id: 'my-receipts', name: 'My Receipts' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                EDC Member Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {userData?.name || 'Member'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'upload' && <UploadReceipt />}
          {activeTab === 'my-receipts' && <MyReceipts />}
        </div>
      </div>
    </div>
  );
}
