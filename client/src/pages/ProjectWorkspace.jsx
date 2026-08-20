import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import socket from '../socket';
import ReactMarkdown from 'react-markdown';
import Layout from '../components/Layout';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const TABS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'chat', label: 'Chat' },
  { key: 'ai', label: 'AI Assistant' },
  { key: 'files', label: 'Files' },
];

function ProjectWorkspace() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [aiCode, setAiCode] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');

  const chatEndRef = useRef(null);

  const loadData = async () => {
    try {
      const [projectRes, tasksRes, filesRes, analyticsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/files/${id}`),
        api.get(`/analytics/${id}`),
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setFiles(filesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load project');
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
    };
    fetchCurrentUser();

    const fetchMessages = async () => {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data);
    };
    fetchMessages();

    socket.connect();
    socket.emit('joinProject', id);

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const handleCreateTask = async (e) => {
  e.preventDefault();
  if (!newTaskTitle.trim()) return;
  try {
    const res = await api.post(`/projects/${id}/tasks`, { title: newTaskTitle });
    setTasks([res.data, ...tasks]);
    setNewTaskTitle('');
    const analyticsRes = await api.get(`/analytics/${id}`);
    setAnalytics(analyticsRes.data);
  } catch (err) {
    setError(err.response?.data?.message || 'Could not create task');
  }
};

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
      const analyticsRes = await api.get(`/analytics/${id}`);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter((t) => t._id !== taskId));
    const analyticsRes = await api.get(`/analytics/${id}`);
    setAnalytics(analyticsRes.data);
  } catch (err) {
    setFileError; // (leave your existing error handling as-is)
    setError(err.response?.data?.message || 'Could not delete task');
  }
};

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/projects/${id}/invite`, { email: inviteEmail });
      setMessage(res.data.message);
      setInviteEmail('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not invite member');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    socket.emit('sendMessage', {
      projectId: id,
      senderId: currentUser._id,
      senderName: currentUser.name,
      text: newMessage,
    });

    setNewMessage('');
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiAnswer('');

    try {
      const res = await api.post('/ai/explain', {
        projectId: id,
        code: aiCode,
        question: aiQuestion,
      });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarizeChat = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');

    try {
      const res = await api.post('/ai/summarize', { projectId: id });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Could not summarize chat');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDebugCode = async () => {
    if (!aiCode.trim()) {
      setAiError('Paste some code first');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');
    try {
      const res = await api.post('/ai/debug', {
        projectId: id,
        code: aiCode,
        errorDescription: aiQuestion || 'Find any bugs in this code',
      });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!aiCode.trim()) {
      setAiError('Paste some code first');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');
    try {
      const res = await api.post('/ai/docs', { projectId: id, code: aiCode });
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI request failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please choose a file first');
      return;
    }

    setUploading(true);
    setFileError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post(`/files/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles([res.data, ...files]);
      setSelectedFile(null);
    } catch (err) {
      setFileError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter((f) => f._id !== fileId));
    } catch (err) {
      setFileError(err.response?.data?.message || 'Could not delete file');
    }
  };

  if (error && !project) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!project) return <p className="text-center mt-10 text-gray-900 dark:text-white">Loading...</p>;

  return (
    <Layout
      user={currentUser}
      title={project.title}
      subtitle={project.description || 'Project workspace'}
    >
      <Link to="/dashboard" className="text-brand-600 text-sm font-medium hover:underline">
        &larr; Back to Dashboard
      </Link>

      {/* Project Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 my-4 transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
        {project.description && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
        )}
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Owner: {project.owner?.name} &middot; Members:{' '}
          {project.members?.map((m) => m.name).join(', ')}
        </p>
      </div>

      {/* Invite + Progress */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Invite a teammate</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="teammate@email.com"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
            >
              Invite
            </button>
          </form>
          {message && <p className="text-green-600 text-xs mt-2">{message}</p>}
        </div>

        {analytics && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all"
                style={{ width: `${analytics.completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{analytics.completionPercent}% complete</span>
              <span>
                {analytics.doneCount} done &middot; {analytics.inProgressCount} in progress &middot;{' '}
                {analytics.todoCount} to do
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4 transition-colors">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Add a task</h2>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Task title"
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
              >
                Add
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{col.label}</h3>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === col.key)
                    .map((task) => (
                      <div
                        key={task._id}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                        {task.assignedTo && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Assigned: {task.assignedTo.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded p-1"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t) => t.status === col.key).length === 0 && (
                    <p className="text-xs text-gray-400 italic">Nothing here yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Project Chat</h3>
          <div className="h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 mb-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 italic">No messages yet — say hello!</p>
            )}
            {messages.map((msg) => (
              <div key={msg._id} className="mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {msg.sender?.name || 'Unknown'}:{' '}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-200">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* AI TAB */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Assistant</h3>
          <form onSubmit={handleAskAI} className="space-y-3 mb-3">
            <textarea
              placeholder="Paste code here (optional)"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={6}
              value={aiCode}
              onChange={(e) => setAiCode(e.target.value)}
            />
            <input
              type="text"
              placeholder="Ask a question about this code, or a general coding question..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition"
              >
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
              <button
                type="button"
                onClick={handleSummarizeChat}
                disabled={aiLoading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
              >
                Summarize Chat
              </button>
              <button
                type="button"
                onClick={handleDebugCode}
                disabled={aiLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition"
              >
                Debug Code
              </button>
              <button
                type="button"
                onClick={handleGenerateDocs}
                disabled={aiLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
              >
                Generate Docs
              </button>
            </div>
          </form>
          {aiError && <p className="text-red-500 text-sm mb-2">{aiError}</p>}
          {aiAnswer && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
              <ReactMarkdown>{aiAnswer}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-colors">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Project Files</h3>
          <form onSubmit={handleFileUpload} className="flex items-center gap-2 mb-3">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-sm text-gray-700 dark:text-gray-300"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {fileError && <p className="text-red-500 text-sm mb-2">{fileError}</p>}
          {files.length === 0 && <p className="text-xs text-gray-400 italic">No files uploaded yet</p>}
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file._id}
                className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div>
                  
                  <a  href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline"
                  >
                    {file.fileName}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded by {file.uploader?.name}</p>
                </div>
                <button
                  onClick={() => handleDeleteFile(file._id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}

export default ProjectWorkspace;