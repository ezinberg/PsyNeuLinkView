const fileSystemInterface = require('./filesystem').fileSystemInterface,
    interpreterInterface = require('./interpreter').interpreterInterface,
    electronInterface = require('./electron').electronInterface,
    rpcInterface = require('./rpc').rpcInterface;

var interfaces = {
    'filesystem': fileSystemInterface,
    'interpreter': interpreterInterface,
    'electron': electronInterface,
    'rpc': rpcInterface
};

exports.interfaces = interfaces;