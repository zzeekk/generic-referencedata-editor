import { Download, Save } from "@mui/icons-material";
import { Alert, AlertColor, Box, IconButton, Snackbar } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DataContext, HeaderContext, RouterContext } from "./App";
import { RECORD_ID } from "./DataProvider";
import CommitDialog from "./components/CommitDialog";
import DataTable from "./components/DataTable";
import { SearchField } from "./components/SearchField";

export default function Table(props: {show: boolean}) {
  const [schema, setSchema] = useState({});
  const [columns, setColumns] = useState([]);
  const [commitDialog, showCommitDialog] = useState(false);
  const [,forceUpdate] = useState({});
  const [snackbar, showSnackbar] = useState<{msg: string, severity: AlertColor}>();
  const provider = useContext(DataContext)!;
  const router = useContext(RouterContext)!;
  const headerConfig = useContext(HeaderContext)!;
  
  useEffect(() => {provider.getSchema().then(s => {
    setSchema(s);
    setColumns(provider.getMetadata(s,'tableCols'));
  })}, []);

  const [data, setData] = useState<[]>([]);
  useEffect(() => {provider.getData().then(setData)}, []);
  useEffect(() => console.log(data), [data]);

  function commit() {
    showCommitDialog(true);
  }

  function save(msg?: string) {
    showCommitDialog(false); // also refreshes button state
    // if msg is empty, commit dialog was cancelled
    console.log("commit data msg="+msg)
    if (msg) try {
      provider.saveData(msg);
      showSnackbar({msg: "Commit successfull", severity: "info"})
    } catch (e) {
      showSnackbar({msg: String(e), severity: "error"})
    }
  }  

  function download() {
    provider.downloadData()
    forceUpdate({}); // refresh button state
  }

  function closeSnackbar() {
    showSnackbar(undefined);
  }

  const [searchText, setSearchText] = useState<string>();
  useEffect(() => {
    if (props.show) {
      headerConfig.setTitle(provider.getDataName() + " Editor");
      headerConfig.setElements(<>
        {provider.canSaveData() && (
          <IconButton key="save" edge="start" sx={{marginLeft: "5px"}} color={(provider?.changed() ? "error" : "inherit")} aria-label="menu" data-all={data} onClick={x => commit()}>
            <Save />
          </IconButton>
        )}
        <IconButton key="download" edge="start" sx={{marginLeft: "5px"}} color={(provider?.changed() ? "error" : "inherit")} aria-label="menu" data-all={data} onClick={x => download()}>
          <Download />
        </IconButton>
        <SearchField setSearchText={setSearchText} init={searchText}/>
      </>);
    }  
  }, [provider, provider?.changed(), router.getPath(), props.show])

  // TODO: enrich column with DataType, add hidden columns that can be enabled by config button
  return (<Box height="100%" display={(props.show ? "block" : "none")}>
    <DataTable data={data} columns={columns} navigator={(row) => `../edit/${row[RECORD_ID]}`} keyAttr={RECORD_ID} searchText={searchText} selectedRows={provider.changedRecords} />
    {commitDialog && <CommitDialog callback={save}></CommitDialog>}
    {snackbar && (
      <Snackbar open={true} autoHideDuration={5000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.msg}</Alert>
      </Snackbar>      
    )}
  </Box>)
}