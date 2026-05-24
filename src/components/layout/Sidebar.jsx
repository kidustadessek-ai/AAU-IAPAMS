import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

export const Sidebar = ({ navLinks }) => {
  const location = useLocation();

  return (
    <Box sx={{
      height: '100%',
      bgcolor: '#1a0a0b',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Section label */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="overline" sx={{
          fontSize: '0.6rem', letterSpacing: 2,
          color: 'rgba(255,255,255,0.25)', fontWeight: 600,
        }}>
          Navigation
        </Typography>
      </Box>

      {/* Nav links */}
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {navLinks.map((link, i) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={link.path}
                style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.25, borderRadius: 1.5,
                  bgcolor: isActive ? 'rgba(123,17,19,0.6)' : 'transparent',
                  borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(123,17,19,0.6)' : 'rgba(255,255,255,0.05)',
                  },
                }}>
                  <Box sx={{
                    fontSize: '1rem',
                    color: isActive ? '#C9A84C' : 'rgba(255,255,255,0.45)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.15s',
                  }}>
                    {link.icon}
                  </Box>
                  <Typography variant="body2" sx={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.85rem',
                    letterSpacing: 0.1,
                  }}>
                    {link.name}
                  </Typography>
                </Box>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <Box sx={{ px: 3, py: 2.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C9A84C' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>
            Addis Ababa University
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
