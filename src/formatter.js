'use strict';

// Function that builds the operations results to be used in the response body
function buildWsdlResponse (res, nsArr) {
    let line = '';
    const name = Object.keys(res[0])[0];
    // If the current result field is a composed one, call the function recursively
    if (Array.isArray(res[0][name])) {
        const nextLine = buildWsdlResponse(res[0][name], nsArr);
        nsArr = nextLine[1];
        // Add the namespace only if the object is not empty
        if (Object.entries(res[1]).length === 0) {
            line += `<${name}>${nextLine[0]}</${name}>`;
        }
        else {
            line += `<${res[1].short}:${name}>${nextLine[0]}</${res[1].short}:${name}>`;
            nsArr.push(`${res[1].short}=${res[1].full}`);
        }
    }
    else {
        // Add the result field name and an example according to the field's type to the line string
        for (const field in res[0]) {
            // Add the namespace only if the object is not empty
            if (Object.entries(res[1]).length === 0) {
                line += `<${field}>${res[0][field]}</${field}>`;
            }
            else {
                line += `<${res[1].short}:${field}>${res[0][field]}</${res[1].short}:${field}>`;
            }
        }
        if (Object.entries(res[1]).length !== 0) {
            nsArr.push(`${res[1].short}=${res[1].full}`);
        }
    }
    return [line, nsArr];
}

// Function that generates a default example according to the entry's type
function getExampleGivenType (type) {
    switch (type.substring(type.lastIndexOf(':') + 1)) {
        case 'string':
            return '?';
        case 'boolean':
            return false;
        case 'dateTime':
            return '0000-00-00T00:00:00';
        case 'date':
            return '0000-00-00';
        case 'time':
            return '00:00:00';
        default:
            return 0;
    }
}

// Function to deal with the input and output objects from the soap module
function treatOperationObject (obj) {
    // Object to store the found namespaces
    const ns = {},
        // Object to store the found attributes
        values = {};
    for (const elem in obj) {
        if (elem === 'targetNSAlias') {
            ns.short = obj.targetNSAlias;
        }
        else if (elem === 'targetNamespace') {
            ns.full = obj.targetNamespace;
        }
        else if (typeof obj[elem] === 'object') {
            values[elem] = treatOperationObject(obj[elem]);
        }
        else {
            values[elem] = getExampleGivenType(obj[elem]);
        }
    }
    return ([values, ns]);
}

function load (options) {
    const fs = require('fs-extra'),
        soap = require('soap'),
        vkBeautify = require('vkbeautify');

    // Make the soap request from the wsdl
    return soap.createClientAsync(options.configfile).then(client => {
        const description = client.describe(),
            // The filename is the same as the name of the wsdl service
            filename = Object.keys(description)[0],
            service = Object.keys(description[filename])[0],
            operations = description[filename][service],
            imposters = {
                port: 9090,
                protocol: 'http',
                stubs: []
            };
        for (const op in operations) {
            const predicates = [],
                resps = treatOperationObject(operations[op].output);
            predicates.push({
                xpath: {
                    selector: `//${op}`
                },
                exists: {
                    body: true
                }
            });
            // Build the stubs response from the treated output object
            const respData = buildWsdlResponse(resps, []);
            let body = '<soapenv:Envelope';
            // Add the namespaces to the soap envelope, if there are any
            respData[1].forEach(ns => {
                body += ` xmlns:${ns}`;
            });
            body += `><soapenv:Header/><soapenv:Body>${respData[0]}</soapenv:Body></soapenv:Envelope>`;
            const response = [{
                is: {
                    body: vkBeautify.xml(body)
                }
            }];
            imposters.stubs.push({ predicates: predicates, responses: response });
        }
        // Write the built imposter structure to a json file
        fs.writeFileSync(`${filename}.json`, JSON.stringify(imposters, null, '\t'));
        return { imposters: [imposters] };
    }).catch(e => {
        console.error('Unable to build imposters from Wsdl configfile.');
        throw e;
    });
}

function save (options, imposters) {
    const fs = require('fs-extra');
    fs.writeFileSync(options.savefile, JSON.stringify(imposters, null, 2));
}

module.exports = {
    load,
    save
};
