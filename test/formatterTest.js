'use strict';

const assert = require('assert'),
    fs = require('fs-extra'),
    path = require('path'),
    formatter = require('../src/formatter');

describe('formatter', function () {
    describe('#load', function () {
        it('should load an imposter structure from wsdl file', async function () {
            await formatter.load({ configfile: path.join(__dirname, 'templates/service.wsdl') });
            assert.ok(fs.existsSync('LuhnChecker.json'));
            fs.unlinkSync('LuhnChecker.json');
        });
    });

    describe('#save', function () {
        it('should save the file as is', async function () {
            const config = {
                imposters: [{
                    port: 3000,
                    protocol: 'test',
                    name: 'name'
                }]
            };
            formatter.save({ savefile: 'saveTest.json' }, config);

            assert.deepStrictEqual(JSON.parse(fs.readFileSync('saveTest.json', 'utf8')), config);
            fs.unlinkSync('saveTest.json');
        });
    });
});