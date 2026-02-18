import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  TextField,
  Button,
  Switch,
  Grid,
  Chip,
  CardHeader,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GoogleIcon from '@mui/icons-material/Google';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { MuiFileInput } from 'mui-file-input';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SelectField from '../common/components/SelectField';
import deviceCategories from '../common/util/deviceCategories';
import { useTranslation } from '../common/components/LocalizationProvider';
import useDeviceAttributes from '../common/attributes/useDeviceAttributes';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';
import { speedFromKnots, speedToKnots, speedUnitString } from '../common/util/converter';
import SettingsMenu from './components/SettingsMenu';
import useCommonDeviceAttributes from '../common/attributes/useCommonDeviceAttributes';
import { useCatch } from '../reactHelper';
import QrCodeDialog from '../common/components/QrCodeDialog';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { mapIcons, mapIconKey } from '../map/core/preloadImages';

const pngIcons = import.meta.glob('../resources/images/icons/*.png', { eager: true });

const getDeviceIconUrl = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return pngIcons[path]?.default || mapIcons[mapIconKey(category)];
};

const isPngIcon = (category) => {
  const path = `../resources/images/icons/${category}.png`;
  return !!pngIcons[path];
};

const DevicePage = () => {
  const t = useTranslation();

  const admin = useAdministrator();
  const userId = useSelector((state) => state.session.user.id);

  const speedUnit = useAttributePreference('speedUnit', 'kn');

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [searchParams] = useSearchParams();
  const uniqueId = searchParams.get('uniqueId');

  const [item, setItem] = useState(uniqueId ? { uniqueId, disabled: true } : null);
  const [showQr, setShowQr] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [allSubscriptionPlans, setAllSubscriptionPlans] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [groups, setGroups] = useState([]);

  const handleDeviceSave = () => {
    // No-op: Subscription is now handled by the main /api/devices call
  };

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await fetchOrThrow('/api/subscriptionPlans');
        const plans = await response.json();
        setAllSubscriptionPlans(plans);
        setSubscriptionPlans(plans.filter((plan) => plan.active));
      } catch {
        // Handle error, e.g., show a notification
      }
    };
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchOrThrow('/api/groups');
        setGroups(await response.json());
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };
    if (admin) {
      fetchGroups();
    }
  }, [admin]);

  useEffect(() => {
    if (item?.id) {
      const fetchSubscriptionHistory = async () => {
        try {
          const response = await fetchOrThrow(`/api/deviceSubscriptions/details?deviceId=${item.id}`);
          const history = await response.json();
          // Sort by startDate descending
          history.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setSubscriptionHistory(history.slice(0, 3));
        } catch (e) {
          console.error(e);
        }
      };
      fetchSubscriptionHistory();
    }
  }, [item?.id]);

  const handlePlanChange = (planId) => {
    const selectedPlan = subscriptionPlans.find((p) => p.id === planId);
    if (selectedPlan) {
      setItem({ 
        ...item, 
        planId: selectedPlan.id, 
        amount: selectedPlan.price 
      });
    }
  };

  const handleFileInput = useCatch(async (newFile) => {
    setImageFile(newFile);
    if (newFile && item?.id) {
      const response = await fetchOrThrow(`/api/devices/${item.id}/image`, {
        method: 'POST',
        body: newFile,
      });
      setItem({ ...item, attributes: { ...item.attributes, deviceImage: await response.text() } });
    } else if (!newFile) {
      // eslint-disable-next-line no-unused-vars
      const { deviceImage, ...remainingAttributes } = item.attributes || {};
      setItem({ ...item, attributes: remainingAttributes });
    }
  });

  const validate = () => {
    const basicValidation = item
      && item.name
      && item.uniqueId
      && item.phone
      && item.sim_operator
      && item.model
      && item.contact
      && (item.category && item.category !== 'default')
      && item.vehicle_number;

    if (item?.id) {
      return basicValidation;
    }

    return basicValidation
      && item.planId
      && item.amount
      && item.paymentMethod;
  };

  const formatVehicleNumber = (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 10)}`;
    }
    return formatted.slice(0, 12);
  };

  const formatDevice = (device) => {
    const {
      planId, amount, paymentMethod, adminNotes, ...rest
    } = device;
    return rest;
  };

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      defaultItem={{ disabled: true }}
      validate={validate}
      onItemSaved={handleDeviceSave}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice']}
      formatItem={formatDevice}
    >
      {item && (
        <>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedRequired')}</Typography>
                  <TextField
                    value={item.name || ''}
                    onChange={(event) => setItem({ ...item, name: event.target.value })}
                    label={t('sharedName')}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    value={item.uniqueId || ''}
                    onChange={(event) => setItem({ ...item, uniqueId: event.target.value })}
                    label="IMEI Number"
                    helperText={t('deviceIdentifierHelp')}
                    disabled={Boolean(uniqueId)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    value={item.phone || ''}
                    onChange={(event) => setItem({ ...item, phone: event.target.value })}
                    label={t('deviceSimNumber')}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    select
                    value={item.sim_operator || ''}
                    onChange={(event) => setItem({ ...item, sim_operator: event.target.value })}
                    label="SIM Operator"
                    fullWidth
                    margin="normal"
                  >
                    {['Airtel', 'Jio', 'Vi', 'BSNL'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Autocomplete
                    freeSolo
                    forcePopupIcon
                    options={[
                      'G-17',
                      'Teltonika FMB920', 'Teltonika FMB120', 'Teltonika FMB640', 'Teltonika FMC130',
                      'Concox GT06N', 'Concox WeTrack2', 'Concox GV20', 'Concox BL10',
                      'Queclink GV200', 'Queclink GV300', 'Queclink GL300',
                      'SinoTrack ST-901', 'SinoTrack ST-906', 'SinoTrack ST-902',
                      'Coban TK103', 'Coban TK303', 'Coban TK102',
                      'WanWay S20', 'WanWay G19', 'WanWay EV02',
                      'TKStar TK905', 'TKStar TK915', 'TKStar TK906',
                      'Ruptela FM-Tco4', 'Ruptela FM-Eco4', 'Ruptela FM-Pro4',
                      'Mictrack MT700', 'Mictrack MT600',
                      'Suntech ST310U', 'Suntech ST4310',
                      'Meitrack T333', 'Meitrack MVT380', 'Meitrack T1',
                      'Jimi GV40', 'Jimi JM-VG03', 'Jimi JM-LG01',
                      'Bway BW08', 'Bway BW02',
                      'Cargo Unit', 'CalAmp LMU-2630',
                    ].sort()}
                    value={item.model || ''}
                    onChange={(event, newValue) => setItem({ ...item, model: newValue })}
                    onInputChange={(event, newInputValue) => setItem({ ...item, model: newInputValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Device Model Name"
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                  <TextField
                    value={item.contact || ''}
                    onChange={(event) => setItem({ ...item, contact: event.target.value })}
                    label={t('deviceContact')}
                    fullWidth
                    margin="normal"
                  />
                  <Autocomplete
                    value={deviceCategories.find((c) => c === (item.category || 'default')) || 'default'}
                    onChange={(_, newValue) => setItem({ ...item, category: newValue })}
                    options={deviceCategories.slice().sort((a, b) => {
                      const nameA = t(`category${a.replace(/^\w/, (c) => c.toUpperCase())}`);
                      const nameB = t(`category${b.replace(/^\w/, (c) => c.toUpperCase())}`);
                      return nameA.localeCompare(nameB);
                    })}
                    getOptionLabel={(option) => t(`category${option.replace(/^\w/, (c) => c.toUpperCase())}`)}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={getDeviceIconUrl(option)}
                            alt=""
                            style={{
                              width: 24,
                              height: 24,
                              marginRight: 8,
                              objectFit: 'contain',
                              filter: isPngIcon(option) ? undefined : 'brightness(0)',
                            }}
                          />
                          {t(`category${option.replace(/^\w/, (c) => c.toUpperCase())}`)}
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('deviceCategory')}
                        margin="normal"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              {item.category && (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1, ml: 1 }}>
                                  <img
                                    src={getDeviceIconUrl(item.category || 'default')}
                                    alt=""
                                    style={{
                                      width: 24,
                                      height: 24,
                                      objectFit: 'contain',
                                      filter: isPngIcon(item.category || 'default') ? undefined : 'brightness(0)',
                                    }}
                                  />
                                </Box>
                              )}
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                  />
                  <Autocomplete
                    value={groups.find((group) => group.id === item.groupId) || null}
                    onChange={(_, newValue) => setItem({ ...item, groupId: newValue ? newValue.id : 0 })}
                    options={groups}
                    getOptionLabel={(option) => option.name || t('groupNoGroup')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('groupParent')}
                        margin="normal"
                        fullWidth
                      />
                    )}
                    fullWidth
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Subscription & Payment</Typography>
                  <SelectField
                    value={item.planId || ''}
                    onChange={(e) => handlePlanChange(Number(e.target.value))}
                    data={subscriptionPlans}
                    label="Subscription Plan"
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    value={subscriptionPlans.find(p => p.id === item.planId)?.price || 0}
                    label="Plan Price"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    value={subscriptionPlans.find(p => p.id === item.planId)?.duration_days || 0}
                    label="Duration (days)"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    value={item.amount || 0}
                    onChange={(e) => setItem({ ...item, amount: Number(e.target.value) })}
                    label="Final Price"
                    type="number"
                    fullWidth
                    margin="normal"
                    required={!!item.planId}
                    error={!!item.planId && !item.amount}
                  />
                  <TextField
                    select
                    value={item.paymentMethod || ''}
                    onChange={(e) => setItem({ ...item, paymentMethod: e.target.value })}
                    label="Payment Method"
                    fullWidth
                    margin="normal"
                    required={!!item.planId}
                    error={!!item.planId && !item.paymentMethod}
                  >
                    {[
                      { id: 'phonepe', name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png' },
                      { id: 'googlepay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/2560px-Google_Pay_Logo_%282020%29.svg.png' },
                      { id: 'paytm', name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png' },
                      { id: 'upiscanner', name: 'UPI Scanner', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png' },
                      { id: 'cash', name: 'Cash', icon: <AttachMoneyIcon style={{ color: '#4caf50', fontSize: 30 }} /> },
                    ].map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30 }}>
                            {option.logo ? (
                              <img src={option.logo} alt={option.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              option.icon
                            )}
                          </Box>
                          <Typography>{option.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                                  <TextField
                                    value={item.adminNotes || ''}
                                    onChange={(e) => setItem({ ...item, adminNotes: e.target.value })}
                                    label="Admin Note (Optional)"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    margin="normal"
                                  />
                  
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedExtra')}</Typography>
                  <TextField
                    value={item.vehicle_number || ''}
                    onChange={(event) => setItem({ ...item, vehicle_number: formatVehicleNumber(event.target.value) })}
                    label="Vehicle Number"
                    placeholder="XXXX-XX-XXXX"
                    helperText="Format: RJ26-NC-2365"
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Initial Odometer (km)"
                    type="number"
                    value={item.attributes?.odometer ? item.attributes.odometer / 1000 : ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setItem({
                        ...item,
                        attributes: {
                          ...item.attributes,
                          odometer: value ? Number(value) * 1000 : 0,
                        },
                      });
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label={`${t('attributeSpeedLimit')} (${speedUnitString(speedUnit, t)})`}
                    type="number"
                    value={item.attributes?.speedLimit ? speedFromKnots(item.attributes.speedLimit, speedUnit) : ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      const attributes = { ...item.attributes };
                      if (value) {
                        attributes.speedLimit = speedToKnots(Number(value), speedUnit);
                      } else {
                        delete attributes.speedLimit;
                      }
                      setItem({ ...item, attributes });
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Fuel Consumption (L/100km)"
                    type="number"
                    value={item.attributes?.fuelConsumption || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setItem({
                        ...item,
                        attributes: {
                          ...item.attributes,
                          fuelConsumption: value ? Number(value) : undefined,
                        },
                      });
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={item.disabled || false}
                        onChange={(event) => setItem({ ...item, disabled: event.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f44336',
                          },
                          '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    )}
                    label={item.disabled ? t('sharedDisabled') : 'Enabled'}
                    disabled={!admin}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowQr(true)}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {t('sharedQrCode')}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
          <Box sx={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {item.id && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Subscription History</Typography>
                {subscriptionHistory.length > 0 ? (
                  <Grid container spacing={2}>
                    {subscriptionHistory.map((subscription) => {
                      const formatCustomDate = (dateString) => {
                        if (!dateString) return 'N/A';
                        const date = new Date(dateString);
                        const day = date.getDate();
                        const month = date.toLocaleString('en-GB', { month: 'short' });
                        const year = date.getFullYear();
                        return `${day} ${month} ${year}`;
                      };

                      return (
                        <Grid item xs={12} sm={6} md={12} key={subscription.id}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardHeader
                              title={subscription.planTitle || 'Unknown Plan'}
                              titleTypographyProps={{ variant: 'subtitle1' }}
                              action={(
                                <Chip
                                  label={subscription.active ? 'Active' : 'Inactive'}
                                  color={subscription.active ? 'success' : 'error'}
                                  size="small"
                                />
                              )}
                            />
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Final Price:</strong> {subscription.finalAmount}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Recharge At:</strong> {formatCustomDate(subscription.startDate)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Expire At:</strong> {formatCustomDate(subscription.endDate)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  <strong>Payment:</strong> {subscription.paymentMethod}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography>No subscription recharge history</Typography>
                )}
              </CardContent>
            </Card>
            )}
            {item.id && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('attributeDeviceImage')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {t('sharedUpload')}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileInput(e.target.files[0]);
                          }
                        }}
                      />
                    </Button>
                    {imageFile && (
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {imageFile.name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
            exclude={['odometer', 'speedLimit']}
          />
        </>
      )}
      <QrCodeDialog open={showQr} onClose={() => setShowQr(false)} />
    </EditItemView>
  );
};

export default DevicePage;
