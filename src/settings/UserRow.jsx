import { useState } from 'react';
import {
  TableRow, TableCell, IconButton, Collapse, Box, Typography, Table, TableHead, TableBody, Chip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import { alpha, styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatBoolean, formatShortDate } from '../common/util/formatter';
import CollectionActions from './components/CollectionActions';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useEffectAsync } from '../reactHelper';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(4n+1)': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#333',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  // Hide border for the main row when expanded to merge visually with the collapse row if needed
  '& > *': {
    borderBottom: 'unset',
  },
}));

const SubTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  color: theme.palette.common.white,
  backgroundColor: '#ed6c02',
  padding: '6px 16px',
}));

const ManagedUserHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  color: theme.palette.common.white,
  backgroundColor: '#4CA7D6',
  padding: '6px 16px',
}));

const UserRow = ({ item, manager, actionLogin, actionConnections, setTimestamp }) => {
  const [open, setOpen] = useState(false);
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
    if (open && !devices) {
      await refreshDevices();
    }
  }, [open]);

  const handleVehicleClick = (deviceId) => {
    navigate(`/settings/device?deviceId=${deviceId}`); // Or navigate to a specific report/view
  };

  const handleOpenAddDevice = async () => {
    setAddDeviceOpen(true);
    if (allDevices.length === 0) {
      try {
        // Fetch all devices accessible to the manager
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
        await refreshDevices(); // Refresh the list
      } catch (e) {
        console.error(e);
      }
    }
  };

  const availableDevices = allDevices.filter(d => !devices?.some(ud => ud.id === d.id));

  return (
    <>
      <StyledTableRow>
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell style={{ padding: '12px 16px' }}>{item.name}</TableCell>
        <TableCell style={{ padding: '12px 16px' }}>{item.email}</TableCell>
        <TableCell style={{ padding: '12px 16px' }}>{item.phone || ''}</TableCell>
        <TableCell style={{ padding: '12px 16px' }}>
          {item.administrator ? (
            <Chip
              label={t('userTypeAdmin')}
              size="small"
              sx={{
                backgroundColor: alpha('#d32f2f', 0.1),
                color: '#d32f2f',
                border: `1px solid ${alpha('#d32f2f', 0.2)}`,
                fontWeight: 'bold',
                borderRadius: '4px',
                height: '24px'
              }}
            />
          ) : isDealer ? (
            <Chip
              label="Dealer"
              size="small"
              sx={{
                backgroundColor: alpha('#ed6c02', 0.1),
                color: '#ed6c02',
                border: `1px solid ${alpha('#ed6c02', 0.2)}`,
                fontWeight: 'bold',
                borderRadius: '4px',
                height: '24px'
              }}
            />
          ) : (
            <Chip
              label={t('userTypeUser')}
              size="small"
              sx={{
                backgroundColor: alpha('#0288d1', 0.1),
                color: '#0288d1',
                border: `1px solid ${alpha('#0288d1', 0.2)}`,
                fontWeight: 'bold',
                borderRadius: '4px',
                height: '24px'
              }}
            />
          )}
        </TableCell>
        <TableCell style={{ padding: '12px 16px' }}>
          <Chip
            label={formatBoolean(item.disabled, t)}
            size="small"
            sx={{
              backgroundColor: item.disabled ? alpha('#d32f2f', 0.1) : alpha('#2e7d32', 0.1),
              color: item.disabled ? '#d32f2f' : '#2e7d32',
              border: `1px solid ${item.disabled ? alpha('#d32f2f', 0.2) : alpha('#2e7d32', 0.2)}`,
              fontWeight: 600,
              borderRadius: '4px',
              height: '24px',
              '& .MuiChip-label': { px: 1.5 }
            }}
          />
        </TableCell>
        <TableCell style={{ padding: '12px 16px' }}>{formatShortDate(item.expirationTime)}</TableCell>
        <TableCell padding="none" style={{ padding: '12px 16px' }}>
          <CollectionActions
            itemId={item.id}
            editPath="/settings/user"
            endpoint="users"
            setTimestamp={setTimestamp}
            customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
          />
        </TableCell>
      </StyledTableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, padding: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Devices Section */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="subtitle2" fontWeight="bold">
                           Devices ({devices?.length || 0})
                         </Typography>
                         <Chip label={`${devices?.length || 0} Vehicles`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                       </Box>
                       <Button 
                         startIcon={<AddIcon />} 
                         size="small" 
                         variant="contained" 
                         color="primary"
                         onClick={handleOpenAddDevice}
                         sx={{ textTransform: 'none', height: 28 }}
                       >
                         Add Device
                       </Button>
                    </Box>
                    {devices && devices.length > 0 ? (
                      <Table size="small" aria-label="devices">
                        <TableHead>
                          <TableRow>
                            <SubTableHeadCell>Name</SubTableHeadCell>
                            <SubTableHeadCell>IMEI</SubTableHeadCell>
                            <SubTableHeadCell>Vehicle No.</SubTableHeadCell>
                            <SubTableHeadCell>Status</SubTableHeadCell>
                            <SubTableHeadCell>Last Update</SubTableHeadCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {devices.map((device) => (
                            <TableRow key={device.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }, cursor: 'pointer' }} onClick={() => handleVehicleClick(device.id)}>
                              <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem' }}>{device.name}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>{device.uniqueId}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>
                                <VehicleNumberPlate number={device.vehicle_number} small />
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>
                                <Chip 
                                  label={device.status} 
                                  size="small" 
                                  color={device.status === 'online' ? 'success' : 'default'} 
                                  sx={{ height: 20, fontSize: '0.65rem', textTransform: 'uppercase' }} 
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>{formatShortDate(device.lastUpdate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No devices assigned.</Typography>
                    )}
                  </Box>

                  {/* Sub-users Section for Dealers */}
                  {isDealer && (
                    <Box>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Managed Users ({subUsers?.length || 0})
                          </Typography>
                       </Box>
                      {subUsers && subUsers.length > 0 ? (
                        <Table size="small" aria-label="sub-users">
                          <TableHead>
                            <TableRow>
                              <ManagedUserHeadCell>Name</ManagedUserHeadCell>
                              <ManagedUserHeadCell>Email</ManagedUserHeadCell>
                              <ManagedUserHeadCell>Phone</ManagedUserHeadCell>
                              <ManagedUserHeadCell>Devices</ManagedUserHeadCell>
                              <ManagedUserHeadCell>Status</ManagedUserHeadCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{user.name}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{user.email}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{user.phone}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>{user.userLimit === -1 ? 'Unlimited' : user.userLimit}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem' }}>
                                   <Chip 
                                      label={user.disabled ? 'Disabled' : 'Active'} 
                                      size="small" 
                                      color={user.disabled ? 'error' : 'success'} 
                                      sx={{ height: 20, fontSize: '0.65rem' }} 
                                    />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No users added.</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

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
    </>
  );
};

export default UserRow;
