import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  Fab,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../services/api';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setOpenDialog(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setOpenDialog(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await api.delete(`/projects/${projectId}`);
        loadProjects();
      } catch (error) {
        console.error('Ошибка удаления проекта:', error);
      }
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await api.patch(`/projects/${editingProject.id}`, projectData);
      } else {
        await api.post('/projects', projectData);
      }
      setOpenDialog(false);
      loadProjects();
    } catch (error) {
      console.error('Ошибка сохранения проекта:', error);
    }
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter(task => task.project_id === projectId);
  };

  const calculateProgress = (projectId) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getProjectStats = (projectId) => {
    const projectTasks = getProjectTasks(projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    const inProgress = projectTasks.filter(task => task.status === 'in_progress').length;
    const newTasks = projectTasks.filter(task => task.status === 'new').length;

    return { total, completed, inProgress, newTasks };
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Проекты</Typography>
      </Box>

      {/* Список проектов */}
      <Grid container spacing={3}>
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const progress = calculateProgress(project.id);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                      {project.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => setSelectedProject(project)}
                        title="Просмотр задач"
                      >
                        <TaskIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditProject(project)}
                        title="Редактировать"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteProject(project.id)}
                        title="Удалить"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {project.description || 'Описание отсутствует'}
                  </Typography>

                  {/* Прогресс */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Прогресс
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Статистика задач */}
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                      label={`Всего: ${stats.total}`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`Завершено: ${stats.completed}`} 
                      size="small" 
                      color="success"
                    />
                    <Chip 
                      label={`В работе: ${stats.inProgress}`} 
                      size="small" 
                      color="primary"
                    />
                    <Chip 
                      label={`Новые: ${stats.newTasks}`} 
                      size="small" 
                      color="default"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Дедлайн:</strong> {project.due_date ? dayjs(project.due_date).format('DD.MM.YYYY') : 'Не установлен'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Создан:</strong> {dayjs(project.created_at).format('DD.MM.YYYY')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Диалог создания/редактирования проекта */}
      <ProjectDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {/* Диалог просмотра задач проекта */}
      <ProjectTasksDialog
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        tasks={selectedProject ? getProjectTasks(selectedProject.id) : []}
      />

      {/* Кнопка добавления */}
      <Tooltip title="Добавить проект">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateProject}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}

// Компонент диалога для создания/редактирования проекта
function ProjectDialog({ open, onClose, onSave, project }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    due_date: ''
  });

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        due_date: project.due_date || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        due_date: ''
      });
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {project ? 'Редактировать проект' : 'Создать новый проект'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Название проекта"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Описание"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Дедлайн"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">
            {project ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Компонент диалога для просмотра задач проекта
function ProjectTasksDialog({ open, onClose, project, tasks }) {
  const statusLabels = {
    new: 'Новая',
    in_progress: 'В работе',
    completed: 'Завершена'
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };

  const statusColors = {
    new: 'default',
    in_progress: 'primary',
    completed: 'success'
  };

  const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Задачи проекта: {project?.name}
      </DialogTitle>
      <DialogContent>
        {tasks.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" py={4}>
            В этом проекте пока нет задач
          </Typography>
        ) : (
          <Box>
            {tasks.map(task => (
              <Paper key={task.id} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h3">
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {task.description || 'Описание отсутствует'}
                    </Typography>
                    <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                      <Chip
                        label={statusLabels[task.status]}
                        color={statusColors[task.status]}
                        size="small"
                      />
                      <Chip
                        label={priorityLabels[task.priority]}
                        color={priorityColors[task.priority]}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Исполнитель:</strong> {task.assignee?.name || 'Не назначен'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Дедлайн:</strong> {task.due_date ? dayjs(task.due_date).format('DD.MM.YYYY') : 'Не установлен'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProjectsPage;