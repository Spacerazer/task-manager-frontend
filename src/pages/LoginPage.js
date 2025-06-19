import React, {useState} from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Avatar} from '@mui/material';
import { Assignment as TaskIcon } from '@mui/icons-material';
import api from '../services/api';

function LoginPage({onLogin}) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await api.post('/auth/login', {login, password});
            const token = res.data.token;
            onLogin(token);
        } catch (err) {
            setError('Неверный логин или пароль!');
        } finally {
            setLoading(false);
        }
    };

    return(
        <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
            <Paper elevation={4} sx={{ padding: 4, width: '100%'}}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <TaskIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h5" component="h1" align="center" gutterBottom>
                        Менеджер задач
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Войдите в систему для продолжения
                    </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Логин"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    {error && (
                        <Typography color="error" variant="body2" mt={1} align="center">
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                </Box>
                
                <Box mt={2} textAlign="center">
                    <Typography variant="caption" color="text.secondary">
                        Для демонстрации используйте: admin / admin
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default LoginPage;