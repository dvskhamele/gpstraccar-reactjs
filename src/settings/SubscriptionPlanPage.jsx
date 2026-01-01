import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch, useEffectAsync } from '../reactHelper';
import SettingsMenu from './components/SettingsMenu';
import PageLayout from '../common/components/PageLayout';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const SubscriptionPlanPage = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { classes } = useSettingsStyles();

  const { id } = useParams();

  const [item, setItem] = useState(null);
  useEffectAsync(async () => {
    if (id) {
      const response = await fetchOrThrow(`/api/subscriptionPlans/${id}`);
      const data = await response.json();
      setItem({
        ...data,
        price_value: data.price, // Map backend 'price' to frontend 'price_value'
      });
    } else {
      setItem({
        name: '',
        duration_days: 30,
        price_value: 0,
        active: true,
      });
    }
  }, [id]);

  const handleSave = useCatch(async () => {
    let url = '/api/subscriptionPlans';
    if (id) {
      url += `/${id}`;
    }

    // Send data in the exact format expected by the backend
    const requestBody = {
      id: item.id,
      name: item.name,
      duration_days: item.duration_days,
      price: item.price_value,
      active: item.active // Use active from frontend state
    };

    await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    navigate('/settings/subscription-plans');
  });

  const validate = () => item && item.name && item.duration_days && item.price_value !== undefined;

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsSubscriptionPlans', id ? 'sharedEdit' : 'sharedAdd']}
    >
      {item && (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('sharedDetails')}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('sharedName')}
                    value={item.name}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('subscriptionDurationDays')}
                    type="number"
                    value={item.duration_days}
                    onChange={(e) => setItem({ ...item, duration_days: parseInt(e.target.value) })}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('subscriptionPrice')}
                    type="number"
                    value={item.price_value}
                    onChange={(e) => setItem({ ...item, price_value: parseFloat(e.target.value) })}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={item.active}
                        onChange={(e) => setItem({ ...item, active: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
                            backgroundColor: '#f44336',
                          },
                        }}
                      />
                    }
                    label={item.active ? t('sharedActive') : t('sharedInactive')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box className={classes.buttons} sx={{ mt: 2 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              {t('sharedCancel')}
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={!validate()}
            >
              {t('sharedSave')}
            </Button>
          </Box>
        </Box>
      )}
    </PageLayout>
  );
};

export default SubscriptionPlanPage;