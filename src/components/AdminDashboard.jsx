import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateMember from './admin/CreateMember';
import CreateTrip from './admin/CreateTrip';
import ViewReceipts from './admin/ViewReceipts';
import AuditLog from './admin/AuditLog';

export default function AdminDashboard() {
  const { userData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('members');

  const tabs = [
    { id: 'members', name: 'Create Members' },
    { id: 'trips', name: 'Create Trips' },
    { id: 'receipts', name: 'View Receipts' },
    { id: 'audit', name: 'Audit Log' },
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
                EDC Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {userData?.name || 'Admin'}
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
          {activeTab === 'members' && <CreateMember />}
          {activeTab === 'trips' && <CreateTrip />}
          {activeTab === 'receipts' && <ViewReceipts />}
          {activeTab === 'audit' && <AuditLog />}
        </div>
      </div>
    </div>
  );
}
