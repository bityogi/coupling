
const jsonStream = require('duplex-json-stream');
const streamSet = require('stream-set');
const topology = require('fully-connected-topology');

const me = process.argv[2];

const peers = process.argv.slice(3);

const swarm = topology(me, peers);
const streams = streamSet();
var id = Math.random();
var seq = 0;

var logs = {};

swarm.on('connection', (peer) => {
  peer = jsonStream(peer);
  streams.add(peer);
  peer.on('data', (data) => {
    if (logs[data.log] <= data.seq) return;
    logs[data.log] = data.seq;
    console.log(data.username + '> ' + data.message);
    streams.forEach((otherPeer) => {
      otherPeer.write(data);
    });
  });
  console.log('new connection');
});

process.stdin.on('data', (data) => {
  seq++;
  streams.forEach((peer) => {
    peer.write({ log: id, seq: seq, username: me, message: data.toString() });
  });
})
