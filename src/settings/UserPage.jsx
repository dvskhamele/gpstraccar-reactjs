import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
  Typography,
  Container,
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useUserAttributes from '../common/attributes/useUserAttributes';
import { useTranslation } from '../common/components/LocalizationProvider';
import SelectField from '../common/components/SelectField';
import { useAdministrator, useManager, useRestriction } from '../common/util/permissions';
import { useCatch, useEffectAsync } from '../reactHelper';
import { sessionActions } from '../store';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import SettingsMenu from './components/SettingsMenu';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import fetchOrThrow from '../common/util/fetchOrThrow';
import PageLayout from '../common/components/PageLayout';
import useSettingsStyles from './common/useSettingsStyles';

const UserPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const { classes } = useSettingsStyles();

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction('fixedEmail');

  const currentUser = useSelector((state) => state.session.user);
  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const openIdForced = useSelector((state) => state.session.server.openIdForce);
  const totpEnable = useSelector((state) => state.session.server.attributes.totpEnable);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const userAttributes = useUserAttributes(t);

  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffectAsync(async () => {
    if (id) {
      if (id === currentUser.id.toString()) {
        setItem(currentUser);
      } else {
        const response = await fetchOrThrow(`/api/users/${id}`);
        setItem(await response.json());
      }
    } else {
      setItem(admin ? { deviceLimit: 0, userLimit: 1, administrator: false } : {});
    }
  }, [id, currentUser]);

  const [deleteEmail, setDeleteEmail] = useState();
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState('');

  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      await fetchOrThrow(`/api/users/${currentUser.id}`, { method: 'DELETE' });
      navigate('/login');
      dispatch(sessionActions.updateUser(null));
    } else {
      setDeleteFailed(true);
    }
  });

  const handleGenerateTotp = useCatch(async () => {
    const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
    setItem({ ...item, totpKey: await response.text() });
  });

  const closeRevokeDialog = () => {
    setRevokeDialogOpen(false);
    setRevokeToken('');
  };

  const handleRevokeToken = useCatch(async () => {
    await fetchOrThrow('/api/session/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: revokeToken }).toString(),
    });
    closeRevokeDialog();
  });

  const handleUserTypeChange = (role) => {
    if (role === 'manager') {
      setItem({
        ...item,
        administrator: false,
        userLimit: 1,
        deviceLimit: 0,
        deviceReadonly: false,
        role: 'MANAGER', // Explicitly set role field with correct enum value
      });
    } else if (role === 'user') {
      setItem({
        ...item,
        administrator: false,
        userLimit: 0,
        deviceLimit: -1,
        deviceReadonly: true,
        role: 'USER', // Explicitly set role field with correct enum value
      });
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const attribute = searchParams.get('attribute');

  useEffect(() => {
    if (item && attribute && item.attributes && !item.attributes.hasOwnProperty(attribute)) {
      const updatedAttributes = { ...item.attributes };
      updatedAttributes[attribute] = '';
      setItem({ ...item, attributes: updatedAttributes });

      const newParams = new URLSearchParams(searchParams);
      newParams.delete('attribute');
      setSearchParams(newParams, { replace: true });
    }
  }, [item, searchParams, setSearchParams, attribute]);

  const onItemSaved = (result) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result));
    }
  };

  const handleSave = useCatch(async () => {
    let url = '/api/users';
    if (id) {
      url += `/${id}`;
    }

    const response = await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    onItemSaved(await response.json());
    navigate(-1);
  });

  const validate = () => item && item.name && item.email && (item.id || item.password) && (admin || !totpForce || item.totpKey) && item.phone && item.dob && item.dob.trim() !== '' && item.city && item.city.trim() !== '';

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser']}
    >
      {item && (
        <Container maxWidth="xl" className={classes.container}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '24px', marginBottom: '24px' }}>
            <Box sx={{ flex: '1' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedRequired')}</Typography>
                  {admin && (
                    <FormControl fullWidth margin="normal">
                      <Select
                        value={item.role ? (item.role === 'MANAGER' ? 'manager' : item.role === 'USER' ? 'user' : item.role) : ((item.userLimit > 0 && item.deviceLimit === 0) ? 'manager' : 'user')}
                        onChange={(e) => handleUserTypeChange(e.target.value)}
                      >
                        <MenuItem value="manager">Dealer</MenuItem>
                        <MenuItem value="user">{t('userTypeUser')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  <TextField
                    label={t('sharedName')}
                    value={item.name || ''}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label={t('userEmail')}
                    value={item.email || ''}
                    onChange={(e) => setItem({ ...item, email: e.target.value })}
                    fullWidth
                    margin="normal"
                    disabled={fixedEmail && item.id === currentUser.id}
                  />
                  {!openIdForced && (
                    <TextField
                      label={t('userPassword')}
                      type="password"
                      value={item.password || ''}
                      onChange={(e) => setItem({ ...item, password: e.target.value })}
                      fullWidth
                      margin="normal"
                    />
                  )}
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={item.dob ? item.dob.split('T')[0] : ''}
                    onChange={(e) => setItem({ ...item, dob: new Date(e.target.value).toISOString() })}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  {totpEnable && (
                    <FormControl fullWidth margin="normal">
                      <OutlinedInput
                        readOnly
                        value={item.totpKey || ''}
                        endAdornment={(
                          <InputAdornment position="end">
                            <IconButton size="small" edge="end" onClick={handleGenerateTotp}>
                              <CachedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" edge="end" onClick={() => setItem({ ...item, totpKey: null })}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )}
                      />
                    </FormControl>
                  )}
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedPermissions')}</Typography>
                  <TextField
                    label={t('userExpirationTime')}
                    type="date"
                    value={item.expirationTime ? item.expirationTime.split('T')[0] : ''}
                    onChange={(e) => setItem({ ...item, expirationTime: new Date(e.target.value).toISOString() })}
                    disabled={!manager}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                  <TextField
                    label={t('userDeviceLimit')}
                    type="number"
                    value={item.deviceLimit || 0}
                    onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                    disabled={!admin}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label={t('userUserLimit')}
                    type="number"
                    value={item.userLimit || 0}
                    onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                    disabled={!admin}
                    fullWidth
                    margin="normal"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={(
                              <Switch
                                checked={item.disabled || false}
                                onChange={(e) => setItem({ ...item, disabled: e.target.checked })}
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
                            disabled={!manager}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.administrator || false} onChange={(e) => setItem({ ...item, administrator: e.target.checked })} />}
                            label={t('userAdmin')}
                            disabled={!admin}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.readonly || false} onChange={(e) => setItem({ ...item, readonly: e.target.checked })} />}
                            label={t('serverReadonly')}
                            disabled={!manager}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.deviceReadonly || false} onChange={(e) => setItem({ ...item, deviceReadonly: e.target.checked })} />}
                            label={t('userDeviceReadonly')}
                            disabled={!manager}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.limitCommands || false} onChange={(e) => setItem({ ...item, limitCommands: e.target.checked })} />}
                            label={t('userLimitCommands')}
                            disabled={!manager}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.disableReports || false} onChange={(e) => setItem({ ...item, disableReports: e.target.checked })} />}
                            label={t('userDisableReports')}
                            disabled={!manager}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={item.fixedEmail || false} onChange={(e) => setItem({ ...item, fixedEmail: e.target.checked })} />}
                            label={t('userFixedEmail')}
                            disabled={!manager}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedPreferences')}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Contact Number"
                        value={item.phone || ''}
                        onChange={(e) => setItem({ ...item, phone: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="City"
                        value={item.city || ''}
                        onChange={(e) => setItem({ ...item, city: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Select
                          value={item.map || 'locationIqStreets'}
                          onChange={(e) => setItem({ ...item, map: e.target.value })}
                          sx={{ height: '100%' }}  /* Ensure full height in paired container */
                        >
                          {mapStyles.filter((style) => style.available).map((style) => (
                            <MenuItem key={style.id} value={style.id}>
                              <Typography component="span">{style.title}</Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {false && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <Select
                            value={item.coordinateFormat || 'dd'}
                            onChange={(e) => setItem({ ...item, coordinateFormat: e.target.value })}
                          >
                            <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                            <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                            <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {false && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <SelectField
                            label={t('sharedTimezone')}
                            value={item.attributes?.timezone}
                            onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, timezone: e.target.value } })}
                            endpoint="/api/server/timezones"
                            keyGetter={(it) => it}
                            titleGetter={(it) => it}
                          />
                        </FormControl>
                      </Grid>
                    )}
                    {false && (
                      <Grid item xs={12}>
                        <TextField
                          label={t('mapPoiLayer')}
                          value={item.poiLayer || ''}
                          onChange={(e) => setItem({ ...item, poiLayer: e.target.value })}
                          fullWidth
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            {/*
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('sharedLocation')}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={t('positionLatitude')}
                        type="number"
                        step="any"
                        value={item.latitude || 0}
                        onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={t('positionLongitude')}
                        type="number"
                        step="any"
                        value={item.longitude || 0}
                        onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={t('serverZoom')}
                        type="number"
                        step="any"
                        value={item.zoom || 0}
                        onChange={(e) => setItem({ ...item, zoom: Number(e.target.value) })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          const { lng, lat } = map.getCenter();
                          setItem({
                            ...item,
                            latitude: Number(lat.toFixed(6)),
                            longitude: Number(lng.toFixed(6)),
                            zoom: Number(map.getZoom().toFixed(1)),
                          });
                        }}
                      >
                        {t('mapCurrentLocation')}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            */}
            {/*
            <Grid item xs={12}>
              <EditAttributesAccordion
                attribute={attribute}
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={{ ...commonUserAttributes, ...userAttributes }}
                focusAttribute={attribute}
              />
            </Grid>
            */}
            {registrationEnabled && item.id === currentUser.id && !manager && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="error">{t('userDeleteAccount')}</Typography>
                    <TextField
                      label={t('userEmail')}
                      value={deleteEmail || ''}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      error={deleteFailed}
                      helperText={deleteFailed && t('userDeleteConfirm')}
                      fullWidth
                      margin="normal"
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDelete}
                      startIcon={<DeleteForeverIcon />}
                    >
                      {t('userDeleteAccount')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {/*
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{t('userRevokeToken')}</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setRevokeDialogOpen(true)}
                  >
                    {t('userRevokeToken')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            */}
          </Grid>
          <div className={classes.buttons}>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={!item}
            >
              {t('sharedCancel')}
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={!item || !validate()}
            >
              {t('sharedSave')}
            </Button>
          </div>
          <Dialog open={revokeDialogOpen} onClose={closeRevokeDialog} fullWidth maxWidth="xs">
            <DialogContent>
              <TextField
                value={revokeToken}
                onChange={(e) => setRevokeToken(e.target.value)}
                label={t('userToken')}
                autoFocus
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeRevokeDialog}>{t('sharedCancel')}</Button>
              <Button onClick={handleRevokeToken} disabled={!revokeToken} variant="contained">
                {t('userRevokeToken')}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
    </PageLayout>
  );
};

export default UserPage;
