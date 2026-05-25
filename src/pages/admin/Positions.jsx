// import { useState } from 'react';
// import toast from 'react-hot-toast';

// const Positions = () => {
//   const [positions, setPositions] = useState([
//     {
//       id: 1,
//       title: 'Department Head - Computer Science',
//       description: 'Leading the Computer Science department',
//       deadline: '2026-03-01',
//       status: 'Open'
//     }
//   ]);

//   const [newPosition, setNewPosition] = useState({
//     title: '',
//     description: '',
//     deadline: '',
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setPositions([...positions, { ...newPosition, id: Date.now(), status: 'Open' }]);
//     setNewPosition({ title: '', description: '', deadline: '' });
//     toast.success('Position added successfully!');
//   };

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-900">Manage Positions</h2>
      
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Position Title</label>
//             <input
//               type="text"
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               value={newPosition.title}
//               onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Description</label>
//             <textarea
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               rows="3"
//               value={newPosition.description}
//               onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Deadline</label>
//             <input
//               type="date"
//               required
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//               value={newPosition.deadline}
//               onChange={(e) => setNewPosition({ ...newPosition, deadline: e.target.value })}
//             />
//           </div>
          
//           <button
//             type="submit"
//             className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Add Position
//           </button>
//         </div>
//       </form>

//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <ul className="divide-y divide-gray-200">
//           {positions.map((position) => (
//             <li key={position.id} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900">{position.title}</h3>
//                   <p className="text-sm text-gray-500">{position.description}</p>
//                   <p className="text-sm text-gray-500">Deadline: {position.deadline}</p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-sm ${
//                   position.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                 }`}>
//                   {position.status}
//                 </span>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Positions;
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';

const Positions = () => {
  const [positions, setPositions] = useState([
    {
      id: 1,
      title: 'Department Head - Computer Science',
      description: 'Leading the Computer Science department',
      department: 'Computer Science',
      positionType: 'Full-Time',
      requirements: ['PhD in Computer Science', '5+ years experience'],
      deadline: '2026-03-01',
      status: 'open',
      createdBy: 'placeholderUserId',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [newPosition, setNewPosition] = useState({
    title: '',
    description: '',
    department: '',
    positionType: '',
    requirements: '',
    deadline: '',
    status: 'open',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const requirementsArray = newPosition.requirements
      .split(',')
      .map((req) => req.trim())
      .filter((req) => req !== '');

    const newEntry = {
      ...newPosition,
      id: Date.now(),
      requirements: requirementsArray,
      createdBy: 'placeholderUserId', // Replace with actual user ID
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPositions([...positions, newEntry]);
    setNewPosition({
      title: '',
      description: '',
      department: '',
      positionType: '',
      requirements: '',
      deadline: '',
      status: 'open',
    });

    toast.success('Position added successfully!');
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Department', 'Type', 'Deadline', 'Status'];
    const rows = positions.map(p => [p.title, p.department, p.positionType, p.deadline, p.status]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `positions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const paginatedPositions = positions.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6" style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 className="text-2xl font-bold text-gray-900">Manage Positions</h2>
        <button
          onClick={exportToCSV}
          disabled={positions.length === 0}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: positions.length === 0 ? '#f8f7f5' : '#7B1113',
            color: positions.length === 0 ? '#94a3b8' : '#fff',
            fontSize: '0.85rem', cursor: positions.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        {['title', 'description', 'department', 'positionType', 'requirements', 'deadline'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field === 'requirements' ? 'Requirements (comma-separated)' : field.replace(/([A-Z])/g, ' $1')}
            </label>
            {field === 'description' ? (
              <textarea
                required
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={newPosition.description}
                onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
              />
            ) : (
              <input
                required
                type={field === 'deadline' ? 'date' : 'text'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={newPosition[field]}
                onChange={(e) => setNewPosition({ ...newPosition, [field]: e.target.value })}
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={newPosition.status}
            onChange={(e) => setNewPosition({ ...newPosition, status: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        </div>

        <button
          type="submit"
           className="px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700"
        >
          Add Position
        </button>
      </form>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {paginatedPositions.map((position) => (
            <li key={position.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{position.title}</h3>
                  <p className="text-sm text-gray-500">{position.description}</p>
                  <p className="text-sm text-gray-500">Department: {position.department}</p>
                  <p className="text-sm text-gray-500">Type: {position.positionType}</p>
                  <p className="text-sm text-gray-500">Requirements: {position.requirements.join(', ')}</p>
                  <p className="text-sm text-gray-500">Deadline: {position.deadline}</p>
                  <p className="text-sm text-gray-400 text-xs">Created At: {new Date(position.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  position.status === 'open' ? 'bg-green-100 text-green-800' :
                  position.status === 'closed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {position.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {positions.length > limit && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid #e5e7eb',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fafafa', flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, positions.length)} of {positions.length}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db',
                  background: page === 1 ? '#f3f4f6' : '#fff',
                  color: page === 1 ? '#9ca3af' : '#374151',
                  fontSize: '0.85rem', cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#6b7280' }}>
                {page} / {Math.ceil(positions.length / limit)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(positions.length / limit)}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db',
                  background: page >= Math.ceil(positions.length / limit) ? '#f3f4f6' : '#fff',
                  color: page >= Math.ceil(positions.length / limit) ? '#9ca3af' : '#374151',
                  fontSize: '0.85rem', cursor: page >= Math.ceil(positions.length / limit) ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Positions;
