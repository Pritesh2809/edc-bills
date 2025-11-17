import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';

export default function AuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxLogs, setMaxLogs] = useState(50);

  useEffect(() => {
    fetchAuditLogs();
  }, [maxLogs]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'audit'),
        orderBy('timestamp', 'desc'),
        limit(maxLogs)
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate();
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return '-';
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'email_sent':
        return 'bg-blue-100 text-blue-800';
      case 'exported':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Audit Log</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Show:</label>
          <select
            value={maxLogs}
            onChange={(e) => setMaxLogs(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-1 border"
          >
            <option value={50}>50 logs</option>
            <option value={100}>100 logs</option>
            <option value={200}>200 logs</option>
            <option value={500}>500 logs</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading audit logs...</div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No audit logs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.entity_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.success === undefined ? (
                      <span className="text-gray-500">-</span>
                    ) : log.success ? (
                      <span className="text-green-600">Success</span>
                    ) : (
                      <span className="text-red-600">Failed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.reason && <div>Reason: {log.reason}</div>}
                    {log.error && <div className="text-red-600">Error: {log.error}</div>}
                    {log.recipient && <div>Recipient: {log.recipient}</div>}
                    {log.meta && <div>Meta: {JSON.stringify(log.meta)}</div>}
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
