import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import BlockIcon from '@mui/icons-material/Block';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';
import { useCatch, useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import { TextField } from '@mui/material';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import DashboardStats from '../common/components/DashboardStats';
import UserRow from './UserRow';
import UserCard from './UserCard';
import { useMediaQuery } from '@mui/material';

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/users?excludeAttributes=true');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const filterBySearch = (user) => {
    if (!searchKeyword) {
      return true;
    }
    const keyword = searchKeyword.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(keyword))
      || (user.email && user.email.toLowerCase().includes(keyword))
      || (user.phone && user.phone.toLowerCase().includes(keyword))
    );
  };

  const filterByType = (user) => {
    if (filterType === 'all') {
      return true;
    }
    const isManager = !user.administrator && (user.role === 'MANAGER' || (user.userLimit && user.userLimit > 0));
    if (filterType === 'admin') {
      return user.administrator;
    }
    if (filterType === 'manager') {
      return isManager;
    }
    if (filterType === 'user') {
      return !user.administrator && !isManager;
    }
    return false;
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUsers']}
      stats={<DashboardStats />}
      toolbar={(
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder={t('sharedSearch')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            sx={{ minWidth: 200, maxWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('sharedType')}</InputLabel>
            <Select
              label={t('sharedType')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
                          <MenuItem value="all">{t('sharedAll') || 'All'}</MenuItem>
                          <MenuItem value="admin">{t('userTypeAdmin')}</MenuItem>
                          <MenuItem value="manager">Dealer</MenuItem>
                          <MenuItem value="user">{t('userTypeUser')}</MenuItem>
                        </Select>          </FormControl>
        </Box>
      )}
    >
      {isMobile ? (
        <Box sx={{ pb: 10 }}>
          {!loading ? items
              .filter((u) => temporary || !u.temporary)
              .filter(filterBySearch)
              .filter(filterByType)
              .map((item) => (
                <UserCard
                  key={item.id}
                  item={item}
                  manager={manager}
                  actionLogin={actionLogin}
                  actionConnections={actionConnections}
                  setTimestamp={setTimestamp}
                />
          )) : (<Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress /></Box>)}
        </Box>
      ) : (
      <TableContainer sx={{ 
        maxHeight: 'calc(100vh - 180px)', 
        borderRadius: '8px', 
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'auto',
        boxShadow: theme.shadows[2],
        position: 'relative'
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
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700, width: 48 }} />
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> {t('sharedName')}
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" /> {t('userEmail')}
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" /> Phone
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon fontSize="small" /> {t('sharedType')}
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BlockIcon fontSize="small" /> {t('sharedDisabled')}
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" /> {t('userExpirationTime')}
                </Box>
              </TableCell>
              <TableCell sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }} className={classes.columnAction}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <SettingsIcon fontSize="small" />
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? items
              .filter((u) => temporary || !u.temporary)
              .filter(filterBySearch)
              .filter(filterByType)
              .map((item) => (
                <UserRow
                  key={item.id}
                  item={item}
                  manager={manager}
                  actionLogin={actionLogin}
                  actionConnections={actionConnections}
                  setTimestamp={setTimestamp}
                />
              )) : (<TableShimmer columns={8} endAction />)}
          </TableBody>
          <TableFooter sx={{ position: 'sticky', bottom: 0, backgroundColor: theme.palette.background.paper, zIndex: 2 }}>
            <TableRow>
              <TableCell colSpan={8} align="right" sx={{ backgroundColor: theme.palette.background.paper }}>
                <FormControlLabel
                  control={(
                    <Switch
                      value={temporary}
                      onChange={(e) => setTemporary(e.target.checked)}
                      size="small"
                    />
                  )}
                  label={t('userTemporary')}
                  labelPlacement="start"
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      )}
      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;

