import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [interestsInput, setInterestsInput] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Get the user first — this is the only thing the page absolutely needs to render at all
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      setInterestsInput((userRes.data.interests || []).join(', '));

      // Fire the rest independently — each fills in as soon as it's ready, without blocking the others
      api.get('/projects')
        .then((res) => setProjects(res.data))
        .catch(() => setError('Could not load projects'));

      api.get('/invitations/my')
        .then((res) => setInvitations(res.data))
        .catch(() => setError('Could not load invitations'));

      api.get('/recommendations')
        .then((res) => setRecommendations(res.data.resources || []))
        .catch(() => setError('Could not load recommendations'));
    } catch (err) {
      setError('Session expired, please log in again');
      localStorage.removeItem('token');
      setTimeout(() => navigate('/login'), 1500);
    }
  };
  fetchData();
}, [navigate]);
  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    try {
      const res = await api.post('/projects', {
        title: newTitle,
        description: newDescription,
      });

      setProjects([res.data, ...projects]);
      setNewTitle('');
      setNewDescription('');
      setShowCreateForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not create project'
      );
    }
  };

  const handleDeleteProject = async (
    e,
    projectId,
    projectTitle
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${projectTitle}"? This will permanently remove all its tasks, chat, and files. This can't be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);

      setProjects(
        projects.filter((project) => project._id !== projectId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not delete project'
      );
    }
  };

  const handleRespondInvitation = async (
    invitationId,
    action
  ) => {
    try {
      await api.patch(
        `/invitations/${invitationId}/respond`,
        { action }
      );

      setInvitations(
        invitations.filter(
          (invitation) => invitation._id !== invitationId
        )
      );

      if (action === 'accept') {
        const res = await api.get('/projects');
        setProjects(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not respond to invitation'
      );
    }
  };

  const handleUpdateInterests = async (e) => {
    e.preventDefault();

    const interestsArray = interestsInput
      .split(',')
      .map((interest) => interest.trim().toLowerCase())
      .filter((interest) => interest);

    try {
      await api.patch('/recommendations/interests', {
        interests: interestsArray,
      });

      const recRes = await api.get('/recommendations');

      setRecommendations(recRes.data.resources || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not update interests'
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 dark:bg-gray-950 dark:text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <Layout
      user={user}
      title={`Welcome back, ${user.name.split(' ')[0]}`}
      subtitle="Here's what's happening across your projects."
    >
     {/* Hero banner */}
<div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-56">
  <img
    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=60"
    alt=""
    className="absolute inset-0 w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/80 to-brand-900/60" />

  <div className="relative h-full flex flex-col justify-center px-8">
    <p className="text-white text-sm font-semibold mb-1 drop-shadow-md">
      DevBridge
    </p>

    <h2 className="text-white text-2xl md:text-3xl font-bold max-w-lg leading-tight drop-shadow-md">
      Build, chat, and ship with your team — and AI — in one place.
    </h2>
  </div>
</div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Projects
          </p>

          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {projects.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Pending Invites
          </p>

          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {invitations.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 col-span-2 sm:col-span-1 transition-colors">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Resources for you
          </p>

          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {recommendations.length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4">
          {error}
        </p>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 transition-colors">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Pending Invitations
          </h2>

          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation._id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {invitation.project?.title}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Invited by {invitation.invitedBy?.name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleRespondInvitation(
                        invitation._id,
                        'accept'
                      )
                    }
                    className="bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleRespondInvitation(
                        invitation._id,
                        'decline'
                      )
                    }
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Your Projects
          </h2>

          <button
            onClick={() =>
              setShowCreateForm(!showCreateForm)
            }
            className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 hover:scale-[1.03] active:scale-[0.98] transition"
          >
            + New Project
          </button>
        </div>

        {/* Create project form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateProject}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4 space-y-3 animate-fade-in"
          >
            <input
              type="text"
              placeholder="Project title"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={newTitle}
              onChange={(e) =>
                setNewTitle(e.target.value)
              }
              required
              autoFocus
            />

            <textarea
              placeholder="Short description (optional)"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={newDescription}
              onChange={(e) =>
                setNewDescription(e.target.value)
              }
            />

            <button
              type="submit"
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
            >
              Create Project
            </button>
          </form>
        )}

        {/* Project list */}
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-400 text-sm">
            No projects yet — create your first one above.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <button
                  onClick={(e) =>
                    handleDeleteProject(
                      e,
                      project._id,
                      project.title
                    )
                  }
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                  title="Delete project"
                >
                  ✕
                </button>

                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-lg flex items-center justify-center font-bold mb-3">
                  {project.title.charAt(0).toUpperCase()}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition pr-6">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-colors">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Learning Recommendations
        </h2>

        <form
          onSubmit={handleUpdateInterests}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            placeholder="Your interests, comma-separated (e.g. react, mongodb, security)"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={interestsInput}
            onChange={(e) =>
              setInterestsInput(e.target.value)
            }
          />

          <button
            type="submit"
            className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
          >
            Save
          </button>
        </form>

        {recommendations.length === 0 ? (
          <p className="text-sm text-gray-400">
            No recommendations yet — add some interests above.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recommendations.map((resource) => (
              <a
                key={resource._id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:border-brand-200 dark:hover:border-brand-700 transition"
              >
                <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                  {resource.title}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;