import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/16/solid';

const StatsCards = ({ stats, loading }) => {
  const d = stats;
  const cards = [
    { title: 'Open Positions',     value: loading ? '—' : (d?.positions?.open ?? 0) },
    { title: 'Total Applications', value: loading ? '—' : (d?.applications?.total ?? 0) },
    { title: 'Shortlisted',        value: loading ? '—' : (d?.applications?.shortlisted ?? 0) },
    { title: 'Active Evaluators',  value: loading ? '—' : (d?.users?.byRole?.evaluator ?? 0) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
