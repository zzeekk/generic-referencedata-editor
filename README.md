# Generic reference data editor

Webapplication using a Json Schema definition to edit a list of complex elements in Json format using different backend providers.
The GUI shows a list of the elements as table, and an edit form if an element is selected.

The Json Schema to edit a specified sample.json file is named sample.schema.json. It sets the titles, The Json Schema is used to create a generic form for editing the elements. https://jsonschema.net/ can create json schema's by example (disable all assertions and annotations).

Supported backend providers are currently:
* BitbucketCloud
* BitbucketServer: as internal servers normally dont allow cross-site scripting, a https server be must started which is configured to forward the api request. See below for configuration.
* Upload: upload a local Json Schema and Json file, and download the edited Json file again.

TODO: additional configurations ($metadata)

## Getting Started

### Prerequisites
Nodejs is installed and available on the command line.

### Installing
* clone git repository

#### With cross-site scripting (Bitbucket Cloud)
* open "dist/index.html" in browser

#### Without cross-site scripting (Bitbucket Server & Cloud)
* Install node dependencies: yarn install
* create config.json with following properties:  
  - "port": port to use
  - "bitbucketServerUrl" Bitbucket server Url  
  - "sslKeyFile" + "sslCertFile": if you have no certificate for the server, you can create self-signed certificate for testing with the following steps:
    - openssl genrsa -out server.key 2048  
    - openssl req -new -key server.key -out server.crt.-req  
    - openssl x509 -req -in server.crt.req -signkey server.key -out server.crt  
* Run Server: yarn run

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
