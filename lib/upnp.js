const request = require('request');
const dgram = require('dgram');
const $ = require('cheerio');

const Device = require('./device.js');

module.exports = {
    getDevice: function() {
        return new Promise((resolve,reject) => {
            const client = dgram.createSocket('udp4').bind(1900,'0.0.0.0');

            client.on('listening', function() {
                let query = 'M-SEARCH * HTTP/1.1\r\n';
                query += 'HOST:239.255.255.250\r\n';
                query += 'MAN:ssdp:discover\r\n';
                query += 'MX:3\r\n';
                query += 'ST:urn:schemas-upnp-org:device:InternetGatewayDevice:1\r\n\r\n';

                client.send(query,0,query.length,1900,'239.255.255.250');
            });

            client.on('message', function(msg) {
                let response = msg.toString().split('\n');
                let location = null;
                response.filter(function(line) {
                    if (line.startsWith('LOCATION: ')) {
                        location = line.replace('LOCATION: ','');
                    }
                });
                request.get(location, function(error, response, body) {
                    let serviceType = $(body).find("serviceType:contains('urn:schemas-upnp-org:service:WANIPConnection:1')");
                    if (!serviceType) {
                        serviceType = $(body).find("serviceType:contains('urn:schemas-upnp-org:service:WANPPPConnection:1')");
                    }
                    let controlURL = serviceType.siblings().closest('controlURL');
                    location = location.split('/');
                    location.pop();
                    location = location.join('/');
                    resolve(new Device({
                        location: location,
                        serviceType: serviceType.text(),
                        controlURL: controlURL.text()
                    }));
                });
            });
        });
    }
};
