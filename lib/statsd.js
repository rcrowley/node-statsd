var dgram = require('dgram')
  , mersenne = require('mersenne')
  , sys = require('sys')

var mt = new mersenne.MersenneTwister19937()
  , socket = dgram.createSocket('udp4')

var Client = module.exports.Client = function statsd_Client(host, port) {
    this.host = host
    this.port = port
}

Client.prototype.timing = function statsd_Client_timing(stat, time, sample_rate) {
    var stats = {}
    stats[stat] = time + '|ms'
    this.send(stats, sample_rate)
}

Client.prototype.increment = function statsd_Client_increment(stats, sample_rate) {
    this.update_stats(stats, 1, sample_rate)
}

Client.prototype.decrement = function statsd_Client_decrement(stats, sample_rate) {
    this.update_stats(stats, -1, sample_rate)
}

Client.prototype.update_stats = function statsd_Client_update_stats(stats, delta, sample_rate) {
    if (typeof stats === 'string') {
        stats = [stats]
    }
    if (!delta) {
        delta = 1
    }
    var data = {}
    for (var i = 0; i < stats.length; ++i) {
        data[stats[i]] = delta+"|c"
    }
    this.send(data, sample_rate)
}

Client.prototype.send = function statsd_Client_send(data, sample_rate) {
    if (!sample_rate) {
        sample_rate = 1
    }

    var sampled_data = {}
    if (sample_rate < 1) {
        if (mt.genrand_real2(0,1) <= sample_rate) {
            for (stat in data) {
                value = data[stat]
                sampled_data[stat] = value + "|@" + sample_rate
            }
        }
    } else {
        sampled_data = data
    }
    for (var stat in sampled_data) {
        var send_data = new Buffer(stat + ':' + sampled_data[stat])
        socket.send(
            send_data
          , 0
          , send_data.length
          , this.port
          , this.host,
            function (error, bytes) {
                if (err) {
                    console.log(error.msg)
                }
            }
        )
    }
}
