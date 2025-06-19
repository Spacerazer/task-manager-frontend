import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  AppBar, 
  Typography, 
  CssBaseline,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material'
import { 
  Assignment, 
  Folder, 
  Notifications, 
  BarChart,
  AccountCircle,
  Logout
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const drawerWidth = 220;

const menuItems = [
  { text: 'Задачи', icon: <Assignment />, path: '/tasks' },
  { text: 'Проекты', icon: <Folder />, path: '/projects' },
  { text: 'Уведомления', icon: <Notifications />, path: '/notifications' },
  { text: 'Статистика', icon: <BarChart />, path: '/statistics' },
];

function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Боковая панель */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map(item => (
            <ListItem
              button
              component={Link}
              to={item.path}
              key={item.text}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Основная область */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Верхняя панель */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap component="div">
              Менеджер задач
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/notifications"
                sx={{ position: 'relative' }}
              >
                <Badge badgeContent={unreadNotificationsCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle />
                    <Box>
                      <Typography variant="subtitle2">{user?.name || 'Пользователь'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.role || 'Роль не определена'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Выйти
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Контент */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            bgcolor: 'background.default', 
            p: 3,
            mt: '64px' // Высота AppBar
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;