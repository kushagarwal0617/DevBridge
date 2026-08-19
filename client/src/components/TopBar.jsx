import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

function TopBar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </div>
  );
}

export default TopBar;