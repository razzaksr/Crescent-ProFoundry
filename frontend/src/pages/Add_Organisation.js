import React from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { Mail, Phone, CalendarCheck, Building2, MapPin } from 'lucide-react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import dayjs from 'dayjs';
import Admin_Dashboard from '../components/AdminDash';
import { createOrg } from '../axios';

const Add_Organisation = () => {
  const [orgName, setOrgName] = React.useState('');
  const [orgAddress, setOrgAddress] = React.useState('');
  const [orgEmail, setOrgEmail] = React.useState('');
  const [orgContact, setOrgContact] = React.useState('');
  const [orgDate, setOrgDate] = React.useState('');
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [openError, setOpenError] = React.useState(false);

  const handleSubmit = async () => {
    if (!orgName || !orgAddress || !orgEmail || !orgContact || !orgDate) {
      setOpenError(true);
      return;
    }

    const formattedDate = dayjs(orgDate).format('DD/MM/YYYY');

    const payload = {
      org_name: orgName,
      org_address: orgAddress,
      org_email: orgEmail,
      org_contact: orgContact,
      org_associated_date: formattedDate,
      mod_id: '',
    };

    try {
      await createOrg(payload);
      setOpenSuccess(true);
      handleClear();
    } catch (err) {
      console.error(err);
      setOpenError(true);
    }
  };

  const handleClear = () => {
    setOrgName('');
    setOrgAddress('');
    setOrgEmail('');
    setOrgContact('');
    setOrgDate('');
  };

  const handleCloseSnackbar = () => {
    setOpenSuccess(false);
    setOpenError(false);
  };

  return (
    <>
      <Admin_Dashboard />
      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              <span >Add </span>
              <span style={{  padding: '2px 6px', borderRadius: '6px' }}>
                Organisation
              </span>
            </Typography>
            <Typography variant="subtitle2">Fill the details of the organisation</Typography>
          </Box>

          {/* Form Fields */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Building2 size={20} color="#0c83c8" style={{ marginBottom: 20 }} />
              <TextField
                fullWidth
                label="Organization Name"
                variant="outlined"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                sx={{ mb: 3 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={20} color="#0c83c8" style={{marginBottom: 20}} />
              <TextField
                fullWidth
                label="Organization Address"
                variant="outlined"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                sx={{ mb: 3 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mail size={20} color="#0c83c8" style={{marginBottom: 20 }} />
              <TextField
                fullWidth
                label="Organization Email"
                variant="outlined"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                sx={{ mb: 3 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone size={20} color="#0c83c8" style={{marginBottom: 20 }} />
              <TextField
                fullWidth
                label="Contact Number"
                variant="outlined"
                value={orgContact}
                onChange={(e) => setOrgContact(e.target.value)}
                sx={{ mb: 3 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarCheck size={20} color="#0c83c8" style={{ marginBottom: 20 }} />
              <TextField
                fullWidth
                label="Associated Date"
                type="date"
                variant="outlined"
                value={orgDate}
                onChange={(e) => setOrgDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
              />
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={{ px: 4, borderRadius: 3 }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  px: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #0c83c8, #fc7a46)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #fc7a46, #0c83c8)',
                  },
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Snackbar Notifications */}
        <Snackbar
          open={openSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            onClose={handleCloseSnackbar}
            sx={{ width: '100%' }}
          >
            Organization successfully created!
          </Alert>
        </Snackbar>

        <Snackbar
          open={openError}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            onClose={handleCloseSnackbar}
            sx={{ width: '100%' }}
          >
            Please fill all required fields!
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Add_Organisation;
