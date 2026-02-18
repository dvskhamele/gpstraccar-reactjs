import { useState } from 'react';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, Switch, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import { prefixString } from '../common/util/stringUtils';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import TableShimmer from '../common/components/TableShimmer';
import fetchOrThrow from '../common/util/fetchOrThrow';

const typeDescriptions = {
  deviceOnline: 'When device comes online',
  deviceOffline: 'When device goes offline',
  deviceMoving: 'When device starts moving',
  deviceStopped: 'When device stops moving',
  deviceOverspeed: 'When device exceeds speed limit',
  deviceFuelDrop: 'When there is a sharp fuel drop',
  deviceUnknown: 'When device status is unknown',
  geofenceEnter: 'When device enters a geofence',
  geofenceExit: 'When device exits a geofence',
  ignitionOn: 'When ignition is turned on',
  ignitionOff: 'When ignition is turned off',
  alarm: 'When a configured alarm is triggered',
  maintenance: 'When device maintenance is due',
  commandResult: 'When a command returns a result',
  driverChanged: 'When the driver is changed',
  text: 'When a text message is received',
};

const NotificationsPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [types, setTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const [typesResponse, itemsResponse] = await Promise.all([
        fetchOrThrow('/api/notifications/types'),
        fetchOrThrow('/api/notifications'),
      ]);
      setTypes(await typesResponse.json());
      setItems(await itemsResponse.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleToggle = async (checked, type) => {
    setLoading(true);
    try {
      if (checked) {
        await fetchOrThrow('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type.type,
            attributes: {},
            notificators: 'web',
            always: true,
            description: t(prefixString('event', type.type)),
          }),
        });
      } else {
        const item = items.find((i) => i.type === type.type);
        if (item) {
          await fetchOrThrow(`/api/notifications/${item.id}`, { method: 'DELETE' });
        }
      }
    } finally {
      setTimestamp(Date.now());
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotifications']}
    >
      {loading ? (
        <TableShimmer columns={2} />
      ) : (
        <List>
          {types.map((type) => {
            const item = items.find((i) => i.type === type.type);
            return (
              <ListItem key={type.type}>
                <ListItemText
                  primary={t(prefixString('event', type.type))}
                  secondary={typeDescriptions[type.type] || ''}
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={!!item}
                    onChange={(e) => handleToggle(e.target.checked, type)}
                  />
                  {item && (
                  <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/settings/notification/${item.id}`)}>
                    <EditIcon />
                  </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}
    </PageLayout>
  );
};

export default NotificationsPage;
