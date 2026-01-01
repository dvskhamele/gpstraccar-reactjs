import { useState } from 'react';
import {
  Card, CardContent, Typography, Box,
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
import { useAdministrator } from '../util/permissions';

const DashboardCard = ({
  title, count, icon, color,
}) => (
  <Card
    elevation={4}
    sx={{
      background: color,
      color: '#fff',
      borderRadius: 4,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
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
      padding: '16px !important',
      gap: 2,
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 3,
        padding: '10px',
      }}>
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1, mb: 0.5 }}>
          {count}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.65rem' }}>
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardStats = () => {
  const admin = useAdministrator();
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

  const iconStyle = { fontSize: '1.6rem' };

  const cards = [
    {
      title: 'Users',
      key: 'users',
      count: data.users,
      icon: <PeopleIcon style={iconStyle} />,
      color: '#3f51b5', // Indigo
    },
    admin && {
      title: 'Dealers',
      key: 'managers',
      count: data.managers,
      icon: <ManageAccountsIcon style={iconStyle} />,
      color: '#673ab7', // Deep Purple
    },
    {
      title: 'Vehicles',
      key: 'vehicles',
      count: data.vehicles,
      icon: <DirectionsCarIcon style={iconStyle} />,
      color: '#00bcd4', // Cyan
    },
    {
      title: 'Running',
      key: 'running',
      count: data.running,
      icon: <PlayCircleFilledIcon style={iconStyle} />,
      color: '#4caf50', // Green
    },
    {
      title: 'Stopped',
      key: 'stopped',
      count: data.stopped,
      icon: <StopCircleIcon style={iconStyle} />,
      color: '#f44336', // Red
    },
    {
      title: 'Overspeed',
      key: 'overspeed',
      count: data.overspeed,
      icon: <SpeedIcon style={iconStyle} />,
      color: '#ff9800', // Orange
    },
  ].filter(Boolean);

  return (
    <Box sx={{ mb: 1, width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: 2,
          width: '100%',
        }}
      >
        {cards.map((card) => (
          <DashboardCard
            key={card.key}
            title={card.title}
            count={card.count}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DashboardStats;
