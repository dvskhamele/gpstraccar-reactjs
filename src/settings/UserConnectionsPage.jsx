import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Tab, Tabs, Box,
} from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import CheckboxConnectionsController from '../common/components/CheckboxConnectionsController';

const TabPanel = (props) => {
  const {
    children, value, index, ...other
  } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const UserConnectionsPage = () => {
  const t = useTranslation();
  const { id } = useParams();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const connectionConfigs = [
    {
      label: t('deviceTitle'),
      endpointAll: '/api/devices?all=true',
      endpointLinked: `/api/devices?userId=${id}`,
      keyLink: 'deviceId',
      titleGetter: (it) => `${it.name} (${it.uniqueId})`,
    },
    {
      label: t('settingsGroups'),
      endpointAll: '/api/groups?all=true',
      endpointLinked: `/api/groups?userId=${id}`,
      keyLink: 'groupId',
    },
    {
      label: t('sharedGeofences'),
      endpointAll: '/api/geofences?all=true',
      endpointLinked: `/api/geofences?userId=${id}`,
      keyLink: 'geofenceId',
    },
    {
      label: t('sharedNotifications'),
      endpointAll: '/api/notifications?all=true',
      endpointLinked: `/api/notifications?userId=${id}`,
      keyLink: 'notificationId',
      titleGetter: (it) => formatNotificationTitle(t, it, true),
    },
    {
      label: t('sharedCalendars'),
      endpointAll: '/api/calendars?all=true',
      endpointLinked: `/api/calendars?userId=${id}`,
      keyLink: 'calendarId',
    },
    {
      label: t('settingsUsers'),
      endpointAll: '/api/users?all=true',
      endpointLinked: `/api/users?userId=${id}`,
      keyLink: 'managedUserId',
    },
    {
      label: t('sharedComputedAttributes'),
      endpointAll: '/api/attributes/computed?all=true',
      endpointLinked: `/api/attributes/computed?userId=${id}`,
      keyLink: 'attributeId',
      titleGetter: (it) => it.description,
    },
    {
      label: t('sharedDrivers'),
      endpointAll: '/api/drivers?all=true',
      endpointLinked: `/api/drivers?userId=${id}`,
      keyLink: 'driverId',
      titleGetter: (it) => `${it.name} (${it.uniqueId})`,
    },
    {
      label: t('sharedSavedCommands'),
      endpointAll: '/api/commands?all=true',
      endpointLinked: `/api/commands?userId=${id}`,
      keyLink: 'commandId',
      titleGetter: (it) => it.description,
    },
    {
      label: t('sharedMaintenance'),
      endpointAll: '/api/maintenance?all=true',
      endpointLinked: `/api/maintenance?userId=${id}`,
      keyLink: 'maintenanceId',
    },
  ];

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser', 'sharedConnections']}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          {connectionConfigs.map((config) => <Tab label={config.label} key={config.label} />)}
        </Tabs>
      </Box>
      {connectionConfigs.map((config, index) => (
        <TabPanel value={value} index={index} key={config.label}>
          <CheckboxConnectionsController
            baseId={id}
            keyBase="userId"
            endpointAll={config.endpointAll}
            endpointLinked={config.endpointLinked}
            keyLink={config.keyLink}
            titleGetter={config.titleGetter}
          />
        </TabPanel>
      ))}
    </PageLayout>
  );
};

export default UserConnectionsPage;
