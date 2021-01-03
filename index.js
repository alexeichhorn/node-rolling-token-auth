

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(hex) {
    if ((hex.length % 2) !== 0) throw new RangeError('Expected string to be an even number of characters')

    var view = new Uint8Array(hex.length / 2)

    for (var i = 0; i < hex.length; i += 2) {
        view[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }

    return view.buffer
}


class RollingTokenManager {

    constructor(secret, interval, tolerance = 1) {
        //this.secret = secret
        this.interval = interval
        this.tolerance = tolerance

        this.encoder = new TextEncoder()
        this.secretData = this.encoder.encode(secret)
    }

    async _getKey(usecase = 'sign') {
        return await crypto.subtle.importKey("raw", secretData, { name: 'HMAC', hash: 'SHA-256' }, false, [usecase])
    }

    currentTimestamp() {
        const time = new Date().getTime() / 1000
        return Math.floor(time / this.interval)
    }

    async generateToken(offset = 0) {
        const timestamp = this.currentTimestamp() + offset
        const encodedTimestamp = this.encoder.encode(timestamp.toString())
        
        const key = await this._getKey('sign')
        const tokenData = await crypto.subtle.sign('HMAC', key, encodedTimestamp)
        return buf2hex(tokenData)
    }

    async _checkValidity(token, key, offset) {
        const timestamp = this.currentTimestamp() + offset
        const encodedTimestamp = this.encoder.encode(timestamp.toString())

        const verified = await crypto.subtle.verify('HMAC', key, token, encodedTimestamp)
        return verified
    }

    async isValid(token) {

        const tokenData = hex2buf(token)
        const key = await this._getKey('verify')

        if (await this._checkValidity(tokenData, key, 0)) return true

        for (let i = 1; i <= this.tolerance; i++) {
            if (await this._checkValidity(tokenData, key, i)) return true
            if (await this._checkValidity(tokenData, key, -i)) return true
        }

        return false
    }
}


module.exports = RollingTokenManager