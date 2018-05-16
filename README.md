# Generic reference data editor

Webapplication using a generic form definition to edit a list of complex elements in json format on git provider.
The GUI shows a list of the elements as table, and an edit form if an element is selected.

The configuration to edit a specified sample.json file is named sample.config.json. It sets the titles, columns to display in the table and the json schema for the elements to be edited. The json schema is used to create a generic form for editing the elements. https://jsonschema.net/ can create json schema's by example (disable all assertions and annotations).

The API of the git provider is used as backend service. Supported git providers are currently:
* Bitbucket Cloud
* Bitbucket Server: as internal servers normally dont allow cross-site scripting, a https server must started which is configured to forward the api request. See below for configuration.

## Getting Started

### Prerequisites
Nodejs is installed and available on the command line.

### Installing
* clone git repository

#### With cross-site scripting (Bitbucket Cloud)
* open "dist/index.html" in browser

#### Without cross-site scripting (Bitbucket Server & Cloud)
* Install node dependencies: npm install
* adapt config.json if needed  
  port to use  
  Bitbucket server Url  
  ssl certificate:  
  if you have no certificate for the server, you can create self-signed certificate for testing with the following steps  
    openssl genrsa -out server.key 2048  
    openssl req -new -key server.key -out server.crt.req  
    openssl x509 -req -in server.crt.req -signkey server.key -out server.crt  
* Run Server: npm start

## Built With
* [angularjs](https://angularjs.org/) - web framework
* [angular-schema-form](https://github.com/json-schema-form/angular-schema-form) - angularjs component to create forms from json schema definition
* [angular-datatables](http://l-lin.github.io/angular-datatables/archives/#!/welcome) - angularjs component to create tables
* [webpack](https://webpack.js.org) - bundle scripts

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
