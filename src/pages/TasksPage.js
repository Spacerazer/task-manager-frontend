import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../services/api';

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

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    project: ''
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
    loadProjects();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setOpenDialog(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        loadTasks();
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
      }
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      setOpenDialog(false);
      loadTasks();
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignee && (!task.assignee || task.assignee.id !== parseInt(filters.assignee))) return false;
    if (filters.project && task.project_id !== parseInt(filters.project)) return false;
    return true;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Задачи</Typography>
        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={() => setFilters({ status: '', priority: '', assignee: '', project: '' })}
        >
          Сбросить фильтры
        </Button>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="new">Новая</MenuItem>
                <MenuItem value="in_progress">В работе</MenuItem>
                <MenuItem value="completed">Завершена</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Исполнитель</InputLabel>
              <Select
                value={filters.assignee}
                onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              >
                <MenuItem value="">Все</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Проект</InputLabel>
              <Select
                value={filters.project}
                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              >
                <MenuItem value="">Все</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Список задач */}
      <Grid container spacing={2}>
        {filteredTasks.map(task => (
          <Grid item xs={12} md={6} lg={4} key={task.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                    {task.title}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditTask(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {task.description || 'Описание отсутствует'}
                </Typography>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
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

                <Typography variant="body2" color="text.secondary">
                  <strong>Создана:</strong> {dayjs(task.created_at).format('DD.MM.YYYY')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Диалог создания/редактирования задачи */}
      <TaskDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        projects={projects}
      />

      {/* Кнопка добавления */}
      <Tooltip title="Добавить задачу">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateTask}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}

// Компонент диалога для создания/редактирования задачи
function TaskDialog({ open, onClose, onSave, task, users, projects }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new',
    priority: 'medium',
    assignee_id: '',
    project_id: '',
    due_date: ''
  });

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'new',
        priority: task.priority || 'medium',
        assignee_id: task.assignee?.id || '',
        project_id: task.project_id || '',
        due_date: task.due_date || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'new',
        priority: 'medium',
        assignee_id: '',
        project_id: '',
        due_date: ''
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {task ? 'Редактировать задачу' : 'Создать новую задачу'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="new">Новая</MenuItem>
                  <MenuItem value="in_progress">В работе</MenuItem>
                  <MenuItem value="completed">Завершена</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Исполнитель</InputLabel>
                <Select
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                >
                  <MenuItem value="">Не назначен</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Проект</InputLabel>
                <Select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                >
                  <MenuItem value="">Без проекта</MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
            {task ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default TasksPage;