import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, styled } from "@mui/material";
import { useState } from "react";
import { DataProvider } from "./DataProvider";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});  

function readJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
      var fr = new FileReader();  
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsText(file);
      console.log("got "+file.name)      
  }).then(result => JSON.parse(result as string));    
}

function readSchemaFile(file: File): Promise<{}> {
  return readJsonFile(file).then(s => {
    s["$metadata"].name = file.name.match(/^([^\/\.]*).*\.json$/)![1];
    console.log("dataset name "+s["$metadata"].name);
    return s;
  });
}

function readDataFile(file: File): Promise<[]> {
  return readJsonFile(file);
}  

function LoginForm(props: {provider: UploadProvider, login: (provider: UploadProvider, schema: {}, data: []) => void, setProvider: (DataProvider) => void, showError: (string) => void}) {  
  const [schema, setSchema] = useState<any>();
  const [data, setData] = useState<[]>();

  function submit() {
    props.login(props.provider, schema!, data!);
    props.setProvider(props.provider);
  }
  
  function getUploadColor(value) { 
    return (value ? "success" : "primary" )
  }  

  return (<>
    <Box sx={{ mt: 1 }}>
      <Button component="label" fullWidth color={getUploadColor(schema)} role={undefined} variant="contained" sx={{ mt: 1, mb: 1 }} startIcon={<UploadFileOutlinedIcon/>}>Upload Schema<VisuallyHiddenInput type="file" accept=".json" onChange={e => readSchemaFile(e.target.files![0]).catch(e => props.showError(String(e))).then(x => setSchema(x!))}/></Button>
      <Button component="label" fullWidth color={getUploadColor(data)} role={undefined} variant="contained" sx={{ mt: 1, mb: 1 }} startIcon={<UploadFileOutlinedIcon />}>Upload Data<VisuallyHiddenInput type="file" accept=".json" onChange={e => readDataFile(e.target.files![0]).catch(e => props.showError(String(e))).then(x => setData(x!))}/></Button>
      <Button type="submit" fullWidth disabled={(data && schema ? false : true)} variant="contained" onClick={submit} sx={{ mt: 3, mb: 2 }}>Start</Button>
    </Box>
  </>)  
}

export class UploadProvider extends DataProvider {

  constructor() {
    super();
  }

  // cache
  data?: Promise<[]>;
  schema?: Promise<{}>;
  datasetName?: string;

  getName() {
    return 'Upload'
  };

  getLoginForm(params: any, setProvider: (DataProvider) => void, showError: (string) => void) {
    return <LoginForm provider={this} login={this.login} setProvider={setProvider} showError={showError}/>
  };

  login(that: UploadProvider, schema: {}, data: []) {    
    that.schema = Promise.resolve(schema);
    that.data = Promise.resolve(data);
    that.calcDataId();
    that.datasetName = that.getMetadata(schema,"name");
  };

  getData() {
    return this.data!;
  };

  getSchema() {
    return this.schema!;
  };
  
  getDataName() {
    return this.datasetName!;
  };

  canSaveData(): boolean {
    return true;
  }

  saveData(msg: string): Promise<void> {
    throw new Error("saveData not implemented");
  };
}
