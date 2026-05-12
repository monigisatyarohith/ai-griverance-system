import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ClockIcon, UserIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  escalated: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-800',
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchComplaint(); }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/complaints?limit=100`);
      const found = res.data.data.find(c => c._id === id);
      if (found) setComplaint(found);
    } catch (error) {
      toast.error('Failed to load complaint');
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/complaints/${id}/status`, { status: newStatus, remarks });
      toast.success('Status updated');
      fetchComplaint();
      setRemarks(''); setNewStatus('');
    } catch (error) {
      toast.error('Failed to update');
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!complaint) return <div className="text-center py-20"><ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto" /><p className="text-gray-500 mt-4">Complaint not found</p></div>;

  const canUpdate = ['faculty', 'hod', 'admin'].includes(user?.role);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700"><ArrowLeftIcon className="w-5 h-5 mr-2" />Back</button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6">
          <h1 className="text-2xl font-bold text-white">{complaint.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[complaint.status]}`}>{complaint.status.replace('_', ' ')}</span>
            <span className="text-white/80 text-sm capitalize">{complaint.category} • {complaint.priority}</span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" />{complaint.student?.name || 'Unknown'}</div>
            <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4" />{new Date(complaint.createdAt).toLocaleString()}</div>
            {complaint.assignedTo && <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" />Assigned: {complaint.assignedTo.name}</div>}
          </div>
          <div><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p></div>
          {complaint.resolution?.text && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200"><div className="flex items-center gap-2 mb-2"><CheckCircleIcon className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-green-800">Resolution</h3></div><p className="text-green-700">{complaint.resolution.text}</p></div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Timeline</h3>
        <div className="space-y-4">
          {complaint.timeline?.map((entry, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full ${entry.status === 'resolved' ? 'bg-green-500' : entry.status === 'escalated' ? 'bg-red-500' : 'bg-blue-500'}`}></div>{i < complaint.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1"></div>}</div>
              <div className="pb-4"><p className="font-medium text-sm capitalize">{entry.status?.replace('_', ' ')}</p><p className="text-sm text-gray-500">{entry.message}</p><p className="text-xs text-gray-400 mt-1">{new Date(entry.timestamp).toLocaleString()}</p></div>
            </div>
          ))}
        </div>
      </div>

      {canUpdate && !['resolved', 'rejected'].includes(complaint.status) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Update Status</h3>
          <div className="space-y-4">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <option value="">Select status</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Add remarks..." className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
            <button onClick={handleStatusUpdate} disabled={!newStatus || updating} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50">{updating ? 'Updating...' : 'Update'}</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ComplaintDetail;
