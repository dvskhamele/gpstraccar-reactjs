import {
  useMediaQuery, Paper, Typography, Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import LogoImage from './LogoImage';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.sidebar.background,
    paddingBottom: theme.spacing(5),
    width: theme.dimensions.sidebarWidth,
    [theme.breakpoints.down('lg')]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down('sm')]: {
      width: '0px',
    },
  },
  customerCare: {
    marginTop: theme.spacing(3),
    color: theme.palette.sidebar.text,
    textAlign: 'center',
    padding: theme.spacing(0, 2),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    background: theme.palette.background.default,
    padding: theme.spacing(2),
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 25, 0, 0),
    },
  },
  form: {
    maxWidth: theme.spacing(52),
    padding: theme.spacing(5),
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 24,
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.08)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    },
  },
}));

const LoginLayout = ({ children }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        {!useMediaQuery(theme.breakpoints.down('lg')) && (
          <>
            <LogoImage />
            <Box className={classes.customerCare}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Customer Care
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                +91 6393585583
              </Typography>
            </Box>
          </>
        )}
      </div>
      <div className={classes.paper}>
        <form className={classes.form}>
          {children}
        </form>
      </div>
    </main>
  );
};

export default LoginLayout;
