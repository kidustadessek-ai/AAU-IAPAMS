import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Avatar,
  Menu, MenuItem, Divider, Box, Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FiEdit2, FiKey, FiLogOut, FiChevronDown } from 'react-icons/fi';

const ROLE_LABELS = { admin: 'Administrator', evaluator: 'Evaluator', staff: 'Academic Staff' };
const ROLE_COLORS = {
  admin:     { bg: '#fdf0f0', color: '#7B1113' },
  evaluator: { bg: '#eff6ff', color: '#1e40af' },
  staff:     { bg: '#f0fdf4', color: '#15803d' },
};

const SIDEBAR_W = 256; // must match layout.jsx w-64

export const Header = ({ title, user, profilePhoto, onLogout, onEditProfile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const roleColor = ROLE_COLORS[user?.role] || { bg: '#f1f5f9', color: '#475569' };
  const initials = (user?.fullName || user?.username || '?').charAt(0).toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        borderBottom: '2px solid #7B1113',
        zIndex: 1100,
        left: SIDEBAR_W,
        width: `calc(100% - ${SIDEBAR_W}px)`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: '56px !important',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left — Page title with maroon accent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 3, height: 20, bgcolor: '#7B1113', borderRadius: 4 }} />
          <Box>
            <Typography sx={{
              fontSize: '0.95rem', fontWeight: 700,
              color: '#1a1a2e', lineHeight: 1,
            }}>
              {title}
            </Typography>
            <Typography sx={{
              fontSize: '0.68rem', color: '#94a3b8',
              fontWeight: 400, lineHeight: 1.4, mt: 0.2,
            }}>
              Addis Ababa University · IAPAMS
            </Typography>
          </Box>
        </Box>

        {/* Right — User profile trigger */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.2,
            cursor: 'pointer', px: 1.5, py: 0.6,
            borderRadius: 2, border: '1px solid #ede9e9',
            bgcolor: open ? '#fdf8f8' : '#fff',
            '&:hover': { bgcolor: '#fdf8f8', borderColor: '#d4c8c8' },
            transition: 'all 0.15s ease',
          }}
        >
          <Avatar
            src={user?.profilePhoto || profilePhoto}
            sx={{
              width: 30, height: 30,
              bgcolor: '#7B1113',
              fontSize: '0.75rem', fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.2 }}>
              {user?.fullName || user?.username}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1 }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </Typography>
          </Box>

          <FiChevronDown
            size={12}
            color="#94a3b8"
            style={{
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Box>

        {/* Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 0.5, minWidth: 220, borderRadius: 2,
              border: '1px solid #ede9e9',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            },
          }}
        >
          {/* User info */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: '#fdf8f8', borderBottom: '1px solid #f0eded' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={user?.profilePhoto || profilePhoto}
                sx={{ width: 38, height: 38, bgcolor: '#7B1113', fontSize: '0.9rem', fontWeight: 700 }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>
                  {user?.fullName || user?.username}
                </Typography>
                <Chip
                  label={ROLE_LABELS[user?.role] || user?.role}
                  size="small"
                  sx={{
                    mt: 0.4, height: 17, fontSize: '0.58rem',
                    bgcolor: roleColor.bg, color: roleColor.color,
                    fontWeight: 600, letterSpacing: 0.2,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ py: 0.5 }}>
            <MenuItem
              onClick={() => { onEditProfile(); setAnchorEl(null); }}
              sx={{ px: 2, py: 1, gap: 1.5, fontSize: '0.825rem', color: '#374151' }}
            >
              <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#fdf0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiEdit2 size={12} color="#7B1113" />
              </Box>
              Edit Profile
            </MenuItem>

            <MenuItem
              component={Link}
              to="/change-password"
              onClick={() => setAnchorEl(null)}
              sx={{ px: 2, py: 1, gap: 1.5, fontSize: '0.825rem', color: '#374151' }}
            >
              <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiKey size={12} color="#1e40af" />
              </Box>
              Change Password
            </MenuItem>
          </Box>

          <Divider sx={{ borderColor: '#f0eded' }} />

          <Box sx={{ py: 0.5 }}>
            <MenuItem
              onClick={() => { onLogout(); setAnchorEl(null); }}
              sx={{ px: 2, py: 1, gap: 1.5, fontSize: '0.825rem', color: '#ef4444' }}
            >
              <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiLogOut size={12} color="#ef4444" />
              </Box>
              Sign Out
            </MenuItem>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
