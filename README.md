# Generic reference data editor

This is a web application using a Json Schema definition to edit a list of Json records.
The schema and data can be loaded using different backend providers.
The GUI shows a list of the records as table, and an edit form if a record is selected.

The Json Schema to edit a specified <dataset-name>.json file is named <dataset-name>.schema.json by convention.
The Json Schema is used to create a generic form for editing a record. The form supports arrays and nested objects.
https://jsonschema.net/ can create json schema's by example (disable all assertions and annotations).

The schma file needs an additional "$metadata" attribute which can take the following properties:
* `idCols` (required): list of primary key column(s) to uniquely identify records of the dataset
* `tableCols` (required): list of columns to display in the table

The backend provider can be selected on startup. Supported backend providers are currently:
* BitbucketCloud: connect to a Bitbucket Cloud git repository.
* BitbucketServer: connect to a Bitbucket on-prem git repository. As internal servers normally dont allow cross-site scripting, a https server be must started which is configured to forward the api request. See below for configuration.
* Upload: upload a local Json Schema and Json file, and download the edited Json file again.

## Usage
* download latest release zip file: `wget https://github.com/zzeekk/generic-referencedata-editor/releases/latest/download/editor.zip`
* unzip
* open `build/index.html` in browser
* choose provider and enter informations to access data file in repository, or upload schema and data
* edit data records
* commit data to repository or download data using buttons in the upper right of the table view

### without cross-site scripting (Bitbucket Server)
Start a local https server to forward api request to repository server:
* complete basic stpeps above
* make sure nodejs is installed
* create `config.json` with following properties:  
  - `port`: port to use
  - `bitbucketServerUrl` Bitbucket server Url  
  - `sslKeyFile` + `sslCertFile`: if you have no certificate for the server, you can create self-signed certificate for testing with the following steps:
    - openssl genrsa -out server.key 2048  
    - openssl req -new -key server.key -out server.crt.req
    - openssl x509 -req -in server.crt.req -signkey server.key -out server.crt  
* run server: `node serve.cjs`
* open "https://localhost:<port>" in browser, choose Provider BitbucketServer

Side note: with Azure Function App its possible to easily deploy managed Azure Functions, which could be used as backend api for forwarding requests. An example is included in Azurefunc.tgz.

## Build
* make sure nodejs & npm are installed
* clone git repository
* install yarn package manager: `npm install --global yarn`
* `yarn build`
* check `build` folder for artifacts

## Built With
* react
* react-schema-form
* ka-table
* vite

## Open Points
* Add new / clone / delete records
* Show detailed form validation error message

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
