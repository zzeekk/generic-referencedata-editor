# Project Title

Webapplication using a generic form definition to edit a list of complex elements in json format on version control system

## Getting Started

### Prerequisites

Nodejs is installed and available on the command line.

### Installing

* Install node dependencies: npm install
* adapt config.json if needed
** configure ssl certificate for https or create self-signed certificate for testing with the following steps
*** openssl genrsa -out server.key 2048
*** openssl req -new -key server.key -out server.crt.req
*** openssl x509 -req -in server.crt.req -signkey server.key -out server.crt
* Run Server: npm start

## Built With

* [angularjs](http://www.dropwizard.io/1.0.2/docs/) - The web framework used

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
