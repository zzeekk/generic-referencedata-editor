import { Box, Button } from "@mui/material";
import { useState } from "react";
import { DataProvider } from "./DataProvider";
import { FileOpenOutlined } from '@mui/icons-material';
import { isArray } from "./util/helpers";

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
    if (!s["$metadata"]) throw new Error(`${file.name} is not a schema file`);
    s["$metadata"].name = file.name.match(/^([^\/\.]*).*\.json$/)![1];
    console.log("dataset name "+s["$metadata"].name);
    return s;
  });
}

function readDataFile(file: File): Promise<[]> {
  return readJsonFile(file).then(s => {
    if (!isArray(s)) throw new Error(`${file.name} is not a data file, e.g. it does not contain a json array as top-level element`);
    return s as [];
  });
}  

function LoginForm(props: {provider: LocalFileProvider, login: (provider: LocalFileProvider, schema: {}, data: [], dataHandle: FileSystemFileHandle) => void, setProvider: (DataProvider) => void, showError: (string) => void}) {  
  const [schema, setSchema] = useState<{}>();
  const [dataHandle, setDataHandle] = useState<FileSystemFileHandle>();
  const [data, setData] = useState<[]>();

  function submit() {
    props.login(props.provider, schema!, data!, dataHandle!);
    props.setProvider(props.provider);
  }
  
  function getUploadColor(value) { 
    return (value ? "success" : "primary" )
  }  

  function getLocalFileHandle(): Promise<FileSystemFileHandle> {
    const options = {}
    options['types'] = [{description: 'Json Files', accept: { 'application/json': ['.json'] }}];    
    options['mode'] = 'readwrite';
    const unsafeWindow: any = window;
    return unsafeWindow.showOpenFilePicker(options).then(arr => arr[0]);
  }

  function setSchemaFileHandle(handle: FileSystemFileHandle) {
    handle.getFile().then(file => readSchemaFile(file))
    .then(schema => setSchema(schema))
    .catch(e => props.showError(e.toString()))
  }


  function setDataFileHandle(handle: FileSystemFileHandle) {
    handle.getFile().then(file => readDataFile(file))
    .then(data => {
      setDataHandle(handle)
      setData(data)
    })
    .catch(e => props.showError(e.toString()))
  }

  const supportsLocalFileSystem = 'showOpenFilePicker' in self;

  return (<>
    <Box sx={{ mt: 1 }}>
      {supportsLocalFileSystem && <>      
        <Button component="label" fullWidth color={getUploadColor(schema)} role={undefined} variant="contained" sx={{ mt: 1, mb: 1 }} startIcon={<FileOpenOutlined/>} onClick={e => getLocalFileHandle().catch(e => props.showError(String(e))).then(x => setSchemaFileHandle(x!))}>
          Select Schema File
        </Button>
        <Button component="label" fullWidth color={getUploadColor(data)} role={undefined} variant="contained" sx={{ mt: 1, mb: 1 }} startIcon={<FileOpenOutlined />} onClick={e => getLocalFileHandle().catch(e => props.showError(String(e))).then(x => setDataFileHandle(x!))}>
          Select Data File
        </Button>
        <Button type="submit" fullWidth disabled={(data && schema ? false : true)} variant="contained" onClick={submit} sx={{ mt: 3, mb: 2 }}>Start</Button>
        </>
      }
      {!supportsLocalFileSystem && "LocalFileSystem not supported in this Browser, use e.g. Chrome or Edge."}
    </Box>
  </>)  
}

export class LocalFileProvider extends DataProvider {

  constructor() {
    super();
  }

  // cache
  dataHandle?: Promise<FileSystemFileHandle>;
  schemaHandle?: Promise<FileSystemFileHandle>;
  data?: Promise<[]>;
  schema?: Promise<{}>;
  datasetName?: Promise<string>;

  getName() {
    return 'Local File'
  };

  getLoginForm(params: any, setProvider: (DataProvider) => void, showError: (string) => void) {
    return <LoginForm provider={this} login={this.login} setProvider={setProvider} showError={showError}/>
  };

  login(that: LocalFileProvider, schema: {}, data: [], dataHandle: FileSystemFileHandle) {    
    that.dataHandle = Promise.resolve(dataHandle);
    that.schema = Promise.resolve(schema)
    that.data = Promise.resolve(data);
    that.calcDataId();
    that.datasetName = Promise.resolve(that.getMetadata(schema, "name"));
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

  canSaveMsg(): boolean {
    return false;
  }

  saveData(msg?: string): Promise<void> {
    return this.dataHandle!
    .then(handle => handle.createWritable())
    .then(writeable => 
      this.data!
      .then(d =>
        this.stringifyData(d)
        .then(dStr => 
          writeable.write(dStr)
          .then(_ =>
            writeable.close()
            .then(_ => {
              this.changedRecords = []; // reset changed records
            })
          ) 
        )
      )
    )
  };
}
