import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/16/solid';
import React, { useEffect, useState } from 'react';
import { getUserStats } from '../../../../services/applicationService';
import { useAuth } from '../../../../context/authContext';

const StatsCards = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState([
    { title: 'Open Positions', value: '—', change: null, trend: 'up' },
    { title: 'Total Applications', value: '—', change: null, trend: 'up' },
    { title: 'Shortlisted', value: '—', change: null, trend: 'up' },
    { title: 'Active Evaluators', value: '—', change: null, trend: 'up' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getUserStats(auth?.tokens?.accessToken);
      if (res.success && res.data?.data) {
        const d = res.data.data;
        setStats([
          { title: 'Open Positions',      value: d.positions?.open ?? 0,              trend: 'up' },
          { title: 'Total Applications',  value: d.applications?.total ?? 0,           trend: 'up' },
          { title: 'Shortlisted',         value: d.applications?.shortlisted ?? 0,     trend: 'up' },
          { title: 'Active Evaluators',   value: d.users?.byRole?.evaluator ?? 0,      trend: 'up' },
        ]);
      }
    };
    if (auth?.tokens?.accessToken) fetchStats();
  }, [auth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            {stat.change != null && (
              <span
                className={`ml-2 flex items-baseline text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                )}
                {stat.change}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
