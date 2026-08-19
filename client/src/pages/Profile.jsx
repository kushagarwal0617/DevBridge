import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        setName(res.data.name);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setError('');
    try {
      const res = await api.patch('/auth/profile', { name });
      setUser(res.data);
      setProfileMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setError('');
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      setPasswordMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password');
    }
  };

  if (!user) return null;

  return (
    <Layout user={user} title="Your Profile" subtitle="Manage your account details">
      {error && (
        <p className="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2 mb-4 text-sm">
          {error}
        </p>
      )}

      {/* Avatar + basic info card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 flex items-center gap-4 transition-colors">
        <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 font-medium">
            {user.role}
          </span>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 transition-colors">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Edit Name</h2>
        <form onSubmit={handleUpdateName} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          <button
            type="submit"
            className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
          >
            Save
          </button>
        </form>
        {profileMessage && <p className="text-green-600 dark:text-green-400 text-sm mt-2">{profileMessage}</p>}
      </div>

      {/* Change password — hidden entirely for Google-only accounts */}
      {user.hasPassword && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
            >
              Update Password
            </button>
          </form>
          {passwordMessage && <p className="text-green-600 dark:text-green-400 text-sm mt-2">{passwordMessage}</p>}
        </div>
      )}

      {!user.hasPassword && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-400">
          This account signed in with Google — no password to manage.
        </div>
      )}
    </Layout>
  );
}

export default Profile;