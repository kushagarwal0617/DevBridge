import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-12 transition-colors">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              DevBridge
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            AI-powered collaboration platform for student developer teams.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Product
          </h4>

          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/profile"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Resources
          </h4>

          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/kushagarwal0617/DevBridge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                GitHub Repository
              </a>
            </li>

            <li>
              <a
                href="https://github.com/kushagarwal0617/DevBridge#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                Documentation
              </a>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Connect
          </h4>

          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/kushagarwal0617"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                GitHub Profile
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-6 md:px-8 py-4">
        <p className="text-xs text-gray-400 text-center">
          © {year} DevBridge — Built as a mini-project at Pranveer Singh Institute of Technology.
        </p>
      </div>
    </footer>
  );
}

export default Footer;