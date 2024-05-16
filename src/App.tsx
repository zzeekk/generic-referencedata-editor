import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React, { createContext, ReactElement, useMemo, useState } from 'react';
import EditForm from './EditForm';
import Login from './Login';
import Table from './Table';
import { DataProvider } from './DataProvider';
import Header from './layout/Header';
import { Router } from './layout/Router';

class HeaderConfig {
  setTitle: (string) => void;
  setElements: (ReactElement) => void;
  constructor(setTitle: (string) => void, setElements: (ReactElement) => void) {
    this.setTitle = setTitle;
    this.setElements = setElements;
  }
}

export const DataContext = createContext<DataProvider|undefined>(undefined);
export const HeaderContext = createContext<HeaderConfig|undefined>(undefined);
export const RouterContext = createContext<Router|undefined>(undefined);

const theme = createTheme({
  components: {
    // Name of the component
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export default function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider>();
  const [route, setRoute] = useState<string>();
  const router = useMemo(() => new Router(setRoute), []);
  const [headerTitle, setHeaderTitle] = useState<string>("Parameter Editor");
  const [headerElements, setHeaderElements] = useState<ReactElement>(<></>);
  const headerConfig = useMemo(() => new HeaderConfig(setHeaderTitle, setHeaderElements), []);

  return (<>
    <CssBaseline />
    <ThemeProvider theme={theme}>
    <HeaderContext.Provider value={headerConfig}>
    <DataContext.Provider value={dataProvider}>
    <RouterContext.Provider value={router}>
      <Box sx={{height: "100vh"}}>
        <Header title={headerTitle} elements={headerElements} />
        <Box sx={{height: "calc(100% - 48px)"}}>
          {!dataProvider && <Login setDataProvider={setDataProvider}/>}
          {dataProvider && router.getPath().startsWith("/edit/") && <EditForm id={router.matchParams("/edit/:id").id}/>}
          {/* keep Table element hidden in React tree to not loose state when navigating on EditForm */}
          {dataProvider && <Table show={(dataProvider && router.getPath()=="/" ? true : false)}/>}
        </Box>
      </Box>
    </RouterContext.Provider>
    </DataContext.Provider>
    </HeaderContext.Provider>
    </ThemeProvider>
  </>);
}
