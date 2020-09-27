const dgram = require('dgram');
const { Buffer } = require('buffer');

function ssdp(timeout) {
    return new Promise((resolve, reject) => {
        const timeoutError = setTimeout(reject, timeout);
        const query = Buffer.from('M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: "ssdp:discover"\r\nMX: 3\r\nST: urn:schemas-upnp-org:device:InternetGatewayDevice:1\r\n\r\n', 'ascii');

        const socket = dgram.createSocket('udp4');

        socket.on('error', reject);

        socket.on('message', function (msg) {
            if (/USN: (.*)InternetGatewayDevice:1/.test(msg)) {
                socket.close(() => resolve(msg.toString()));
                clearTimeout(timeoutError);
            }
        });

        socket.on('listening', function () {
            socket.send(query, 0, query.length, 1900, '239.255.255.250', (err) => {
                if (err) {
                    reject(err);
                }
            });
        });

        socket.bind(process.env.PORT);
    });
}

module.exports = ssdp;
