import { ClockIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/authContext';
import { api } from '../../../../utils/api';

const RecentActivities = () => {
  const { auth } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/applications?limit=5&sortBy=createdAt&order=desc', {
          headers: { Authorization: `Bearer ${auth?.tokens?.accessToken}` },
        });
        const apps = res.data?.data || [];
        const mapped = apps.map((app) => ({
          id: app._id,
          name: app.applicant?.fullName || app.applicant?.username || 'Unknown',
          action: `applied for ${app.position?.title || 'a position'} — status: ${app.status}`,
          time: new Date(app.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          }),
        }));
        setActivities(mapped);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.tokens?.accessToken) fetchRecent();
  }, [auth]);

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity yet.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-aau-primary font-medium">
                  {activity.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.name}</span> {activity.action}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivities;
