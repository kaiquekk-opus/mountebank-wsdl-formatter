# Mountebank WSDL Formatter

This is a custom formatter for [mountebank](https://github.com/bbyars/mountebank) that builds an imposter structure from a WSDL web service file or url when it is passed as a configuration file.

The formatter loads the WSDL web service and tries to build the stubs with xpath predicates based on the definitions found. It returns the built imposter object to mountebank and saves it on a json file as well so it can be more easily customized and optimized. The name of the created json file is the web service name returned from the WSDL file or url.

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
