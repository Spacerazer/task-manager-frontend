import React from 'react'
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, CssBaseline} from '@mui/material'
import { Assignment, Folder, Notifications, BarChart } from '@mui/icons-material'
import { Link } from 'react-router-dom'

const drawerWidth = 220;

const menuItems = [
  { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
  { text: 'Projects', icon: <Folder />, path: '/projects' },
  { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
  { text: 'Statistics', icon: <BarChart />, path: '/statistics' },
];

function MainLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Task Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
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
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box 
      component="main" 
      sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, ml: drawerWidth }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;