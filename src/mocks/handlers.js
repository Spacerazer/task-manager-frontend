import {rest} from 'msw';

export const handlers = [
    rest.post('/api/auth/login', async (req, res, ctx) => {
        const {login, password} = await req.json();

        if (login === 'admin' && password === 'admin'){
            return res(
                ctx.status(200),
                ctx.json({token: 'fake-jwt-token'})
            );
        } else {
            return res(
                ctx.status(401)
            );
        }
    }),

    rest.get('/api/users/me', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ id: 1, name: 'admin', role: 'admin' }));
    }),

    rest.get('/api/users', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { id: 1, name: 'admin', role: 'admin' },
                { id: 2, name: 'Иван Петров', role: 'manager' },
                { id: 3, name: 'Мария Сидорова', role: 'executor' },
                { id: 4, name: 'Петр Иванов', role: 'executor' }
            ])
        );
    }),

    rest.get('/api/tasks', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
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
            ])
        );
    }),

    rest.post('/api/tasks', async (req, res, ctx) => {
        const task = await req.json();
        return res(
            ctx.status(201),
            ctx.json({
                id: Math.floor(Math.random() * 1000),
                ...task,
                created_at: new Date().toISOString()
            })
        );
    }),

    rest.patch('/api/tasks/:id', async (req, res, ctx) => {
        const updates = await req.json();
        return res(
            ctx.status(200),
            ctx.json({
                id: req.params.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
        );
    }),

    rest.delete('/api/tasks/:id', (req, res, ctx) => {
        return res(ctx.status(204));
    }),

    rest.get('/api/projects', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
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
            ])
        );
    }),

    rest.post('/api/projects', async (req, res, ctx) => {
        const project = await req.json();
        return res(
            ctx.status(201),
            ctx.json({
                id: Math.floor(Math.random() * 1000),
                ...project,
                progress: 0,
                created_at: new Date().toISOString()
            })
        );
    }),

    rest.patch('/api/projects/:id', async (req, res, ctx) => {
        const updates = await req.json();
        return res(
            ctx.status(200),
            ctx.json({
                id: req.params.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
        );
    }),

    rest.delete('/api/projects/:id', (req, res, ctx) => {
        return res(ctx.status(204));
    }),

    rest.get('/api/notifications', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
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
            ])
        );
    }),

    rest.patch('/api/notifications/:id', async (req, res, ctx) => {
        const updates = await req.json();
        return res(
            ctx.status(200),
            ctx.json({
                id: req.params.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
        );
    }),

    rest.delete('/api/notifications/:id', (req, res, ctx) => {
        return res(ctx.status(204));
    }),
];