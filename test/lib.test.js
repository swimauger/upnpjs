const upnp = require('../index');

describe('upnpjs library tests', () => {
    test('upnp add port mapping', async () => {
        const ip = require('ip').address();
        const igd = await upnp.discover();
        await expect(igd.addPortMapping({
            ip,
            internalPort: 12345,
            externalPort: 12345,
            protocol: 'TCP'
        })).resolves.toBe(true);
    });

    test('upnp list port mappings', async () => {
        const igd = await upnp.discover();
        const ip = require('ip').address();
        await expect(igd.getPortMappingList()).resolves.toContainEqual({
            ip,
            internalPort: 12345,
            externalPort: 12345,
            protocol: 'TCP',
            description: '',
            lease: 86400
        });
    });

    test('upnp delete port mapping', async () => {
        const igd = await upnp.discover();
        await expect(igd.deletePortMapping({
            externalPort: 12345,
            protocol: 'TCP'
        })).resolves.toBe(true);
    });

    test('upnp external ip equals public ip', async () => {
        const [igd, publicIp] = await Promise.all([upnp.discover(), require('public-ip').v4()]);
        await expect(igd.getExternalIPAddress()).resolves.toBe(publicIp);
    });
});
