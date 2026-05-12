import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserGroupIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`);
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally { setLoading(false); }
  };

  const updateUser = async (id, data) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`, data);
      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (error) { toast.error('Update failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) { toast.error('Delete failed'); }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    hod: 'bg-blue-100 text-blue-800',
    faculty: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800',
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{u.name?.charAt(0)}</div>
                      <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    {editingUser === u._id ? (
                      <select defaultValue={u.role} onChange={(e) => updateUser(u._id, { role: e.target.value, department: u.department })}
                        className="px-2 py-1 border rounded text-sm dark:bg-gray-700" onBlur={() => setEditingUser(null)}>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="hod">HOD</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${roleColors[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.department || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingUser(u._id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><PencilIcon className="w-4 h-4 text-blue-500" /></button>
                      <button onClick={() => deleteUser(u._id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
