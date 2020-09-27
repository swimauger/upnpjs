#!/usr/bin/env node

const chalk = require('chalk');
const upnp = require('./index');
const { name, author, version } = require('./package.json');

// LOGS
const success = chalk.bold.green;
const error = chalk.bold.red;

function title() {
    let text = `${name}    :    UPnP Library by ${author}, v${version}`;
    const end = process.stdout.columns;
    const start = end/2 + text.length/2;
    console.log(chalk.bgBlue(text.padStart(start).padEnd(end)));
}

function help() {
    title();
    console.log(`
    Usage:  
            upnp -a ip internal_port external_port protocol description lease
            upnp -add ip internal_port external_port protocol description lease
            Add a Port Mapping

            upnp -d external_port protocol
            upnp --delete external_port protocol
            Delete a Port Mapping

            upnp -l
            upnp --list
            Lists open ports

            upnp -g [option]
            upnp --get [option]
            Get External Ip

            upnp or upnp -h
            upnp --help
            Show this help menu

    Options:
            ip: Local IPv4 Address
            internal_port: Local Port [0 - 65535]
            external_port: External Port[0 - 65535]
            protocol: TCP or UDP
            description: Description of port mapping
            lease: Duration to port mapping will stay
    `);
}

async function add() {
    try {
        const igd = await upnp.discover();
        const args = process.argv.splice(3);
        const isMapped = await igd.addPortMapping({
            ip: args[0],
            internalPort: args[1],
            externalPort: args[2],
            protocol: args[3],
            description: args[4],
            lease: args[5]
        });
        title();
        if (isMapped) {
            success('Port mapped succesfully!');
        } else {
            error('Unable to create port map!');
        }
    } catch (error) {
        throw error;
    }
}

async function remove() {
    try {
        const igd = await upnp.discover();
        const args = process.argv.splice(3);
        const isDeleted = await igd.deletePortMapping({
            externalPort: args[0],
            protocol: args[1]
        });
        title();
        if (isDeleted) {
            success('Succesfully removed port mapping!');
        } else {
            error('Unable to remove port mapping!');
        }
    } catch (error) {
        throw error;
    }
}

async function list() {
    try {
        const igd = await upnp.discover();
        const list = await igd.getPortMappingList();
        title();
        console.table(list);
    } catch (error) {
        throw error;
    }
}

async function getIp() {
    try {
        const igd = await upnp.discover();
        const ip = await igd.getExternalIPAddress();
        title();
        console.log('External IP:', chalk.yellow(ip));
    } catch (error) {
        throw error;
    }
}

switch (process.argv[2]) {
    case '-a':
    case '--add':
        add();
        break;
    
    case '-d':
    case '--delete':
        remove();
        break;

    case '-l':
    case '--list':
        list();
        break;

    case '-g':
    case '--get':
        getIp();
        break;

    case '-h':
    case '--help':
    default:
        help();
        break;
}
