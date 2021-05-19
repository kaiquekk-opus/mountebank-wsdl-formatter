# Mountebank WSDL Formatter

This is a custom formatter for [mountebank](https://github.com/bbyars/mountebank) that builds an imposter structure from an WSDL web service file or url when it is passed as a configuration file.

The formatter load the WSDL web service and try to build the stubs with xpath based on the definitions returned. It returns the built imposter object to mountebank and saves it on a json file as well so it can be more easily customized and optimized. The name of the created json file is the web service name returned from the WSDL file or url.

## Requirements
- [mountebank](http://www.mbtest.org)
- [NodeJS and npm](https://www.nodejs.org)

## Installation
````bash
npm install
````

## Usage
````bash
mb --configfile path/to/service.wsdl --formatter ./src/formatter.js
````
