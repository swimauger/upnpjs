# UPnP Node.js Package

![](https://img.shields.io/npm/dw/upnpjs?color=204051&style=for-the-badge)
![](https://img.shields.io/github/license/swimauger/upnpjs?color=3B6978&style=for-the-badge)
![](https://img.shields.io/npm/v/upnpjs?color=84A9AC&style=for-the-badge)
![](https://img.shields.io/github/repo-size/swimauger/upnpjs?color=E7DFD5&label=Size&style=for-the-badge)

 Node.js package built for managing a router using UPnP.

## Installation
**Install upnpjs Library**
```bash
    npm install upnpjs
```

**Install upnp CLI**
```bash
    npm install upnpjs -g
    #################################
    # Use `upnp -h` to show help menu
```

#

## Getting Started
*Discover the Internet Gateway Device*
```JavaScript
    const upnp = require('upnpjs');

    const igd = await upnp.discover();
```
<br>
And that's all there is to it. Follow the documentation bellow to see what can be done with the newly discovered Internet Gateway Device.

#

## InternetGatewayDevice
*InternetGatewayDevice allows access to different services potentially allowed by the device*

<br>

### **addPortMapping**
*Service action for mapping ports on the router*
```JavaScript
await igd.addPortMapping({
    ip: 192.168.0.4,
    internalPort: 54321,
    externalPort: 54321,
    protocol: 'TCP',
    description: 'Example port map from 54321 -> 54321'
});
```

<br>

### **deletePortMapping**
*Service action for removing port mappings on the router*
```JavaScript
await igd.deletePortMapping({
    externalPort: 12345,
    protocol: 'UDP'
});
```

<br>

### **getExternalIPAddress**
*Service action for retrieving external ip address*
```JavaScript
const ip = await igd.getExternalIPAddress();
```

<br>

### **getPortMappingList**
*Service action for listing all currently mapped ports on the router*
```JavaScript
const list = await igd.getPortMappingList();
```

<br>

### **getPortMapping**
*Service action for remtrieving a single port map by index*
```JavaScript
const portmap = await igd.getPortMapping(2);
```

#

## References
**Documents**

[UPnP Architecture](http://www.upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.0-20080424.pdf) |
[Service Template](http://upnp.org/specs/gw/UPnP-gw-WANIPConnection-v2-Service.pdf) |
[UPnP Background](http://www.upnp-hacks.org/upnp.html) |
[Internet Gateway Device](http://www.upnp-hacks.org/igd.html) 

**Code Samples**

[miniupnp](https://github.com/miniupnp/miniupnp) |
[TinyUPnP](https://github.com/ofekp/TinyUPnP) |
[weupnp](https://github.com/bitletorg/weupnp) |
[upnpclient](https://github.com/flyte/upnpclient) |
[Node.js and SSDP](https://coolaj86.com/articles/adventures-in-upnp-with-node-js/)
