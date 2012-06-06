var dgram = require('dgram')

var socket = dgram.createSocket('udp4')

var Client = module.exports.Client = function statsd_Client(host, port) {
    this.host = host
    this.port = port
}

Client.prototype.timing = function statsd_Client_timing(statname, time) {
    var stats = {}
    stats[statname] = time + '|ms'
    this.send(stats)
}

Client.prototype.increment = function statsd_Client_increment(statnames) {
    this.update_stats(statnames, 1)
}

Client.prototype.decrement = function statsd_Client_decrement(statnames) {
    this.update_stats(statnames, -1)
}

Client.prototype.update_stats = function statsd_Client_update_stats(statnames, delta) {
    if (typeof statnames === 'string') {
        statnames = [statnames]
    }
    if (!delta) {
        delta = 1
    }
    var stats = {}
    for (var i = 0; i < statnames.length; ++i) {
        stats[statnames[i]] = delta + '|c'
    }
    this.send(stats)
}

Client.prototype.send = function statsd_Client_send(stats) {
    for (var stat in stats) {
        var buffer = new Buffer(stat + ':' + stats[stat])
        socket.send(
            buffer
          , 0
          , buffer.length
          , this.port
          , this.host,
            function (error, bytes) {
                if (error) {
                    console.log(error.msg)
                }
            }
        )
    }
}
