# Device Documentation

| NOTE: Before you begin, make sure you have completed the [Getting Started](../README.md#Usage) section in the README.md file.|
| ---------------------------------------------------------------------------------------------------------------------------- |

## getLocalIPAddress
**To get local ip address of computer**
```JavaScript
// Unlike most methods of device, getLocalIPAddress does not return a Promise
let ip = device.getLocalIPAddress();
```

## getExternalIPAddress
**To get external ip address of network**
```JavaScript
device.getExternalIPAddress()
      .then(function(ip) {
          // External IP is ip and was successfully received
      })
      .catch(function(err) {
          console.error(err);
      });
```

## addPortMapping
**To add a new port map**
```JavaScript
device.addPortMapping({

}).then(function() {
    // Port Mapping added successfully
}).catch(function(err) {
    console.error(err);
})
```

## deletePortMapping
**To remove an existing port map**
```JavaScript
device.deletePortMapping({
    externalPort: /* External port as number */,
    protocol: /* TCP or UDP as string */
}).then(function() {
    // Port Mapping successfully removed
}).catch(function(err) {
    console.error(err);
});
```

## getListOfPortMappings
**To get a list of all existing port maps**
```JavaScript
device.getListOfPortMappings()
      .then(function(list) {
          // List of port mappings is list and was successfully received
      })
      .catch(function(err) {
          console.error(err);
      });
```

## getPortMap
**To get a single port map by index**
```JavaScript
device.getPortMap(/* index */)
      .then(function(portMap) {
          /* portMap is an object like such
             {
                address,
                internalPort,
                externalPort,
                protocol,
                description
             }
          */
      })
      .catch(function(err) {
          console.error(err);
      });
```
