#!/usr/bin/env node

const chalk = require('chalk');
const argv = require('yargs').argv;
const upnp = require('./lib/upnp.js');

// LOGS
const success = chalk.bold.green;
const error = chalk.bold.red;

upnp.getDevice().then(function(device) {
    if (typeof argv.a === "string") {
        console.log("Mapping Port");
        device.addPortMapping({
            address: argv.a,
            internalPort: argv._[0],
            externalPort: argv._[1]
        }).then(function() {
            success("Success, ",argv._[0]," is now mapped to ",argv._[1]);
            process.exit();
        }).catch(function(err) {
            error(err);
            process.exit();
        });
    } else if (typeof argv.d === "number") {
        device.deletePortMapping({
            externalPort: argv.d,
            protocol: argv._[0]
        }).then(function() {
            success("Success, ",argv.d," is no longer mapped");
            process.exit();
        }).catch(function(err) {
            error(err);
            process.exit();
        });
    } else if (argv.l) {
        device.getListOfPortMappings()
              .then(function(list) {
                  console.table(list);
                  process.exit();
              });
    } else if (typeof argv.g === "string" || typeof argv.get === "string") {
        let dest = argv.g || argv.get;
        if (dest.toLowerCase() === "local") {
            console.log(device.getLocalIPAddress());
            process.exit();
        } else if (dest.toLowerCase() === "external") {
            device.getExternalIPAddress()
                .then(function(ip) {
                    console.log(ip);
                    process.exit();
                })
                .catch(function(err) {
                    error(err);
                    process.exit();
                })
        } else {
            error("Error: ",dest," is not a valid argument");
            process.exit();
        }
    } else {
        console.log(chalk.bgCyan("  upnpjs   :   UPnP Library by Mark Auger, v1.0  "));
        console.log(`
        Usage:  upnp -a ip internal_port external_port
                Add a Port Mapping

                upnp -d external_port protocol
                Delete a Port Mapping

                upnp -l
                Lists open ports

                upnp -g [option]
                upnp --get [option]
                Get a Local or External Ip

                Example:    upnp -g local
                            upnp --get external

        Options:
            local: Local IP Address
            external: External IP Address
        `);
        process.exit();
    }
});
