import React from 'react';
import './styles/hospitality.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Home,
  Hotel,
  Person,
  BookOnline,
  RateReview,
  Menu as MenuIcon,
  Login,
  Logout,
  AdminPanelSettings
} from '@mui/icons-material';
import { useState } from 'react';
import { authService } from './services/authService';

// Импорт страниц
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ReviewsPage from './pages/ReviewsPage';

// Создаем тему Material-UI в стиле hospitality (бежевый, золотой, белый)
const theme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37', // Золотой
      light: '#F4E4BC', // Светло-золотой
      dark: '#B8941F', // Темно-золотой
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E8D5B7', // Темно-бежевый
      light: '#F5E6D3', // Светло-бежевый
      dark: '#C4A882',
      contrastText: '#333333',
    },
    background: {
      default: '#F5E6D3', // Бежевый фон
      paper: '#FFFFFF', // Белый для карточек
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#D4AF37',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#D4AF37',
    },
    h4: {
      color: '#D4AF37',
    },
    h5: {
      color: '#D4AF37',
    },
    h6: {
      color: '#D4AF37',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#D4AF37', // Золотой для AppBar
          color: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
          },
        },
        containedPrimary: {
          backgroundColor: '#D4AF37',
          '&:hover': {
            backgroundColor: '#F4E4BC',
            color: '#333',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          transition: 'all 0.3s ease',
        },
        elevation3: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.2)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#D4AF37',
          color: '#FFFFFF',
        },
      },
    },
  },
});

// Компонент навигации
const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = authService.getCurrentUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Главная', icon: <Home />, path: '/', show: true },
    { text: 'Номера', icon: <Hotel />, path: '/rooms', show: true },
    { text: 'Мои брони', icon: <BookOnline />, path: '/bookings', show: !!user },
    { text: 'Отзывы', icon: <RateReview />, path: '/reviews', show: true },
    { text: 'Профиль', icon: <Person />, path: '/profile', show: !!user },
    { text: 'Админка', icon: <AdminPanelSettings />, path: '/admin', show: user?.role === 'admin' },
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        item.show && (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        )
      ))}
    </List>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏨 Гостиница "Престиж"
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                item.show && (
                  <Button
                    key={item.text}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                )
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            {user ? (
              <>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  {user.firstName}
                </Typography>
                <Button
                  color="inherit"
                  startIcon={<Logout />}
                  onClick={() => {
                    authService.logout();
                    window.location.href = '/';
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<Login />}
                >
                  Войти
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                >
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

// Защищенный маршрут
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Основной компонент приложения
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navigation />
          
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/room/:id" element={<RoomDetailsPage />} />
              {/* Добавить если нужна отдельная страница бронирования */}
              {/* <Route path="/book/:id" element={<BookingPage />} /> */}
              <Route path="/reviews" element={<ReviewsPage />} />
              
              {/* Защищенные маршруты */}
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              } />
              
              {/* 404 страница */}
              <Route path="*" element={
                <Box sx={{ textAlign: 'center', mt: 10 }}>
                  <Typography variant="h3" gutterBottom>
                    404 - Страница не найдена
                  </Typography>
                  <Button variant="contained" component={Link} to="/">
                    На главную
                  </Button>
                </Box>
              } />
            </Routes>
          </Container>
          
          {/* Футер */}
          <Box component="footer" className="hospitality-footer">
            <Container>
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Гостиница "Престиж". Все права защищены.
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" align="center" mt={1}>
                Текущее время сервера (UTC): {new Date().toISOString()} |
                Локальное время: {new Date().toLocaleString('ru-RU')} |
                Временная зона: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;