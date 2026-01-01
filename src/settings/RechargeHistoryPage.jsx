import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useCatch, useEffectAsync } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import TableShimmer from '../common/components/TableShimmer';
import { formatShortDate } from '../common/util/formatter';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

const RechargeHistoryPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterActive, setFilterActive] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterActive !== 'all') {
        query.append('active', filterActive === 'active');
      }
      // Add more filters if needed based on API capabilities
      
      const response = await fetchOrThrow(`/api/deviceSubscriptions/details?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp, filterActive]);

  const handleRefresh = () => setTimestamp(Date.now());

  const filteredItems = items.filter((item) => {
    const searchLower = searchKeyword.toLowerCase();
    return (
      !searchKeyword ||
      (item.deviceName && item.deviceName.toLowerCase().includes(searchLower)) ||
      (item.vehicleNumber && item.vehicleNumber.toLowerCase().includes(searchLower)) ||
      (item.planTitle && item.planTitle.toLowerCase().includes(searchLower))
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (active) => (active ? 'success' : 'error');
  const getStatusLabel = (active) => (active ? 'Active' : 'Expired');

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'Recharge History']}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
        <Card elevation={1} sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '16px !important', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search Device, Vehicle, or Plan"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
              }}
              sx={{ minWidth: 250, flex: 1 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive}
                label="Status"
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </CardContent>
        </Card>

        {filteredItems.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ p: 1.5, px: 2, bgcolor: theme.palette.primary.main, color: '#fff', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Total Payment</Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(filteredItems.reduce((sum, item) => sum + (Number(item.finalAmount) || 0), 0))}
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, px: 2, bgcolor: theme.palette.secondary.main, color: '#fff', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Total Records</Typography>
              <Typography variant="h6" fontWeight="bold">
                {filteredItems.length}
              </Typography>
            </Paper>
          </Box>
        )}

        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
            {loading ? (
              <TableShimmer />
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card key={item.id} elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.deviceName}
                      </Typography>
                      <Chip
                        label={getStatusLabel(item.active)}
                        color={getStatusColor(item.active)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CarIcon fontSize="small" color="action" /> 
                      <VehicleNumberPlate number={item.vehicleNumber} small />
                    </Box>
                    
                    <Box sx={{ my: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">Plan</Typography>
                        <Typography variant="body2" fontWeight="medium">{item.planTitle}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Amount</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(item.finalAmount)}
                        </Typography>
                      </Box>
                    </Box>

                    {item.adminNotes && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <NoteIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                          {item.adminNotes}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                       <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           <EventIcon fontSize="small" color="action" />
                           <Typography variant="caption">
                             {formatShortDate(item.startDate)} - {formatShortDate(item.endDate)}
                           </Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                           <AccessTimeIcon fontSize="small" color="action" />
                           <Typography variant="caption" color="textSecondary">
                             Recharged: {formatShortDate(item.createdAt)}
                           </Typography>
                         </Box>
                       </Box>
                       <Chip
                         icon={<PaymentIcon />}
                         label={item.paymentMethod}
                         size="small"
                         variant="outlined"
                         sx={{ textTransform: 'capitalize' }}
                       />
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography textAlign="center" color="textSecondary" py={4}>
                No recharge history found.
              </Typography>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={1} sx={{ flex: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Device Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Vehicle No.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Recharge Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Validity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Note</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.main, color: '#fff' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableShimmer columns={9} />
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.deviceName}</TableCell>
                      <TableCell>
                        <VehicleNumberPlate number={item.vehicleNumber} small />
                      </TableCell>
                      <TableCell>{item.planTitle}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(item.finalAmount)}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{item.paymentMethod}</TableCell>
                      <TableCell>{formatShortDate(item.createdAt)}</TableCell>
                      <TableCell>{formatShortDate(item.startDate)} - {formatShortDate(item.endDate)}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adminNotes}>
                        {item.adminNotes || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(item.active)}
                          color={getStatusColor(item.active)}
                          size="small"
                          sx={{ height: 24 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No recharge history found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </PageLayout>
  );
};

export default RechargeHistoryPage;
