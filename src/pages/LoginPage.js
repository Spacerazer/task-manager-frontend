import React, {useState} from 'react';
import { Box, Button, Container, TextField, Typography, Paper} from '@mui/material';
import api from '../services/api';

function LoginPage({onLogin}) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', {login, password});
            const token = res.data.token;
            localStorage.setItem('token', token);
            onLogin();
        } catch (err) {
            setError('Incorrect login or password!');
        }
    };

    return(
        <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
            <Paper elevation={4} sx={{ padding:4, width: '100%'}}>
                <Typography variant="h5" component="h1" align="center" gutterBottom>
                    Enter in system
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    />
                    <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Typography color="error" variant="body2" mt={1}>
                            {error}
                        </Typography>
                    )}
                    <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    >
                        Log In
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default LoginPage;