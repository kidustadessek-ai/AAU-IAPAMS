// components/layout/Sidebar.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Sidebar = ({ navLinks }) => {
  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-64 bg-white shadow-md h-[calc(100vh-64px)] sticky top-16"
    >
      <nav className="p-4 space-y-1">
        {navLinks.map((link) => (
          <motion.div
            key={link.path}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link
              to={link.path}
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-aau-primary transition-colors"
            >
              <span className="mr-3 text-aau-primary">{link.icon}</span>
              {link.name}
            </Link>
          </motion.div>
        ))}
      </nav>
    </motion.aside>
  );
};