import { useState } from 'react';
import {
  Card, CardContent, CardActions, Typography, Collapse, Box, Chip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField,
  Divider, Grid, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import SimCardIcon from '@mui/icons-material/SimCard';
import { alpha, styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatBoolean, formatShortDate } from '../common/util/formatter';
import CollectionActions from './components/CollectionActions';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useEffectAsync } from '../reactHelper';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
  20%, 40%, 60%, 80% { transform: translateX(1px); }
`;

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const UserCard = ({ item, manager, actionLogin, actionConnections, setTimestamp }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState(null);
  const [subUsers, setSubUsers] = useState(null);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  const t = useTranslation();
  const navigate = useNavigate();

  const isDealer = !item.administrator && (item.role === 'MANAGER' || (item.userLimit && item.userLimit > 0));

  const refreshDevices = async () => {
    setLoading(true);
    try {
      const devicesResponse = await fetchOrThrow(`/api/devices?userId=${item.id}`);
      setDevices(await devicesResponse.json());
      if (isDealer) {
        const usersResponse = await fetchOrThrow(`/api/users?userId=${item.id}`);
        setSubUsers(await usersResponse.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffectAsync(async () => {
    if (expanded && !devices) {
      await refreshDevices();
    }
  }, [expanded]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleVehicleClick = (deviceId) => {
    navigate(`/settings/device?deviceId=${deviceId}`);
  };

  const handleOpenAddDevice = async () => {
    setAddDeviceOpen(true);
    if (allDevices.length === 0) {
      try {
        const response = await fetchOrThrow('/api/devices');
        setAllDevices(await response.json());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLinkDevice = async () => {
    if (selectedDevice) {
      try {
        await fetchOrThrow('/api/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: item.id, deviceId: selectedDevice.id }),
        });
        setAddDeviceOpen(false);
        setSelectedDevice(null);
        await refreshDevices();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const availableDevices = allDevices.filter(d => !devices?.some(ud => ud.id === d.id));

  const getTypeColor = () => {
    if (item.administrator) return '#d32f2f'; // Red for Admin
    if (isDealer) return '#ed6c02'; // Orange for Dealer
    return '#0288d1'; // Blue for User
  };

  const typeColor = getTypeColor();

  return (
    <Card elevation={3} sx={{ 
      mb: 2, 
      borderRadius: 3, 
      overflow: 'visible',
      borderTop: `4px solid ${typeColor}`, // Bold top border for quick identification
    }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          p: 1.5,
          mx: -2,
          mt: -2,
          backgroundColor: alpha(typeColor, 0.05), // Light background tint for the header
          borderBottom: `1px solid ${alpha(typeColor, 0.1)}`
        }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
             <Box sx={{ 
               width: 40, 
               height: 40, 
               borderRadius: '50%', 
               backgroundColor: alpha(typeColor, 0.1), 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               color: typeColor
             }}>
               <PersonIcon />
             </Box>
             <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.email}</Typography>
             </Box>
           </Box>
           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip
                label={item.administrator ? t('userTypeAdmin') : isDealer ? 'Dealer' : t('userTypeUser')}
                size="small"
                sx={{
                  backgroundColor: typeColor,
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
              <Chip
                label={formatBoolean(item.disabled, t)}
                size="small"
                variant="outlined"
                sx={{
                  color: item.disabled ? '#d32f2f' : '#2e7d32',
                  borderColor: item.disabled ? alpha('#d32f2f', 0.5) : alpha('#2e7d32', 0.5),
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  height: 18,
                  animation: item.disabled ? `${shake} 0.8s infinite` : 'none',
                  '&:hover': {
                    animation: item.disabled ? `${shake} 0.8s infinite` : 'none',
                  }
                }}
              />
           </Box>
        </Box>
        <Grid container spacing={1} sx={{ mt: 1 }}>
           {item.phone && (
              <Grid item xs={12}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                   <PhoneIcon fontSize="small" sx={{ fontSize: 16 }} />
                   <Typography variant="body2" fontSize="0.85rem">{item.phone}</Typography>
                 </Box>
              </Grid>
           )}
           {item.sim_operator && (
              <Grid item xs={12}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                   <SimCardIcon fontSize="small" sx={{ fontSize: 16 }} />
                   <Typography variant="body2" fontSize="0.85rem">{item.sim_operator}</Typography>
                 </Box>
              </Grid>
           )}
           {item.expirationTime && (
             <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                   <EventIcon fontSize="small" sx={{ fontSize: 16 }} />
                   <Typography variant="body2" fontSize="0.85rem">{t('userExpirationTime')}: {formatShortDate(item.expirationTime)}</Typography>
                </Box>
             </Grid>
           )}
        </Grid>
      </CardContent>
      <CardActions disableSpacing sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', bgcolor: 'rgba(0,0,0,0.02)' }}>
         <CollectionActions
            itemId={item.id}
            editPath="/settings/user"
            endpoint="users"
            setTimestamp={setTimestamp}
            customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
          />
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
           {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
               <CircularProgress size={24} />
             </Box>
           ) : (
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
               {/* Devices Mobile View */}
               <Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Devices ({devices?.length || 0})</Typography>
                    {manager && (
                      <Button 
                           startIcon={<AddIcon />} 
                           size="small" 
                           variant="text" 
                           onClick={handleOpenAddDevice}
                           sx={{ textTransform: 'none' }}
                         >
                           Add
                         </Button>
                    )}
                 </Box>
                 {devices && devices.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                       {devices.map((device) => (
                          <Card key={device.id} variant="outlined" sx={{ p: 1, cursor: 'pointer' }} onClick={() => handleVehicleClick(device.id)}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" fontWeight="bold">{device.name}</Typography>
                                <Chip 
                                  label={device.status} 
                                  size="small" 
                                  color={device.status === 'online' ? 'success' : 'default'} 
                                  sx={{ height: 18, fontSize: '0.6rem' }} 
                                />
                             </Box>
                             <Typography variant="caption" display="block" color="text.secondary">IMEI: {device.uniqueId}</Typography>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <VehicleNumberPlate number={device.vehicle_number} small />
                                <Typography variant="caption" color="text.secondary">{formatShortDate(device.lastUpdate)}</Typography>
                             </Box>
                          </Card>
                       ))}
                    </Box>
                 ) : (
                   <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No devices.</Typography>
                 )}
               </Box>
               
               {/* Sub-users Mobile View */}
               {isDealer && (
                 <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Managed Users ({subUsers?.length || 0})</Typography>
                    {subUsers && subUsers.length > 0 ? (
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {subUsers.map((user) => (
                             <Card key={user.id} variant="outlined" sx={{ p: 1 }}>
                                <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                                <Typography variant="caption" display="block">{user.email}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                  <Typography variant="caption">Devices: {user.userLimit === -1 ? 'Unl' : user.userLimit}</Typography>
                                  <Chip 
                                      label={user.disabled ? 'Disabled' : 'Active'} 
                                      size="small" 
                                      color={user.disabled ? 'error' : 'success'} 
                                      sx={{ height: 18, fontSize: '0.6rem' }} 
                                    />
                                </Box>
                             </Card>
                          ))}
                       </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No managed users.</Typography>
                    )}
                 </Box>
               )}
             </Box>
           )}
        </CardContent>
      </Collapse>

      <Dialog open={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Device</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Autocomplete
              options={availableDevices}
              getOptionLabel={(option) => `${option.name} (${option.uniqueId})`}
              value={selectedDevice}
              onChange={(event, newValue) => setSelectedDevice(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Device" variant="outlined" fullWidth />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{option.uniqueId}</Typography>
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDeviceOpen(false)}>Cancel</Button>
          <Button onClick={handleLinkDevice} variant="contained" disabled={!selectedDevice}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UserCard;
