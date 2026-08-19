import Sidebar from './Sidebar';
import TopBar from './TopBar';

function Layout({ user, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0">
        <TopBar title={title} subtitle={subtitle} />
        <div className="px-6 md:px-8 py-8">{children}</div>
      </div>
    </div>
  );
}

export default Layout;