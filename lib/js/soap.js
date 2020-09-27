const { ResourceLoader } = require("jsdom");

class Soap extends ResourceLoader {
    constructor(options) {
        super(options);
        super.serviceType = options.serviceType;
        super.action = options.action;
        super.body = options.body;
        super._getRequestOptions = this._getRequestOptions;
    }

    _getRequestOptions({ referrer }) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': `"${this.serviceType}#${this.action}"`
            },
            body: this.body
        };

        if (referrer && !IS_BROWSER) {
        requestOptions.headers.referer = referrer;
        }

        return requestOptions;
    }
}

module.exports = Soap;