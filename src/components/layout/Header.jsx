import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Divider, Box, Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FiUser, FiEdit2, FiKey, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { SchoolOutlined } from '@mui/icons-material';

const ROLE_LABELS = { admin: 'Administrator', evaluator: 'Evaluator', staff: 'Academic Staff' };

export const Header = ({ title, user, profilePhoto, onLogout, onEditProfile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#7B1113',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>

        {/* Logo + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '8px',
            bgcolor: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <SchoolOutlined sx={{ fontSize: 18, color: '#C9A84C' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.2 }}>
              AAU · IAPAMS
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1, fontSize: '0.65rem' }}>
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Gold accent divider */}
        <Box sx={{ width: 1, height: 28, bgcolor: 'rgba(201,168,76,0.3)', mx: 2, display: { xs: 'none', md: 'block' } }} />

        {/* User menu */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
            px: 1.5, py: 0.75, borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            transition: 'background 0.2s',
          }}
        >
          <Avatar
            src={user?.profilePhoto || profilePhoto}
            sx={{ width: 34, height: 34, bgcolor: '#5a0d0f', border: '2px solid rgba(201,168,76,0.4)', fontSize: '0.85rem' }}
          >
            {(user?.fullName || user?.username || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.fullName || user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </Typography>
          </Box>
          <FiChevronDown size={14} color="rgba(255,255,255,0.5)" />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1, minWidth: 220, borderRadius: 2,
              border: '1px solid #f1f5f9',
              '& .MuiMenuItem-root': { px: 2, py: 1.2, gap: 1.5, fontSize: '0.875rem' },
            },
          }}
        >
          {/* Profile header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar src={user?.profilePhoto || profilePhoto}
                sx={{ width: 40, height: 40, bgcolor: '#7B1113', fontSize: '0.9rem' }}>
                {(user?.fullName || user?.username || '?').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.fullName || user?.username}</Typography>
                <Chip label={ROLE_LABELS[user?.role] || user?.role} size="small"
                  sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#fdf0f0', color: '#7B1113', mt: 0.3 }} />
              </Box>
            </Box>
          </Box>

          <MenuItem onClick={() => { onEditProfile(); setAnchorEl(null); }}>
            <FiEdit2 size={15} color="#7B1113" /> Edit Profile
          </MenuItem>
          <MenuItem component={Link} to="/change-password" onClick={() => setAnchorEl(null)}>
            <FiKey size={15} color="#7B1113" /> Change Password
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { onLogout(); setAnchorEl(null); }} sx={{ color: '#ef4444' }}>
            <FiLogOut size={15} /> Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
