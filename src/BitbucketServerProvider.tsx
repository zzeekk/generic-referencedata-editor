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

interface RequestParams {
  path: string
  method?: string
  body?: any
}

function LoginForm(props: {provider: BitbucketServerProvider, defaults: LoginInput, login: (LoginInput) => Promise<void>, setProvider: (DataProvider) => void, showError: (string) => void}) {
  const { handleSubmit, register, formState } = useForm<LoginInput>({      
    defaultValues: props.defaults,
  });
  const { errors } = formState;

  function submit(x: LoginInput) {
    Promise.resolve()
    .then(() => props.login(x))
    .then(() => props.setProvider(props.provider))
    .catch(e => {
      props.showError(String(e));
      props.provider.reset();
      throw e;
    });
  }

  return (<>
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate sx={{ mt: 1 }}>
      <TextField margin="dense" size="small" fullWidth label="UserId" {...register("user", {required: true})} error={!!errors.user}/>
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
  // must use proxy at localhost /api/server because of CORS
  private baseUrl = "/api/server/rest/api/1.0"

  // config variables
  private loginInput?: LoginInput;
  private authVal?: string;

  // cache
  private data?: Promise<[]>;
  private config?: Promise<{}>;
  private dataCommitId?: Promise<string>;

  getName() {
    return 'BitbucketServer'
  }

  reset() {
    this.data = undefined;
    this.config = undefined;
  }

  private getSchemaPath(): string {
    if (this.loginInput!.path?.match(/\.json+$/)) {
      return this.loginInput!.path.replace(/\.json+$/, ".schema.json"); // replace extension .json -> .schema.json  
    } else {
      throw Error( "Data path must have extension .json, but is "+this.loginInput!.path);
    }
  }

	private makeRequest(request: RequestParams): Promise<any> {
    const {path, method, body} = request;
		// if project isn't specified, user name is taken as project
		const project = this.loginInput!.project || this.loginInput!.user;
		const repoUrl = this.baseUrl + "/projects/" + project + "/repos/" + this.loginInput!.repo;
    console.log("makeRequest", repoUrl+path)
    // prepare headers
    const headers = new Headers();
    headers.append("Authorization", this.authVal!);
    // fetch
    return fetch(repoUrl+path, {method: method, headers: headers, body: body})
    .then( response => {
      if (response.ok) return response;
      else throw Error( "Http error: " + response.status + " " + response.statusText + " (" + method + " "+repoUrl+path +")");
    })
	};
	
  getLoginForm(params: any, setProvider: (DataProvider) => void, showError: (string) => void) {
    return <LoginForm provider={this} defaults={params as LoginInput} login={x => this.login(this,x)} setProvider={setProvider} showError={showError}/>
  };

  login(that: BitbucketServerProvider, input: LoginInput): Promise<void> {
    console.log("login");
    that.loginInput = input;
    that.authVal = "Basic " + btoa( that.loginInput!.user + ":" + that.loginInput!.password );
    // test request
    return that.calcDataId()
  };

  getData() {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    if(!this.data) {
      this.data = this.makeRequest({path: "/raw/"+this.loginInput!.path+"?at="+this.loginInput!.branch})
      .then( response => response.json())
      .then( data => {
        if (isArray(data)) return data as [];
        else throw Error("getData: response is not a JSon Array");
      })
      .then( data => {
        // side effect
        return this.rememberDataCommitId().then(() => data);
      })
    }
    return this.data;
  };

  getSchema() {
    if(!this.loginInput) throw Error( "Connection parameters not set.");
    if(!this.config) {
      this.config = this.makeRequest({path: "/raw/"+this.getSchemaPath()+"?at="+this.loginInput!.branch})
      .then( response => response.json())
      .then( data => {
        if (isObject(data)) return data as {}
        else throw Error("getSchema: response is not a JSon Object");
      });
    }
    return this.config;
  };

  rememberDataCommitId() {
    this.dataCommitId = this.makeRequest({path: "/commits?path="+this.loginInput!.path+"&until="+this.loginInput!.branch+"&limit=1"})
    .then( response => response.json())
    .then( data => {
      if (data.values.length>0) {
        console.log("got data commitId: " + data.values[0].id);
        return data.values[0].id;
      } else throw Error("Got no commitId in response: "+ data);
    });
    return this.dataCommitId;
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
    return Promise.all([this.data, this.dataCommitId]).then(([data,commitId]) => {
      var postData = new FormData();
      postData.append("content", JSON.stringify(data,undefined,2));
      postData.append("message", msg);
      postData.append("branch", this.loginInput!.branch!);     
			postData.append("sourceCommitId", commitId!);
      this.dataCommitId = this.makeRequest({path: "/browse/"+this.loginInput!.path, method: "PUT", body: postData})
      .then( response => response.json())
      .then( data => {
        console.log("new commitId", data);
        this.changedRecords = []; // reset changed records
        return data.id;
      });
      return this.dataCommitId.then(() => {});
    });
  };
}
