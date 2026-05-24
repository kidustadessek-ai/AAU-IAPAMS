import React, { useState, useEffect } from 'react';
import { 
  Search, FilterList, Grading, People, Checklist, 
  BarChart, AssignmentInd, Score, DoneAll, Pending
} from '@mui/icons-material';
import { useAuth } from '../../../context/authContext';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

const EvaluationManagement = () => {
  const { auth } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEvaluations();
  }, [auth]);

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/applications', {
        headers: { Authorization: `Bearer ${auth?.tokens?.accessToken}` }
      });
      const apps = res.data?.data || [];
      setEvaluations(apps.map(app => ({
        id: app._id,
        applicant: app.applicant?.fullName || app.applicant?.username || 'Unknown',
        position: app.position?.title || 'Unknown Position',
        evaluators: app.evaluations?.map(e => e.evaluator?.fullName || 'Unknown') || [],
        criteria: [],
        status: app.evaluations?.length === 0 ? 'Pending' : 
                app.status === 'shortlisted' ? 'Completed' : 'In Progress',
        overallScore: Math.round(app.averageScore * 10) || 0,
        deadline: app.position?.deadline ? new Date(app.position.deadline).toLocaleDateString() : 'N/A'
      })));
    } catch (error) {
      toast.error('Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];

  const handleAssignEvaluator = (id) => {
    // Implementation for assigning evaluators
    console.log(`Assign evaluator to application ${id}`);
  };

  const handleViewDetails = (id) => {
    // Implementation for viewing evaluation details
    console.log(`View details for evaluation ${id}`);
  };

  const filteredEvaluations = evaluations.filter(evalu => {
    return (
      (filters.status === 'all' || evalu.status === filters.status) &&
      (filters.search === '' || 
       evalu.applicant.toLowerCase().includes(filters.search.toLowerCase()) ||
       evalu.position.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Evaluation Management</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search evaluations..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FilterList className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              {statusOptions.map(option => (
                <option key={option} value={option === 'All' ? 'all' : option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Evaluations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading evaluations...</div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No evaluations found matching your criteria
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluators</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evalu) => (
                <tr key={eval.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{evalu.applicant}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{evalu.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {evalu.evaluators.map((evaluator, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {evaluator}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${evalu.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        evalu.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'}`}>
                      {evalu.status === 'Pending' ? <Pending className="mr-1" fontSize="small" /> :
                       evalu.status === 'In Progress' ? <Grading className="mr-1" fontSize="small" /> :
                       <DoneAll className="mr-1" fontSize="small" />}
                      {evalu.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Score className="mr-1 text-gray-600" />
                      <span className={`font-medium ${
                        evalu.overallScore >= 90 ? 'text-green-600' :
                        evalu.overallScore >= 75 ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {evalu.overallScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evalu.deadline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleAssignEvaluator(evalu.id)}
                        title="Assign Evaluator"
                      >
                        <AssignmentInd />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleViewDetails(evalu.id)}
                        title="View Details"
                      >
                        <Checklist />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="Evaluation Report"
                      >
                        <BarChart />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
        
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEvaluations.length}</span> of{' '}
            <span className="font-medium">{evaluations.length}</span> evaluations
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationManagement;
