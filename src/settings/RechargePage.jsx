import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Box,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EventIcon from '@mui/icons-material/Event';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import { useCatch, useEffectAsync } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { formatShortDate } from '../common/util/formatter';
import TableShimmer from '../common/components/TableShimmer';
import VehicleNumberPlate from '../common/components/VehicleNumberPlate';

const RechargePage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const server = useSelector((state) => state.session.server);
  const devices = useSelector((state) => state.devices.items);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredItems = items.filter((item) => devices[item.deviceId]);

  const handleCopy = async () => {
    const textToCopy = server.upiId;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        setSnackbarOpen(true);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setSnackbarOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/deviceSubscriptions/details');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (active) => (active ? 'success' : 'error');
  const getStatusLabel = (active) => (active ? 'Active' : 'Expired');

  const upiQrImage = server.upiQrImage;
  const upiId = server.upiId;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['Recharge Account']}>
      <Container maxWidth="md" className={classes.container}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Scan to Recharge
            </Typography>
            
            {upiQrImage ? (
              <Box display="flex" justifyContent="center" mb={2}>
                <img
                  src={upiQrImage.startsWith('http') ? upiQrImage : `/${upiQrImage}`}
                  alt="UPI QR Code"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </Box>
            ) : (
              <Typography color="error" align="center">
                QR Code not available
              </Typography>
            )}

            <Typography variant="subtitle1" align="center" gutterBottom>
              UPI ID:
            </Typography>
            
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Typography variant="body1" style={{ marginRight: '8px', fontWeight: 'bold' }}>
                {upiId || 'Not set'}
              </Typography>
              {upiId && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                >
                  Copy
                </Button>
              )}
            </Box>

            <Typography variant="body2" color="textSecondary" align="center">
              Please scan the QR code or use the UPI ID to make the payment.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          Recharge History
        </Typography>

        {isMobile ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {loading ? (
              <TableShimmer />
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.deviceName}
                      </Typography>
                      <Chip
                        label={getStatusLabel(item.active)}
                        color={getStatusColor(item.active)}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DirectionsCarIcon fontSize="small" color="action" />
                      <VehicleNumberPlate number={item.vehicleNumber} small />
                    </Box>
                    
                    <Box bgcolor={theme.palette.action.hover} p={1.5} borderRadius={1} mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="textSecondary">Plan</Typography>
                        <Typography variant="body2" fontWeight="medium">{item.planTitle}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Amount</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(item.finalAmount)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary">
                          {formatShortDate(item.createdAt)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary">
                          Exp: {formatShortDate(item.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography align="center" color="textSecondary" py={3}>
                No history found.
              </Typography>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Vehicle Number</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableShimmer columns={7} />
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.deviceName}</TableCell>
                      <TableCell>
                        <VehicleNumberPlate number={item.vehicleNumber} small />
                      </TableCell>
                      <TableCell>{item.planTitle}</TableCell>
                      <TableCell>{formatCurrency(item.finalAmount)}</TableCell>
                      <TableCell>{formatShortDate(item.createdAt)}</TableCell>
                      <TableCell>{formatShortDate(item.endDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(item.active)}
                          color={getStatusColor(item.active)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          UPI ID copied to clipboard!
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default RechargePage;
