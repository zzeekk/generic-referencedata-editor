import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, AlertColor, Avatar, Box, MenuItem, Select, Snackbar, Typography } from "@mui/material";
import React, { useState } from 'react';
import { BitbucketCloudProvider } from './BitbucketCloudProvider';
import { UploadProvider } from './UploadProvider';
import { BitbucketServerProvider } from './BitbucketServerProvider';

export default function Login(props: {setDataProvider: (DataProvider) => void}) {

  const [providerIdx, setProviderIdx] = useState(0);
  const queryParameters = {};
  new URLSearchParams(window.location.search).forEach((v,k) => queryParameters[k] = v);

  const [snackbar, showSnackbar] = useState<{msg: string, severity: AlertColor}>();

  function closeSnackbar() {
    showSnackbar(undefined);
  }

  const showError = (msg: string) => {
    showSnackbar({msg: msg, severity: "error"})
  }

  const dataProviderList = [new BitbucketServerProvider(), new BitbucketCloudProvider(), new UploadProvider()];

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', width: '100%'}}>
      <Box sx={{ flex: 1 }}></Box>
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px', alignSelf: 'center'}}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">Login</Typography>
        <Select id="provider" size="small" fullWidth value={providerIdx} onChange={ev => setProviderIdx(ev.target.value as number)} sx={{mt: 1}}>
          {dataProviderList.map((p,idx) => <MenuItem key={idx.toString()} value={idx}>{p.getName()}</MenuItem>)}
        </Select>
        {dataProviderList[providerIdx].getLoginForm(queryParameters, props.setDataProvider, showError)}
      </Box>
      <Box sx={{ flex: 1 }}></Box>
      {snackbar && (
        <Snackbar open={true} autoHideDuration={5000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
        </Snackbar>
      )}
    </Box>
  )
};