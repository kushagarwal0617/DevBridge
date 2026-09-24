import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

const handleGoogleResponse = async (response) => {
  setError('');
  setGoogleLoading(true);

  try {
    const res = await api.post('/auth/google', {
      credential: response.credential,
    });

    localStorage.setItem('token', res.data.token);
    navigate('/dashboard');
  } catch (err) {
    setError('Google sign-in failed');
    setGoogleLoading(false);
  }
};

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: 360,
        text: 'continue_with',
      });
    }
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Floating gradient blobs behind the card */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-pink-500 rounded-full blur-3xl opacity-20" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="text-xl font-bold text-white">DevBridge</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center">Welcome back</h2>
        <p className="text-gray-300 mb-6 text-sm text-center">Log in to continue to your projects</p>

        <div ref={googleButtonRef} className="mb-4 flex justify-center" />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {error && (
          <p className="text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-200 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
   {googleLoading && (
  <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-xl px-6 py-4 flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-gray-700 dark:text-gray-200 text-sm">Signing you in...</span>
    </div>
  </div>
)}
    </div>
  );
}

export default Login;