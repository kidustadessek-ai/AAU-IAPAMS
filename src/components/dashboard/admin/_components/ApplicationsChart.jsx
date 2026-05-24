import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { getUserStats } from '../../../../services/applicationService';
import { useAuth } from '../../../../context/authContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ApplicationsChart = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await getUserStats();
      if (res.success && res.data?.data) setStats(res.data.data);
      setLoading(false);
    };
    if (auth?.tokens?.accessToken) fetch();
  }, [auth]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow animate-pulse h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading analytics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  // --- Applications Over Time (Line Chart) ---
  const overTime = stats.applications?.overTime || [];
  const timeLabels = overTime.map(d => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`);
  const timeCounts = overTime.map(d => d.count);

  const lineData = {
    labels: timeLabels.length ? timeLabels : ['No data'],
    datasets: [{
      label: 'Applications',
      data: timeCounts.length ? timeCounts : [0],
      borderColor: '#7B1113',
      backgroundColor: 'rgba(123,17,19,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#7B1113',
      pointRadius: 4,
    }],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Applications Over Last 6 Months', font: { size: 13 } },
    },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  // --- Application Status Breakdown (Doughnut) ---
  const appStats = stats.applications || {};
  const statusLabels = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
  const statusData = [
    appStats.pending || 0,
    appStats.underReview || 0,
    appStats.shortlisted || 0,
    appStats.accepted || 0,
    appStats.rejected || 0,
  ];

  const doughnutData = {
    labels: statusLabels,
    datasets: [{
      data: statusData,
      backgroundColor: ['#C9A84C', '#3b82f6', '#7B1113', '#16a34a', '#ef4444'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      title: { display: true, text: 'Application Status Breakdown', font: { size: 13 } },
    },
  };

  // --- Top Departments (Horizontal Bar) ---
  const byDept = (stats.applications?.byDepartment || []).slice(0, 6);
  const deptLabels = byDept.map(d => d._id?.length > 30 ? d._id.substring(0, 30) + '…' : (d._id || 'Unknown'));
  const deptCounts = byDept.map(d => d.count);

  const barData = {
    labels: deptLabels.length ? deptLabels : ['No data'],
    datasets: [{
      label: 'Applications',
      data: deptCounts.length ? deptCounts : [0],
      backgroundColor: 'rgba(123,17,19,0.75)',
      borderRadius: 4,
    }],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Departments by Applications', font: { size: 13 } },
    },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div className="space-y-4">
      {/* Line Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* Doughnut + Bar side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationsChart;
