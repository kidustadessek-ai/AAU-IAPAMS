import { useEffect, useState } from 'react';
import ApplicationsChart from './_components/ApplicationsChart';
import RecentActivities from './_components/RecentActivities';
import RecentJobPosts from './_components/RecentJobPosts';
import StatsCards from './_components/StatsCards';
import { getUserStats } from '../../services/applicationService';
import { useAuth } from '../../context/authContext';

const Overview = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await getUserStats();
      if (res.success && res.data?.data) setStats(res.data.data);
      setLoadingStats(false);
    };
    if (auth?.tokens?.accessToken) fetch();
  }, [auth]);

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back, Admin</h1>
          <p className="text-gray-600">Here's what's happening today</p>
        </div>

        <StatsCards stats={stats} loading={loadingStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ApplicationsChart stats={stats} loading={loadingStats} />
          </div>
          <div>
            <RecentActivities />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RecentJobPosts />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Overview;
