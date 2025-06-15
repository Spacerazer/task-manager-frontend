import React, {useEffect, useState} from 'react';
import api from '../services/api';

function TasksPage() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        api.get('/tasks').then(res => setTasks(res.data));
    }, []);

    return (
        <div>
            <h1>Tasks</h1>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>
                        <b>{task.title}</b> ({task.status}) - {task.assignee?.name || 'Without assigne'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TasksPage;