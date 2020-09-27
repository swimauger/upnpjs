const chalk = require('chalk');
const fs = require('fs').promises;
const { JSDOM } = require('jsdom');
const Soap = require('./soap');
const path = require('path');

function _parseLocation(description) {
    const regex = /LOCATION:(.*)/.exec(description);
    if (regex && regex[1]) {
        return regex[1].trim();
    } else {
        return null;
    }
}

async function _sendControlAction(instance, action, options) {
    try {
        let file = await fs.readFile(path.resolve(__dirname, `../xml/${action}.xml`));
        file = file.toString().replace(`<u:${action}>`, `<u:${action} xmlns:u="${instance.type}">`);
        for (const key in options) {
            file = file.replace(`<${key}>`, `<${key}>${options[key]}`);
        }
        const { window: { document } } = await JSDOM.fromURL(instance.controlURL, {
            resources: new Soap({
                serviceType: instance.type,
                body: file,
                action
            })
        });
        return document;
    } catch (error) {
        throw error;
    }
}

class InternetGatewayDevice {
    static async fromDescription(description) {
        try {
            const location = _parseLocation(description);
            if (location) {
                const { window: { document } } = await JSDOM.fromURL(location);

                // Find WANIPConnection or WANPPPConnection serviceType
                const services = Array.from(document.querySelectorAll('service'));
                const service = services.filter((service) => {
                    return /WANIPConnection|WANPPPConnection/.test(service.querySelector('serviceType').textContent);
                })[0];

                const { origin } = new URL(location);

                if (service) {
                    return new InternetGatewayDevice({
                        type: service.querySelector('serviceType').textContent,
                        id: service.querySelector('serviceId').textContent,
                        scpdURL: origin + service.querySelector('SCPDURL').textContent,
                        controlURL: origin + service.querySelector('controlURL').textContent,
                        eventSubURL: origin + service.querySelector('eventSubURL').textContent
                    });
                } else {
                    throw `WANIPConnection and WANPPPConnection Service could not be found from the given description document at ${location}`;
                }
            } else {
                throw `Location could not be found from the given descrption:\n\n${description}`;
            }
        } catch (error) {
            throw error;
        }
    }

    constructor({ type, id, scpdURL, controlURL, eventSubURL }) {
        this.type = type;
        this.id = id;
        this.scpdURL = scpdURL;
        this.controlURL = controlURL;
        this.eventSubURL = eventSubURL;
    }

    async addPortMapping({ ip, internalPort, externalPort, protocol, enabled, description = '', lease = '' }) {
        try {
            await _sendControlAction(this, 'DeletePortMapping', {
                NewExternalPort: externalPort,
                NewProtocol: protocol,
                NewInternalPort: internalPort,
                NewInternalClient: ip,
                NewEnabled: enabled ? 1 : 0,
                NewPortMappingDescription: description,
                NewLeaseDuration: lease
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async deletePortMapping({ externalPort, protocol }) {
        try {
            await _sendControlAction(this, 'DeletePortMapping', {
                NewExternalPort: externalPort,
                NewProtocol: protocol
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getExternalIPAddress() {
        try {
            const doc = await _sendControlAction(this, 'GetExternalIPAddress');
            return doc.querySelector('NewExternalIPAddress').textContent;
        } catch (error) {
            throw error;
        }
    }

    async getPortMappingList(list = []) {
        try {
            const portmap = await this.getPortMapping(list.length);
            list.push(portmap);
            return this.getPortMappingList(list);
        } catch (error) {
            return list;
        }
    }

    async getPortMapping(index = 0) {
        try {
            const doc = await _sendControlAction(this, 'GetGenericPortMappingEntry', { NewPortMappingIndex: index });
            return {
                ip: doc.querySelector('NewInternalClient').textContent,
                internalPort: Number(doc.querySelector('NewInternalPort').textContent),
                externalPort: Number(doc.querySelector('NewExternalPort').textContent),
                protocol: doc.querySelector('NewProtocol').textContent,
                enabled: !!doc.querySelector('NewEnabled').textContent,
                description: doc.querySelector('NewPortMappingDescription').textContent,
                lease: Number(doc.querySelector('NewLeaseDuration').textContent)
            }
        } catch (error) {
            throw error;
        }
    }
}

InternetGatewayDevice.prototype.getLocalIPAddress = function () {
    console.warn(chalk.yellow('Function getLocalIPAddress of InternetGatewayDevice is deprecated and will be removed in 1.2.0!'));
}

InternetGatewayDevice.prototype.getListOfPortMappings = function (list) {
    console.warn(chalk.yellow('Function getListOfPortMappings of InternetGatewayDevice is deprecated and will be removed in 1.2.0, in the future please use getPortMappingList!'));
    return this.getPortMappingList(list)
}

InternetGatewayDevice.prototype.getPortMap = function (index) {
    console.warn(chalk.yellow('Function getPortMap of InternetGatewayDevice is deprecated and will be removed in 1.2.0, in the future please use getPortMapping!'));
    return this.getPortMapping(index)
}

module.exports = InternetGatewayDevice;
