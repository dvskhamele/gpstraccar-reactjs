import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Button, TableFooter, FormControlLabel, Switch, Box, FormControl, InputLabel, MenuItem, Select, Chip,
  useMediaQuery, Card, CardContent, Typography, Grid, Divider, Avatar, TextField, TableContainer,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import LinkIcon from '@mui/icons-material/Link';
import SimCardIcon from '@mui/icons-material/SimCard';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useTheme } from '@mui/material/styles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { filterByKeyword } from './components/SearchHeader';
import { getStatusColor, formatStatus, formatDateWithMonthText } from '../common/util/formatter';
import { useDeviceReadonly, useManager } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import DeviceUsersValue from './components/DeviceUsersValue';
import usePersistedState from '../common/util/usePersistedState';
import fetchOrThrow from '../common/util/fetchOrThrow';
import AddressValue from '../common/components/AddressValue';
import exportExcel from '../common/util/exportExcel';
import { mapIcons, mapIconKey } from '../map/core/preloadImages';
import DashboardStats from '../common/components/DashboardStats';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

const pngIcons = import.meta.glob('../resources/images/icons/*.png', { eager: true });

const getDeviceIconUrl = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return pngIcons[path]?.default || mapIcons[mapIconKey(category)];
};

const isPngIcon = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return !!pngIcons[path];
};


const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#333',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'background-color 0.2s ease-in-out',
  '& td': {
    whiteSpace: 'nowrap',
    padding: '8px 16px',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  '& td:last-child': {
    borderRight: 'none',
  },
}));

const DevicesPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ all: showAll });
      const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp, showAll]);

  const handleExport = async () => {
    const data = items.filter(filterByKeyword(searchKeyword)).map((item) => ({
      [t('sharedName')]: item.name,
      [t('deviceIdentifier')]: item.uniqueId,
      'Vehicle Number': item.vehicle_number,
      [t('sharedPhone')]: item.phone,
      'SIM Operator': item.sim_operator,
      [t('deviceModel')]: item.model,
      [t('deviceContact')]: item.contact,
      [t('userExpirationTime')]: formatDateWithMonthText(item.expirationTime),
      'Created Date': formatDateWithMonthText(item.created_date || item.createdTime),
      'Device Status': item.disabled ? 'Deactivated' : 'Activated',
    }));
    const sheets = new Map();
    sheets.set(t('deviceTitle'), data);
    await exportExcel(t('deviceTitle'), 'devices.xlsx', sheets, theme);
  };

  const getExpirationStatus = (expirationTime) => {
    if (!expirationTime) return null;
    const days = dayjs(expirationTime).diff(dayjs(), 'day');
    if (days <= 0) return 'expired';
    if (days <= 10) return 'warning';
    return 'ok';
  };

  const filterByDisabledStatus = (item) => {
    if (showExpiring) {
      const status = getExpirationStatus(item.expirationTime);
      return status === 'expired' || status === 'warning';
    }
    if (statusFilter === 'all') {
      return true;
    } if (statusFilter === 'activated') {
      return !item.disabled;
    } if (statusFilter === 'deactivated') {
      return item.disabled;
    }
    return false;
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'deviceTitle']}
      stats={<DashboardStats />}
      toolbar={(
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder={t('sharedSearch')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={showExpiring}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="activated">Activated</MenuItem>
              <MenuItem value="deactivated">Deactivated</MenuItem>
            </Select>
          </FormControl>
          <Chip 
            label="Expiring Soon" 
            color={showExpiring ? "warning" : "default"} 
            variant={showExpiring ? "filled" : "outlined"}
            onClick={() => setShowExpiring(!showExpiring)}
            icon={<DateRangeIcon />}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      )}
    >
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
          {!loading ? items.filter(filterByKeyword(searchKeyword)).filter(filterByDisabledStatus).map((item) => {
            const expStatus = getExpirationStatus(item.expirationTime);
            return (
            <Card key={item.id} elevation={3} sx={{ borderRadius: 3, overflow: 'visible' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <img
                                                            src={getDeviceIconUrl(item.category)}
                                                            alt={item.category}
                                                            style={{
                                                              width: 80,
                                                              height: 80,
                                                              objectFit: 'contain',
                                                              filter: isPngIcon(item.category) ? undefined : 'brightness(0)',
                                                            }}
                                                          />                                      <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(`category${(item.category || 'default').replace(/^\w/, (c) => c.toUpperCase())}`)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={item.disabled ? 'Deactive' : 'Active'}
                    size="small"
                    sx={{
                      backgroundColor: item.disabled ? alpha('#d32f2f', 0.1) : alpha('#2e7d32', 0.1),
                      color: item.disabled ? '#d32f2f' : '#2e7d32',
                      border: `1px solid ${item.disabled ? alpha('#d32f2f', 0.2) : alpha('#2e7d32', 0.2)}`,
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      height: '24px',
                    }}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <Typography variant="body2" fontWeight="medium">IMEI:</Typography>
                      <Typography variant="body2" fontWeight="medium">{item.uniqueId}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <Typography variant="body2" fontWeight="medium">Vehicle Number:</Typography>
                      <VehicleNumberPlate number={item.vehicle_number} />
                    </Box>
                  </Grid>
                  {item.phone && (
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <SimCardIcon fontSize="small" />
                        <Typography variant="body2">{item.phone} ({item.sim_operator})</Typography>
                      </Box>
                    </Grid>
                  )}
                  {item.contact && (
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <SmartphoneIcon fontSize="small" />
                        <Typography variant="body2">{item.contact}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {item.expirationTime && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: expStatus === 'expired' ? 'error.main' : expStatus === 'warning' ? 'warning.main' : 'text.secondary' }}>
                        <DateRangeIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={expStatus !== 'ok' ? 'bold' : 'regular'}>
                          Expires: {formatDateWithMonthText(item.expirationTime)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <DateRangeIcon fontSize="small" />
                      <Typography variant="body2">Created: {formatDateWithMonthText(item.created_date || item.createdTime)}</Typography>
                    </Box>
                  </Grid>
                  {manager && (
                    <Grid item xs={12}>
                       <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Users:</Typography>
                       <DeviceUsersValue deviceId={item.id} />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                borderTop: `1px solid ${theme.palette.divider}`
              }}>
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/device"
                  endpoint="devices"
                  setTimestamp={setTimestamp}
                  customActions={[actionConnections]}
                  readonly={deviceReadonly}
                />
              </Box>
            </Card>
          )}) : (
            <Typography textAlign="center" color="text.secondary" py={5}>Loading devices...</Typography>
          )}

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <Button onClick={handleExport} variant="outlined" size="small">{t('reportExport')}</Button>
            <FormControlLabel
              control={(
                <Switch
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  size="small"
                />
              )}
              label={t('notificationAlways')}
              labelPlacement="start"
              disabled={!manager}
              sx={{ ml: 0 }}
            />
          </Box>
        </Box>
      ) : (
        <TableContainer sx={{ 
          maxHeight: 'calc(100vh - 180px)', 
          borderRadius: '8px', 
          boxShadow: theme.shadows[2], 
          position: 'relative',
          overflow: 'auto', // Explicitly ensure scroll
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Table stickyHeader>
            <TableHead sx={{ 
              zIndex: 3,
              '& th': {
                position: 'sticky',
                top: 0,
              }
            }}>
              <TableRow>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }} />
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Name</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>IMEI Number</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Vehicle Number</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>SIM Number</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Category</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Contact</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Created Date</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Expiration</TableCell>
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Device Status</TableCell>
                {manager && <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, borderRight: '1px solid rgba(255,255,255,0.3)' }}>Users</TableCell>}
                <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }} className={classes.columnAction} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? items.filter(filterByKeyword(searchKeyword)).filter(filterByDisabledStatus).map((item) => {
                const expStatus = getExpirationStatus(item.expirationTime);
                return (
                <StyledTableRow key={item.id}>
                  <TableCell padding="none" sx={{ textAlign: 'center' }}>
                    <img
                      src={getDeviceIconUrl(item.category)}
                      alt={item.category}
                      style={{
                        width: 32,
                        height: 32,
                        objectFit: 'contain',
                        transform: 'scale(2.0)',
                        filter: isPngIcon(item.category) ? undefined : 'brightness(0)',
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.uniqueId}</TableCell>
                  <TableCell><VehicleNumberPlate number={item.vehicle_number} /></TableCell>
                  <TableCell>{item.phone} ({item.sim_operator})</TableCell>
                  <TableCell>{t(`category${(item.category || 'default').replace(/^\w/, (c) => c.toUpperCase())}`)}</TableCell>
                  <TableCell>{item.contact}</TableCell>
                  <TableCell>{formatDateWithMonthText(item.created_date || item.createdTime)}</TableCell>
                  <TableCell sx={{
                    color: expStatus === 'expired' ? 'error.main' : expStatus === 'warning' ? 'warning.main' : 'inherit',
                    fontWeight: expStatus !== 'ok' ? 'bold' : 'normal',
                  }}>
                    {formatDateWithMonthText(item.expirationTime)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.disabled ? 'Deactive' : 'Active'}
                      size="small"
                      sx={{
                        backgroundColor: item.disabled ? alpha('#d32f2f', 0.1) : alpha('#2e7d32', 0.1),
                        color: item.disabled ? '#d32f2f' : '#2e7d32',
                        border: `1px solid ${item.disabled ? alpha('#d32f2f', 0.2) : alpha('#2e7d32', 0.2)}`,
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        height: '24px',
                      }}
                    />
                  </TableCell>
                  {manager && <TableCell><DeviceUsersValue deviceId={item.id} /></TableCell>}
                  <TableCell className={classes.columnAction} padding="none">
                    <CollectionActions
                      itemId={item.id}
                      editPath="/settings/device"
                      endpoint="devices"
                      setTimestamp={setTimestamp}
                      customActions={[actionConnections]}
                      readonly={deviceReadonly}
                    />
                  </TableCell>
                </StyledTableRow>
              )}) : (<TableShimmer columns={manager ? 10 : 9} endAction />)}
            </TableBody>
            <TableFooter sx={{ position: 'sticky', bottom: 0, backgroundColor: theme.palette.background.paper, zIndex: 2 }}>
              <TableRow>
                <TableCell sx={{ backgroundColor: theme.palette.background.paper }}>
                  <Button onClick={handleExport} variant="text">{t('reportExport')}</Button>
                </TableCell>
                <TableCell colSpan={manager ? 10 : 9} align="right" sx={{ backgroundColor: theme.palette.background.paper }}>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={showAll}
                        onChange={(e) => setShowAll(e.target.checked)}
                        size="small"
                      />
                    )}
                    label={t('notificationAlways')}
                    labelPlacement="start"
                    disabled={!manager}
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;