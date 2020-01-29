const axios = require('axios');
const $ = require('cheerio');

class Device {
    constructor(options) {
        this.location = options.location;
        this.serviceType = options.serviceType;
        this.controlURL = options.controlURL;
    }

    executeQuery(action,query) {
        return axios.post(this.location,query, {
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': `urn:schemas-upnp-org:service:${this.serviceType}:1#${action}`
            }
        });
    }

    getLocalIPAddress() {
        let ethernet0 = require('os').networkInterfaces().en0;
        let address;
        ethernet0.forEach((device) => {
            if (device.family === "IPv4") {
                address = device.address;
            }
        });
        return address;
    }

    addPortMapping(map) {
        let self = this;
        return new Promise(function (resolve,reject) {
            if (!map.address) {
                reject('Error: address was not found in map. Address must be included to ensure a proper port map.');
            } else if (!map.internalPort) {
                reject('Error: internalPort was not found in map. Internal Port must be included to ensure a proper port map.');
            } else if (!map.externalPort) {
                reject('Error: externalPort not found in map. External Port must be included to ensure a proper port map.');
            } else {
                let query = `
                    <?xml version="1.0"?>
                    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                        <s:Body>
                            <u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:${self.serviceType}:1">
                                <NewRemoteHost>${map.remoteHost ? map.remoteHost : ''}</NewRemoteHost>
                                <NewExternalPort>${map.externalPort}</NewExternalPort>
                                <NewProtocol>${map.protocol}</NewProtocol>
                                <NewInternalPort>${map.internalPort}</NewInternalPort>
                                <NewInternalClient>${map.address}</NewInternalClient>
                                <NewEnabled>${map.enabled ? map.enabled : 1}</NewEnabled>
                                <NewPortMappingDescription>${map.description ? map.description : 'upnpjs'}</NewPortMappingDescription>
                                <NewLeaseDuration>${map.duration ? map.duration : ''}</NewLeaseDuration>
                            </u:AddPortMapping>
                        </s:Body>
                    </s:Envelope>
                `;
                self.executeQuery('AddPortMapping',query).then(function(result) {
                    resolve();
                }).catch(function(error) {
                    reject('Error: Invalid port mapping, port is most likely mapped to another address.');
                });
            }
        });
    }

    deletePortMapping(map) {
        let self = this;
        return new Promise(function (resolve,reject) {
            if (!map.externalPort) {
                resolve('Error: externalPort was not found in map. External Port must be specified to ensure deletion.');
            } else if (!map.protocol) {
                resolve('Error: protocol was not found in map. Protocol must be specified to ensure deletion.');
            } else {
                let query = `
                    <?xml version="1.0"?>
                    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                        <s:Body>
                            <u:DeletePortMapping xmlns:u="urn:schemas-upnp-org:service:${self.serviceType}:1">
                                <NewRemoteHost>${map.remoteHost ? map.remoteHost : ''}</NewRemoteHost>
                                <NewExternalPort>${map.externalPort}</NewExternalPort>
                                <NewProtocol>${map.protocol}</NewProtocol>
                            </u:DeletePortMapping>
                        </s:Body>
                    </s:Envelope>
                `;
                self.executeQuery('DeletePortMapping',query).then(function(result) {
                    resolve();
                }).catch(function(error) {
                    reject('Error: Invalid argument in map.');
                });
            }
        });
    }

    getListOfPortMappings(i=0,list=[]) {
        let self = this;
        return new Promise(function (resolve,reject) {
            self.getPortMap(i)
                .then(function(portMap) {
                    list.push({
                        "Address": portMap.address,
                        "Internal Port": portMap.internalPort,
                        "External Port": portMap.externalPort,
                        "Protocol": portMap.protocol,
                        "Description": portMap.description
                    });
                    resolve(self.getListOfPortMappings(i+1,list));
                })
                .catch(function() {
                    resolve(list);
                });
        });
    }

    getPortMap(index) {
        let self = this;
        return new Promise(function (resolve,reject) {
            let query = `
                <?xml version="1.0"?>
                <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                    <s:Body>
                        <u:GetGenericPortMappingEntry xmlns:u="urn:schemas-upnp-org:service:${self.serviceType}:1">
                            <NewPortMappingIndex>${index}</NewPortMappingIndex>
                            <NewRemoteHost></NewRemoteHost>
                            <NewExternalPort></NewExternalPort>
                            <NewProtocol></NewProtocol>
                            <NewInternalPort></NewInternalPort>
                            <NewInternalClient></NewInternalClient>
                            <NewEnabled></NewEnabled>
                            <NewPortMappingDescription></NewPortMappingDescription>
                            <NewLeaseDuration></NewLeaseDuration>
                        </u:GetGenericPortMappingEntry>
                    </s:Body>
                </s:Envelope>
            `;
            self.executeQuery('GetGenericPortMappingEntry',query).then(function(result) {
                let data = $(result.data);
                resolve({
                    address: data.find("NewInternalClient").text(),
                    internalPort: data.find("NewInternalPort").text(),
                    externalPort: data.find("NewExternalPort").text(),
                    protocol: data.find("NewProtocol").text(),
                    description: data.find("NewPortMappingDescription").text()
                });
            }).catch(function(error) {
                reject('Error: Could not retrieve port mapping info, check your network connection.');
            });
        });
    }

    getExternalIPAddress() {
        let self = this;
        return new Promise(function (resolve,reject) {
            let query = `
                <?xml version="1.0"?>
                <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                    <s:Body>
                        <u:GetExternalIPAddress xmlns:u="urn:schemas-upnp-org:service:${self.serviceType}:1">
                            <NewExternalIPAddress></NewExternalIPAddress>
                        </u:GetExternalIPAddress>
                    </s:Body>
                </s:Envelope>
            `;
            self.executeQuery('GetExternalIPAddress',query).then(function(result) {
                resolve($(result.data).find('NewExternalIPAddress').text());
            }).catch(function(error) {
                reject('Error: Could not retrieve external ip address, check your network connection.');
            });
        });
    }
}

module.exports = Device;
