import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => ({
  table: {
    marginBottom: theme.spacing(10),
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: theme.shadows[2],
  },
  tableHead: {
    backgroundColor: theme.palette.primary.main,
  },
  tableHeadCell: {
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontSize: '0.75rem',
    color: '#ffffff',
  },
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
  container: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-evenly',
    '& > *': {
      flexBasis: '33%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '& .MuiFormControl-root, & .MuiInputBase-root': {
      marginBottom: theme.spacing(1),
    },
  },
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: theme.spacing(2),
  },
  formSection: {
    marginBottom: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(3),
    boxShadow: theme.shadows[1],
  },
  verticalActions: {
    display: 'flex',
    flexDirection: 'column',
  },
}));
