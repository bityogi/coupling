

const DEFAULT_PORT = 8333;
const IPV6_IPV4_PADDING = new Buffer([0,0,0,0,0,0,0,0,0,0,255,255]);

export default class Host {
  var _host = false,
      _port = false,
      _version = false;



  constructor(host, port) {
    _port = port || DEFAULT_PORT;

    if (typeof host === 'undefined') {
      _host = 'localhost';
      _version = 4;
      return this;
    } else if (typeof host === 'number') {
      // an IPv4 address, expressed as a little-endian 4-byte (32-bit) number
      // style of "pnSeed" array in Bitcoin reference client
      var buf = new Buffer(4);
      buf.writeInt32LE(host, 0);
      _host = Array.prototype.join.apply(buf, ['.']);
      _version = 4;
      return this;
    } else if (typeof host === 'string') {
      _host = host;
      _version = net.isIP(host);

      if (_version == 0) {
        // DNS host name string
        if (_host.indexOf(':') !== -1) {
          const pieces = _host.split(':');
          _host = pieces[0];
          _port = pieces[1]; // Given "example.com:8080" as host, and "1234" as port, the "8080" takes priority
          _version = net.isIP(_host);
          if (_version ==0) {
            //TODO: Resolve to IP
          }
        }
      }
      return this;
    } else if (Buffer.isBuffer(host)) {
      if (host.length == 4) {
        // IPV4 stored as bytes
        _host = Array.prototype.join.apply(host, ['.']);
        _version = 4;
        return this;
      } else if (host.slice(0, 12).toString('hex') != IPV6_IPV4_PADDING.toString('hex')) {
          // IPv6
        _host = host.toString('hex').match(/(.{1,4})/g).join(':').replace(/\:(0{2,4})/g, ':0').replace(/^(0{2,4})/g, ':0');
        _version = 6;
        return this;


      } else {
        // IPv4 with padding in front
        _host = Array.prototype.join.apply(host.slice(12), ['.']);
        _version = 4;
        return this;
      }
    } else {
      throw new Error('Cound not instantiate peer; invalid parameter type: '+ typeof host);
    }


  host() {
    return _host;
  }

  port() {
    return _port;
  }

}
