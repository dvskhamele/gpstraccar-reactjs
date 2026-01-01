import { useState } from 'react';
import { 
  Link, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, Grid, Box, Divider 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import SimCardIcon from '@mui/icons-material/SimCard';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha } from '@mui/material/styles';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { formatBoolean, formatShortDate } from '../../common/util/formatter';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const DeviceUsersValue = ({ deviceId }) => {
  const t = useTranslation();

  const [users, setUsers] = useState();
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCatch(async (e) => {
    e.preventDefault();
    const query = new URLSearchParams({ deviceId });
    const response = await fetchOrThrow(`/api/users?${query.toString()}`);
    setUsers(await response.json());
  });

  const getUserTheme = (user) => {
    const isDealer = !user.administrator && (user.role === 'MANAGER' || (user.userLimit && user.userLimit > 0));
    if (user.administrator) return { color: '#d32f2f', label: t('userTypeAdmin') };
    if (isDealer) return { color: '#ed6c02', label: 'Dealer' };
    return { color: '#0288d1', label: t('userTypeUser') };
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleClose = () => {
    setSelectedUser(null);
  };

  if (users) {
    return (
      <>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {users.map((user) => {
            const theme = getUserTheme(user);
            return (
              <Chip
                key={user.id}
                label={user.name}
                size="small"
                onClick={() => handleUserClick(user)}
                sx={{ 
                  cursor: 'pointer',
                  backgroundColor: alpha(theme.color, 0.1),
                  color: theme.color,
                  borderColor: alpha(theme.color, 0.3),
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha(theme.color, 0.2),
                  }
                }}
                variant="outlined"
              />
            );
          })}
        </Box>

        <Dialog open={!!selectedUser} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ 
            pb: 2, 
            backgroundColor: selectedUser ? alpha(getUserTheme(selectedUser).color, 0.05) : 'inherit',
            borderBottom: selectedUser ? `1px solid ${alpha(getUserTheme(selectedUser).color, 0.1)}` : 'none'
          }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <PersonIcon sx={{ color: selectedUser ? getUserTheme(selectedUser).color : 'inherit' }} />
                 <Typography variant="h6">{selectedUser?.name}</Typography>
               </Box>
               {selectedUser && (
                 <Chip 
                   label={getUserTheme(selectedUser).label} 
                   size="small" 
                   sx={{ 
                     backgroundColor: getUserTheme(selectedUser).color, 
                     color: '#fff', 
                     fontWeight: 'bold',
                     height: 20,
                     fontSize: '0.65rem'
                   }} 
                 />
               )}
             </Box>
          </DialogTitle>
          <DialogContent>
             {selectedUser && (
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2">{selectedUser.email}</Typography>
                  </Box>
                  <Divider />
                  {selectedUser.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2">{selectedUser.phone}</Typography>
                    </Box>
                  )}
                  {selectedUser.sim_operator && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SimCardIcon color="action" fontSize="small" />
                      <Typography variant="body2">{selectedUser.sim_operator}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {getUserTheme(selectedUser).label}
                    </Typography>
                  </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedUser.disabled ? <BlockIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
                    <Typography variant="body2" fontWeight="bold" color={selectedUser.disabled ? 'error' : 'success'}>
                       {selectedUser.disabled ? t('sharedDisabled') : t('sharedEnabled')}
                    </Typography>
                  </Box>
                  {selectedUser.expirationTime && (
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <EventIcon color="action" fontSize="small" />
                       <Typography variant="body2">
                         {t('userExpirationTime')}: {formatShortDate(selectedUser.expirationTime)}
                       </Typography>
                     </Box>
                  )}
               </Box>
             )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('sharedClose')}</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
  return (<Link href="#" onClick={loadUsers} underline="hover" sx={{ cursor: 'pointer' }}>{t('reportShow')}</Link>);
};

export default DeviceUsersValue;
