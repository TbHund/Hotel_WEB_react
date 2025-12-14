import React, { Component } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Phone } from '@mui/icons-material';
import { authService } from '../services/authService';

class AuthForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isLogin: props.mode === 'login',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '+375 (29) ',
            birthDate: '',
            showPassword: false,
            showConfirmPassword: false,
            loading: false,
            error: '',
            success: ''
        };
        
        // Привязка обработчиков событий
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
        this.toggleConfirmPasswordVisibility = this.toggleConfirmPasswordVisibility.bind(this);
        this.switchMode = this.switchMode.bind(this);
    }
    
    // Обработчик события: изменение значения в поле ввода
    handleInputChange(event) {
        const { name, value } = event.target;
        
        // Специальная обработка для телефонного номера
        if (name === 'phoneNumber') {
            // Удаляем все нецифровые символы
            let digits = value.replace(/\D/g, '');
            
            // Если номер начинается с 375, убираем его (префикс уже есть)
            if (digits.startsWith('375')) {
                digits = digits.substring(3);
            }
            
            // Ограничиваем до 9 цифр (код оператора + 7 цифр номера)
            if (digits.length > 9) {
                digits = digits.substring(0, 9);
            }
            
            // Форматируем номер
            let formattedValue = '+375';
            
            if (digits.length > 0) {
                formattedValue += ' (' + digits.substring(0, 2);
                
                if (digits.length > 2) {
                    formattedValue += ') ' + digits.substring(2, 5);
                    
                    if (digits.length > 5) {
                        formattedValue += '-' + digits.substring(5, 7);
                        
                        if (digits.length > 7) {
                            formattedValue += '-' + digits.substring(7, 9);
                        }
                    }
                }
            } else {
                // Если нет цифр, оставляем только префикс с пробелом для удобства
                formattedValue += ' (';
            }
            
            this.setState({ [name]: formattedValue });
            return;
        }
        
        this.setState({ [name]: value });
    }
    
    // Обработчик события: переключение видимости пароля
    togglePasswordVisibility() {
        this.setState(prevState => ({
            showPassword: !prevState.showPassword
        }));
    }
    
    // Обработчик события: переключение видимости подтверждения пароля
    toggleConfirmPasswordVisibility() {
        this.setState(prevState => ({
            showConfirmPassword: !prevState.showConfirmPassword
        }));
    }
    
    // Обработчик события: переключение между регистрацией и входом
    switchMode() {
        this.setState(prevState => ({
            isLogin: !prevState.isLogin,
            error: '',
            success: ''
        }));
    }
    
    // Обработчик события: отправка формы
    async handleSubmit(event) {
        event.preventDefault();
        
        const { 
            isLogin, 
            firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword, 
            phoneNumber, 
            birthDate 
        } = this.state;
        
        // Валидация
        if (!isLogin) {
            if (password !== confirmPassword) {
                this.setState({ error: 'Пароли не совпадают' });
                return;
            }
            
            if (!firstName || !lastName || !phoneNumber) {
                this.setState({ error: 'Заполните все обязательные поля' });
                return;
            }
        }
        
        this.setState({ loading: true, error: '', success: '' });
        
        try {
            if (isLogin) {
                // Вход
                const result = await authService.login(email, password);
                if (result.success) {
                    this.setState({ 
                        success: 'Вход выполнен успешно!',
                        email: '',
                        password: ''
                    });
                    
                    // Вызываем callback
                    if (this.props.onSuccess) {
                        this.props.onSuccess(result.data);
                    }
                } else {
                    this.setState({ error: result.message });
                }
            } else {
                // Регистрация
                const userData = {
                    firstName,
                    lastName,
                    email,
                    password,
                    phoneNumber,
                    birthDate: birthDate || undefined
                };
                
                const result = await authService.register(userData);
                if (result.success) {
                    this.setState({ 
                        success: 'Регистрация успешна!',
                        firstName: '',
                        lastName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '+375 (29) ',
                        birthDate: ''
                    });
                    
                    // Вызываем callback
                    if (this.props.onSuccess) {
                        this.props.onSuccess(result.data);
                    }
                } else {
                    this.setState({ 
                        error: result.message || 'Ошибка регистрации',
                        errors: result.errors
                    });
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            
            // Обработка ошибок от authService
            if (error.message) {
                this.setState({ 
                    error: error.message,
                    errors: error.errors || []
                });
            } else if (error.response?.data?.message) {
                this.setState({ 
                    error: error.response.data.message,
                    errors: error.response.data.errors || []
                });
            } else {
                this.setState({ 
                    error: 'Ошибка соединения с сервером. Убедитесь, что сервер запущен на порту 5000'
                });
            }
        } finally {
            this.setState({ loading: false });
        }
    }
    
    // Жизненный цикл: componentDidMount
    componentDidMount() {
        console.log('AuthForm mounted');
        
        // Автофокус на email поле при монтировании
        if (this.emailInput) {
            this.emailInput.focus();
        }
    }
    
    // Жизненный цикл: componentDidUpdate
    componentDidUpdate(prevProps, prevState) {
        // Логируем изменение режима
        if (prevState.isLogin !== this.state.isLogin) {
            console.log(`Switched to ${this.state.isLogin ? 'login' : 'register'} mode`);
        }
    }
    
    // Жизненный цикл: componentWillUnmount
    componentWillUnmount() {
        console.log('AuthForm will unmount');
    }
    
    render() {
        const { 
            isLogin, 
            firstName, 
            lastName, 
            email, 
            password, 
            confirmPassword, 
            phoneNumber, 
            birthDate,
            showPassword,
            showConfirmPassword,
            loading,
            error,
            success
        } = this.state;
        
        return (
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    {isLogin ? 'Вход в систему' : 'Регистрация'}
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                
                <form onSubmit={this.handleSubmit}>
                    {!isLogin && (
                        <>
                            <TextField
                                fullWidth
                                label="Имя"
                                name="firstName"
                                value={firstName}
                                onChange={this.handleInputChange}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <TextField
                                fullWidth
                                label="Фамилия"
                                name="lastName"
                                value={lastName}
                                onChange={this.handleInputChange}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <TextField
                                fullWidth
                                label="Номер телефона"
                                name="phoneNumber"
                                value={phoneNumber}
                                onChange={this.handleInputChange}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Формат: +375 (29) XXX-XX-XX"
                            />
                            
                            <TextField
                                fullWidth
                                label="Дата рождения"
                                name="birthDate"
                                type="date"
                                value={birthDate}
                                onChange={this.handleInputChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                        </>
                    )}
                    
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={this.handleInputChange}
                        margin="normal"
                        required
                        inputRef={input => this.emailInput = input}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email />
                                </InputAdornment>
                            ),
                        }}
                    />
                    
                    <TextField
                        fullWidth
                        label="Пароль"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={this.handleInputChange}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={this.togglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    
                    {!isLogin && (
                        <TextField
                            fullWidth
                            label="Подтверждение пароля"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={this.handleInputChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={this.toggleConfirmPasswordVisibility}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : isLogin ? (
                            'Войти'
                        ) : (
                            'Зарегистрироваться'
                        )}
                    </Button>
                    
                    <Box textAlign="center">
                        <Button
                            onClick={this.switchMode}
                            color="secondary"
                        >
                            {isLogin 
                                ? 'Нет аккаунта? Зарегистрируйтесь' 
                                : 'Уже есть аккаунт? Войдите'}
                        </Button>
                    </Box>
                </form>
                
                {/* Отображение текущего времени (требование задания) */}
                <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                    <Typography variant="caption" color="text.secondary">
                        Текущее время (UTC): {new Date().toISOString()}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                        Текущее время (локальное): {new Date().toLocaleString('ru-RU')}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                        Временная зона: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </Typography>
                </Box>
            </Paper>
        );
    }
}

// Props по умолчанию
AuthForm.defaultProps = {
    mode: 'login',
    onSuccess: () => {}
};

export default AuthForm;