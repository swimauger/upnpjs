const ssdp = require('./ssdp.js');
const InternetGatewayDevice = require('./device');
const chalk = require('chalk');

class UPnP {
    static async discover(timeout=30000) {
        try {
            const description = await ssdp(timeout);
            return InternetGatewayDevice.fromDescription(description);
        } catch (error) {
            throw error;
        }
    }
}

UPnP.getDevice = async function(timeout) {
    console.warn(chalk.yellow('Function UPnP.getDevice is deprecated and will be removed in 1.2.0, in the future please use UPnP.discover!'));
    return this.discover(timeout);
}

module.exports = UPnP;
