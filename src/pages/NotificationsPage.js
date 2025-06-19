import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../services/api';

const notificationTypes = {
  task_assigned: {
    label: 'Назначение задачи',
    icon: <TaskIcon />,
    color: 'primary'
  },
  deadline_approaching: {
    label: 'Приближение дедлайна',
    icon: <WarningIcon />,
    color: 'warning'
  },
  task_completed: {
    label: 'Задача завершена',
    icon: <CheckIcon />,
    color: 'success'
  }
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}`, { read: true });
      loadNotifications();
    } catch (error) {
      console.error('Ошибка обновления уведомления:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Удалить это уведомление?')) {
      try {
        await api.delete(`/notifications/${notificationId}`);
        loadNotifications();
      } catch (error) {
        console.error('Ошибка удаления уведомления:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => 
          api.patch(`/notifications/${n.id}`, { read: true })
        )
      );
      loadNotifications();
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
  };

  const filteredNotifications = activeTab === 0 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Уведомления</Typography>
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} непрочитанных`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Вкладки */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="primary">
                Непрочитанные
              </Badge>
            } 
          />
          <Tab label="Прочитанные" />
        </Tabs>
      </Paper>

      {/* Список уведомлений */}
      {filteredNotifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 0 ? 'Нет непрочитанных уведомлений' : 'Нет прочитанных уведомлений'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0 
              ? 'Все уведомления прочитаны' 
              : 'Прочитанные уведомления будут отображаться здесь'
            }
          </Typography>
        </Paper>
      ) : (
        <List>
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1
                }}
                secondaryAction={
                  <Box>
                    {!notification.read && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Отметить как прочитанное"
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    <Chip
                      icon={notificationTypes[notification.type]?.icon}
                      label={notificationTypes[notification.type]?.label}
                      color={notificationTypes[notification.type]?.color}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(notification.created_at).format('DD.MM.YYYY HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              </ListItem>
              {index < filteredNotifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Кнопка "Отметить все как прочитанные" */}
      {unreadCount > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Chip
            label="Отметить все как прочитанные"
            onClick={handleMarkAllAsRead}
            color="primary"
            variant="outlined"
            clickable
          />
        </Box>
      )}
    </Box>
  );
}

export default NotificationsPage;