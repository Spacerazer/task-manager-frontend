import React, {useState, useEffect} from "react";
import api from "../services/api";

function NewTaskForm({ onCreate }) {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [users, setUsers] = useState('');

    useEffect(() => {
        api.get('/users').then(res => setUsers(res.data));
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        await api.post('/tasks', {
            title,
            description: '',
            status: 'new',
            priority: 'medium',
            assignee_id: assigneeId,
        });
        onCreate();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Without assignee</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>
            <button type="submit">Create</button>
        </form>
    );
}

export default NewTaskForm;