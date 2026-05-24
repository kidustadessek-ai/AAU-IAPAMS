import React, { useEffect, useState } from 'react';
import { CheckBadgeIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../../context/authContext';
import { getPositions } from '../../../../services/positionService';
import { useNavigate } from 'react-router-dom';

const RecentJobPosts = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const res = await getPositions({ limit: 5, sortBy: 'createdAt', order: 'desc' }, auth?.tokens?.accessToken);
        if (res.success) {
          const mapped = (res.data || []).map((pos) => ({
            id: pos._id,
            title: pos.title,
            type: pos.positionType,
            location: pos.department,
            posted: new Date(pos.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            status: pos.status === 'open' ? 'Active' : pos.status === 'closed' ? 'Closed' : 'Filled',
            applicants: 0, // You can add application count if available
            evaluators: pos.evaluators?.length || 0,
          }));
          setJobs(mapped);
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.tokens?.accessToken) fetchRecentJobs();
  }, [auth]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Job Posts</h2>
        <button 
          onClick={() => navigate('/admin/positions')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All Jobs
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-gray-400">No positions posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    {job.type} • {job.location} • Posted {job.posted}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'Active' ? 'bg-red-100 text-aau-primary' :
                    job.status === 'Closed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-4">
                  <span className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{job.applicants}</span> Applicants
                  </span>
                  <span className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{job.evaluators}</span> Evaluators
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate('/admin/positions')}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentJobPosts;
