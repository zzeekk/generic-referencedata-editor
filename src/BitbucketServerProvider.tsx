import { Box, Button, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { DataProvider } from "./DataProvider";
import { isArray, isObject } from "./util/helpers";

interface LoginInput {
  project: string;
  repo: string;
  branch: string;
  path: string;
  user: string;
  password: string;
}

function LoginForm(props: {provider: BitbucketServerProvider, defaults: LoginInput, login: (LoginInput) => void, setProvider: (DataProvider) => void}) {
  const { handleSubmit, register, formState } = useForm<LoginInput>({      
    defaultValues: props.defaults,
  });
  const { errors } = formState;

  function submit(x: LoginInput) {
    props.login(x);
    props.setProvider(props.provider);
  }

  return (<>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate sx={{ mt: 1 }}>
      <TextField margin="dense" size="small" fullWidth label="Email Address" {...register("user", {required: true})} error={!!errors.user}/>
      <TextField margin="dense" size="small" fullWidth label="Password" type="password" {...register("password", {required: true})} error={!!errors.password}/>
      <TextField margin="dense" size="small" fullWidth label="Project" {...register("project", {required: true})} error={!!errors.project}/>
      <TextField margin="dense" size="small" fullWidth label="Repository" {...register("repo", {required: true})} error={!!errors.repo}/>
      <TextField margin="dense" size="small" fullWidth label="Branch" {...register("branch", {required: true})} error={!!errors.branch}/>
      <TextField margin="dense" size="small" fullWidth label="Path" {...register("path", {required: true})} error={!!errors.path}/>
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Start</Button>
    </Box>
  </>)  
}

export class BitbucketServerProvider extends DataProvider {  

  // bitbucket server, according to https://docs.atlassian.com/bitbucket-server/rest/5.8.0/bitbucket-rest.html
  // must use proxy because of CORS
  private baseUrl = "/bitbucketServerProxy/rest/api/1.0"

  // config variables
  private loginInput?: LoginInput;
  private authVal?: string;

  // cache
  private data?: Promise<[]>;
  private config?: Promise<{}>;
  private dataCommitId?: Promise<string>;

  getName() {
    return 'BitbucketServer'
  };

  private getSchemaPath(): string {
    if (this.loginInput!.path?.match(/\.json+$/)) {
      return this.loginInput!.path.replace(/\.json+$/, ".config.json"); // replace extension .json -> .config.json  
    } else {
      throw Error( "Data path must have extension .json, but is "+this.loginInput!.path);
    }
  }

	private makeRequest(path: string = "", method: string = 'GET', body?: any): Promise<any> {
		// if project isn't specified, user name is taken as project
		const project = this.loginInput!.project || this.loginInput!.user;
		const repoUrl = this.baseUrl + "/projects/" + project + "/repos/" + this.loginInput!.repo;
    // prepare headers
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", this.authVal!);
    // fetch
    return fetch(repoUrl+path, {method: method, headers: headers, body: (body ? JSON.stringify(body) : undefined)})
    .catch( response => {
      console.error("makeRequest "+this.loginInput!.path, response);
      return Promise.reject( "makeRequest Http error: " + response.status + (response.data!=""? " ("+response.data+")" : ""));
    })
	};
	
  getLoginForm(params: any, setProvider: (DataProvider) => void) {
    return <LoginForm provider={this} defaults={params as LoginInput} login={x => this.login(this,x)} setProvider={setProvider}/>
  };

  login(that: BitbucketServerProvider, input: LoginInput) {
    that.loginInput = input;
    that.authVal = "Basic " + btoa( that.loginInput!.user + ":" + that.loginInput!.password );
    // test request
    that.calcDataId()
  };

  getData() {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    if(!this.data) {
      this.data = this.makeRequest("/raw/"+this.loginInput!.path+"?at="+this.loginInput!.branch)
      .then( response => response.json())
      .then( data => (isArray(data) ? data as []: Promise.reject("getData: response is not a JSon Array")));
      this.rememberDataCommitId();
    }
    return this.data;
  };

  getSchema() {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    if(!this.config) {
      this.config = this.makeRequest("/raw/"+this.getSchemaPath()+"?at="+this.loginInput!.branch)
      .then( response => response.json())
      .then( data => (isObject(data) ? data as {}: Promise.reject("getSchema: response is not a JSon Object")));
    }
    return this.config;
  };

  rememberDataCommitId() {
    this.dataCommitId = this.makeRequest("/commits?path="+this.loginInput!.path+"&until="+this.loginInput!.branch+"&limit=1")
    .then( response => response.json())
    .then( data => {
      console.log("got data commitId", data);
      return (data.values.length>0 ? data.values[0].id : null);
    });
  }
  
  getDataName() {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    return this.loginInput!.path.match(/([^\/]*)\.json$/)![1];
  };

  canSaveData(): boolean {
    return true;
  }

  saveData(msg: string) {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    Promise.all([this.data, this.dataCommitId]).then(([data,commitId]) => {
      var postData = new FormData();
      postData.append("content", JSON.stringify(data,undefined,2));
      postData.append("message", msg);
      postData.append("branch", this.loginInput!.branch!);     
			postData.append("sourceCommitId", commitId!);
      this.dataCommitId = this.makeRequest("/browse/"+this.loginInput!.path, "PUT", postData)
      .then( response => response.json())
      .then( data => {
        console.log("new commitId", data);
        return data.id;
      });
      this.changedRecords = []; // reset changed records
    });
  };
}
