import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  NewReleases as NewIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../services/api';

function StatisticsPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    newTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    averageCompletionTime: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users')
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
      
      calculateStats(tasksRes.data, projectsRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const calculateStats = (tasksData, projectsData) => {
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasksData.filter(task => task.status === 'in_progress').length;
    const newTasks = tasksData.filter(task => task.status === 'new').length;
    
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(project => {
      const projectTasks = tasksData.filter(task => task.project_id === project.id);
      return projectTasks.some(task => task.status !== 'completed');
    }).length;

    // Расчет среднего времени выполнения (упрощенный)
    const completedTasksWithDates = tasksData.filter(task => 
      task.status === 'completed' && task.created_at && task.updated_at
    );
    
    let totalDays = 0;
    completedTasksWithDates.forEach(task => {
      const created = dayjs(task.created_at);
      const updated = dayjs(task.updated_at || task.created_at);
      totalDays += updated.diff(created, 'day');
    });
    
    const averageCompletionTime = completedTasksWithDates.length > 0 
      ? Math.round(totalDays / completedTasksWithDates.length) 
      : 0;

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      newTasks,
      totalProjects,
      activeProjects,
      averageCompletionTime
    });
  };

  const getTasksByPriority = () => {
    const priorityStats = { low: 0, medium: 0, high: 0 };
    tasks.forEach(task => {
      priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
    });
    return priorityStats;
  };

  const getTasksByAssignee = () => {
    const assigneeStats = {};
    tasks.forEach(task => {
      const assigneeName = task.assignee?.name || 'Не назначен';
      assigneeStats[assigneeName] = (assigneeStats[assigneeName] || 0) + 1;
    });
    return Object.entries(assigneeStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getProjectProgress = () => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.project_id === project.id);
      const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
      
      return {
        ...project,
        totalTasks: projectTasks.length,
        completedTasks,
        progress
      };
    }).sort((a, b) => b.progress - a.progress);
  };

  const priorityStats = getTasksByPriority();
  const assigneeStats = getTasksByAssignee();
  const projectProgress = getProjectProgress();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>

      {/* Основные метрики */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TaskIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего задач
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CompletedIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.completedTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InProgressIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.inProgressTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    В работе
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NewIcon color="default" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.newTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Новые
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Дополнительная статистика */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика проектов
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Всего проектов</Typography>
                <Typography variant="h6">{stats.totalProjects}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">Активных проектов</Typography>
                <Typography variant="h6">{stats.activeProjects}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Среднее время выполнения</Typography>
                <Typography variant="h6">{stats.averageCompletionTime} дней</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Задачи по приоритету
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Высокий</Typography>
                  <Typography variant="body2">{priorityStats.high}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(priorityStats.high / stats.totalTasks) * 100} 
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Средний</Typography>
                  <Typography variant="body2">{priorityStats.medium}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(priorityStats.medium / stats.totalTasks) * 100} 
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Низкий</Typography>
                  <Typography variant="body2">{priorityStats.low}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(priorityStats.low / stats.totalTasks) * 100} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Прогресс проектов */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Прогресс проектов
          </Typography>
          {projectProgress.map(project => (
            <Box key={project.id} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.completedTasks}/{project.totalTasks} задач
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress} 
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {project.progress}%
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Загрузка исполнителей */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Загрузка исполнителей
          </Typography>
          <List>
            {assigneeStats.map((assignee, index) => (
              <React.Fragment key={assignee.name}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={assignee.name}
                    secondary={`${assignee.count} задач`}
                  />
                  <Chip 
                    label={assignee.count} 
                    color="primary" 
                    variant="outlined"
                  />
                </ListItem>
                {index < assigneeStats.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default StatisticsPage;