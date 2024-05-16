import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Box, MenuItem, Select, Typography } from "@mui/material";
import React from 'react';
import { BitbucketCloudProvider } from './BitbucketCloudProvider';
import { UploadProvider } from './UploadProvider';

export default function Login(props: {setDataProvider: (DataProvider) => void}) {

  const [providerIdx, setProviderIdx] = React.useState(0);
  const queryParameters = {};
  new URLSearchParams(window.location.search).forEach((v,k) => queryParameters[k] = v);

  const dataProviderList = [new BitbucketCloudProvider(), new UploadProvider()];

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
        {dataProviderList[providerIdx].getLoginForm(queryParameters, props.setDataProvider)}
      </Box>
      <Box sx={{ flex: 1 }}></Box>
    </Box>
  )
};

/*

      setParams: function(p_provider,p_user,p_project,p_repo,p_branch,p_dataPath,p_password) {
        // save to session
        if (!providerList[p_provider]) console.error( "Provider " + p_provider + " unbekannt");
        sessionStorage.provider = p_provider;
        sessionStorage.user = p_user;
        sessionStorage.project = p_project;
        sessionStorage.repo = p_repo;
        sessionStorage.branch = p_branch;
        sessionStorage.dataPath = p_dataPath;
        if (!p_dataPath.match(/\.json+$/)) console.error( "Data path muss Extension .json haben.");
        sessionStorage.configPath = p_dataPath.replace(/\.json+$/, ".config.json"); // replace extension .json -> .config.json
        sessionStorage.authVal = "Basic " + $base64.encode( p_user + ":" + p_password );
      },
      loadConfig: function(renew) {
        // buffer the promise as it is used multiple times...
        return (renew ? null : this.prConfig) || (this.prConfig = getProvider().loadJSONData( sessionStorage.configPath, sessionStorage ));
      },
			isLoggedIn: function() { return "authVal" in sessionStorage; },
      logout: function() { sessionStorage.removeItem("authVal"); },
    }
*/