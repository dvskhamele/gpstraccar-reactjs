import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Card, CardContent, Typography, Box, useTheme, useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import { useEffectAsync } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';
import { useAdministrator, useManager } from '../util/permissions';

const DashboardCard = ({
  title, count, icon, color, onClick,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Card
      onClick={onClick}
      elevation={4}
      sx={{
        background: color,
        color: '#fff',
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 6px 12px rgba(0,0,0,0.3)`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          filter: 'brightness(1.05)',
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px 0 ${alpha(color, 0.5)}`,
        },
      }}
    >
      <CardContent sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isDesktop ? '16px !important' : '8px !important',
        gap: isDesktop ? 2 : 0.5,
      }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: 3,
          padding: isDesktop ? '10px' : '6px', // Responsive padding for icon container
        }}
        >
          {icon}
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
        }}
        >
          <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1, mb: 0.5, fontSize: isDesktop ? '2.125rem' : '1rem' }}>
            {count}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: isDesktop ? '0.65rem' : '0.55rem' }}>
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardStats = ({ onStatusClick }) => {
  const admin = useAdministrator();
  const manager = useManager();
  const navigate = useNavigate();
  const [data, setData] = useState({
    users: 0,
    managers: 0,
    vehicles: 0,
    running: 0,
    stopped: 0,
    overspeed: 0,
  });

  useEffectAsync(async () => {
    try {
      const response = await fetchOrThrow('/api/dashboard');
      setData(await response.json());
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  }, []);

  // Removed iconStyle constant - fontSize is now set directly on the icon components

  const cards = [
    manager && {
      title: 'Users',
      key: 'users',
      count: data.users,
      icon: <PeopleIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#3f51b5', // Indigo
      path: '/settings/users',
    },
    admin && {
      title: 'Dealers',
      key: 'managers',
      count: data.managers,
      icon: <ManageAccountsIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#673ab7', // Deep Purple
    },
    {
      title: 'Vehicles',
      key: 'vehicles',
      count: data.vehicles,
      icon: <DirectionsCarIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#00bcd4', // Cyan
      path: '/settings/devices',
    },
    {
      title: 'Running',
      key: 'running',
      count: data.running,
      icon: <PlayCircleFilledIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#4caf50', // Green
      status: 'online',
    },
    {
      title: 'Stopped',
      key: 'stopped',
      count: data.stopped,
      icon: <StopCircleIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#f44336', // Red
      status: 'offline',
    },
    {
      title: 'Overspeed',
      key: 'overspeed',
      count: data.overspeed,
      icon: <SpeedIcon sx={{ fontSize: { xs: '1rem', md: '1.6rem' } }} />,
      color: '#ff9800', // Orange
      status: 'overspeed',
    },
  ].filter(Boolean);

  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 2,
          width: '100%',
        }}
      >
        {cards.map((card) => {
          let clickHandler;
          if (card.path) {
            clickHandler = () => navigate(card.path);
          } else if (onStatusClick && card.status) {
            clickHandler = () => onStatusClick(card.status);
          }
          return (
            <DashboardCard
              key={card.key}
              title={card.title}
              count={card.count}
              icon={card.icon}
              color={card.color}
              onClick={clickHandler}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default DashboardStats;
