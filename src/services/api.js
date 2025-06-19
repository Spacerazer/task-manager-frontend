import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Простые моки для демонстрации (заменяют MSW)
const mockData = {
    users: [
        { id: 1, name: 'admin', role: 'admin' },
        { id: 2, name: 'Иван Петров', role: 'manager' },
        { id: 3, name: 'Мария Сидорова', role: 'executor' },
        { id: 4, name: 'Петр Иванов', role: 'executor' }
    ],
    tasks: [
        {
            id: 1,
            title: 'Доработать интерфейс',
            description: 'Исправить баг с кнопкой',
            status: 'in_progress',
            priority: 'high',
            due_date: '2024-12-31',
            assignee: {id: 2, name: 'Иван Петров'},
            project_id: 1,
            created_at: '2024-06-20T10:00:00Z'
        },
        {
            id: 2,
            title: 'Написать документацию',
            description: 'Создать техническую документацию',
            status: 'new',
            priority: 'medium',
            due_date: '2024-11-15',
            assignee: null,
            project_id: 1,
            created_at: '2024-06-21T22:00:00Z'
        },
        {
            id: 3,
            title: 'Тестирование системы',
            description: 'Провести полное тестирование',
            status: 'completed',
            priority: 'high',
            due_date: '2024-10-30',
            assignee: {id: 3, name: 'Мария Сидорова'},
            project_id: 2,
            created_at: '2024-06-15T14:00:00Z'
        }
    ],
    projects: [
        {
            id: 1,
            name: 'Веб-приложение',
            description: 'Разработка веб-приложения для управления задачами',
            due_date: '2024-12-31',
            progress: 65,
            created_at: '2024-06-01T10:00:00Z'
        },
        {
            id: 2,
            name: 'Мобильное приложение',
            description: 'Создание мобильной версии',
            due_date: '2025-02-28',
            progress: 30,
            created_at: '2024-07-01T10:00:00Z'
        }
    ],
    notifications: [
        {
            id: 1,
            title: 'Новая задача',
            message: 'Вам назначена новая задача "Доработать интерфейс"',
            type: 'task_assigned',
            read: false,
            created_at: '2024-06-20T10:00:00Z'
        },
        {
            id: 2,
            title: 'Дедлайн приближается',
            message: 'Задача "Написать документацию" должна быть завершена через 3 дня',
            type: 'deadline_approaching',
            read: false,
            created_at: '2024-06-19T15:30:00Z'
        },
        {
            id: 3,
            title: 'Задача завершена',
            message: 'Задача "Тестирование системы" была успешно завершена',
            type: 'task_completed',
            read: true,
            created_at: '2024-06-18T09:15:00Z'
        }
    ]
};

// Перехватываем запросы и возвращаем мок данные
api.interceptors.response.use(
    response => response,
    error => {
        // Если запрос не прошел, используем моки
        const { config } = error;
        
        if (config.url.includes('/auth/login')) {
            const { login, password } = JSON.parse(config.data);
            if (login === 'admin' && password === 'admin') {
                return Promise.resolve({
                    data: { token: 'fake-jwt-token' },
                    status: 200
                });
            } else {
                return Promise.reject({ response: { status: 401 } });
            }
        }
        
        if (config.url.includes('/users/me')) {
            return Promise.resolve({
                data: mockData.users[0],
                status: 200
            });
        }
        
        if (config.url.includes('/users')) {
            return Promise.resolve({
                data: mockData.users,
                status: 200
            });
        }
        
        if (config.url.includes('/tasks')) {
            if (config.method === 'get') {
                return Promise.resolve({
                    data: mockData.tasks,
                    status: 200
                });
            } else if (config.method === 'post') {
                const newTask = {
                    id: Math.floor(Math.random() * 1000),
                    ...JSON.parse(config.data),
                    created_at: new Date().toISOString()
                };
                mockData.tasks.push(newTask);
                return Promise.resolve({
                    data: newTask,
                    status: 201
                });
            } else if (config.method === 'patch') {
                const taskId = config.url.split('/').pop();
                const updates = JSON.parse(config.data);
                const taskIndex = mockData.tasks.findIndex(t => t.id == taskId);
                if (taskIndex !== -1) {
                    mockData.tasks[taskIndex] = { ...mockData.tasks[taskIndex], ...updates };
                    return Promise.resolve({
                        data: mockData.tasks[taskIndex],
                        status: 200
                    });
                }
            } else if (config.method === 'delete') {
                const taskId = config.url.split('/').pop();
                const taskIndex = mockData.tasks.findIndex(t => t.id == taskId);
                if (taskIndex !== -1) {
                    mockData.tasks.splice(taskIndex, 1);
                    return Promise.resolve({ status: 204 });
                }
            }
        }
        
        if (config.url.includes('/projects')) {
            if (config.method === 'get') {
                return Promise.resolve({
                    data: mockData.projects,
                    status: 200
                });
            } else if (config.method === 'post') {
                const newProject = {
                    id: Math.floor(Math.random() * 1000),
                    ...JSON.parse(config.data),
                    progress: 0,
                    created_at: new Date().toISOString()
                };
                mockData.projects.push(newProject);
                return Promise.resolve({
                    data: newProject,
                    status: 201
                });
            } else if (config.method === 'patch') {
                const projectId = config.url.split('/').pop();
                const updates = JSON.parse(config.data);
                const projectIndex = mockData.projects.findIndex(p => p.id == projectId);
                if (projectIndex !== -1) {
                    mockData.projects[projectIndex] = { ...mockData.projects[projectIndex], ...updates };
                    return Promise.resolve({
                        data: mockData.projects[projectIndex],
                        status: 200
                    });
                }
            } else if (config.method === 'delete') {
                const projectId = config.url.split('/').pop();
                const projectIndex = mockData.projects.findIndex(p => p.id == projectId);
                if (projectIndex !== -1) {
                    mockData.projects.splice(projectIndex, 1);
                    return Promise.resolve({ status: 204 });
                }
            }
        }
        
        if (config.url.includes('/notifications')) {
            if (config.method === 'get') {
                return Promise.resolve({
                    data: mockData.notifications,
                    status: 200
                });
            } else if (config.method === 'patch') {
                const notificationId = config.url.split('/').pop();
                const updates = JSON.parse(config.data);
                const notificationIndex = mockData.notifications.findIndex(n => n.id == notificationId);
                if (notificationIndex !== -1) {
                    mockData.notifications[notificationIndex] = { ...mockData.notifications[notificationIndex], ...updates };
                    return Promise.resolve({
                        data: mockData.notifications[notificationIndex],
                        status: 200
                    });
                }
            } else if (config.method === 'delete') {
                const notificationId = config.url.split('/').pop();
                const notificationIndex = mockData.notifications.findIndex(n => n.id == notificationId);
                if (notificationIndex !== -1) {
                    mockData.notifications.splice(notificationIndex, 1);
                    return Promise.resolve({ status: 204 });
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;