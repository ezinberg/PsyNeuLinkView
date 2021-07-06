const log = require('electron-log'),
    grpc = require('@grpc/grpc-js'),
    protoloader = require('@grpc/proto-loader'),
    path = require('path'),
    _ = require('lodash'),
    ifs = require('./filesystem').fileSystemInterface,
    efs = require('./electron').electronInterface,
    {spawn, spawnSync, exec, execSync} = require('child_process');



function instantiate_client() {
    const PROTO_PATH = path.join(ifs.getConfig()['Python']['PsyNeuLink Path'], 'psyneulink/core/rpc/graph.proto');
    var packageDefinition = protoloader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
    var graph_proto = grpc.loadPackageDefinition(packageDefinition).graph;

    return new graph_proto.ServeGraph(
        'localhost:50051',
        grpc.credentials.createInsecure()
    );
}

function run_composition(
    inputs,
    servePrefs,
    runtime_parameters,
    callback = () => {
    }) {
    var self = this,
        client = instantiate_client(),
        formatted_inputs = {};
    Object.keys(inputs).forEach(
        function (k) {
            var data = inputs[k],
                rows = data.length,
                cols = data[0].length,
                flattened_data = data.flat(Infinity);
            Object.assign(formatted_inputs,
                {
                    [k]: {
                        rows: rows,
                        cols: cols,
                        data: flattened_data
                    }
                }
            )
        }
    );

    

    console.log(formatted_inputs, servePrefs)
    console.log("calling client.RunComposition()");
    var call = client.RunComposition(
        {
            inputs: formatted_inputs,
            servePrefs: {servePrefSet: servePrefs}
        }
    );

    

    call.on('data', function (entry) {
        console.log("call.on('data') triggered with entry: " + entry);
        // efs.sendMessage('runData', entry);
        // self.got_data = true
    });

    call.on('error', function(e) {
        // An error has occurred and the stream has been closed.
        console.log("RPC error: " + e);
      });
    
    call.on('status', function(st) {
        console.log("status: " + st);
        // this.deepPrintObj(st);
    });

    call.on('end', function() {
        console.log("RPC stream end");
        }); 


}



// var childProc = spawn(prefix + interpreterPath,
//     [
//         '-u -W ignore',
//         `"${path.join(appPath, 'src', 'py', 'rpc_server.py')}"`,
//         `"${pnlPath}"`
//     ],
//     {
//         shell: true,
//         detached: !isWin
//     }
// );

var childProc = spawn("python3",
    [
        '-u -W ignore',
        "../py/rpc_server.py",
        "/Users/ezrazinberg/desktop/code/psynl/PsyNeuLink"
    ],
    {
        shell: true,
        detached: true
    }
);

childProc.on('error', function (err) {
    log.debug('py stdout:' + err)
});
childProc.stdout.setEncoding('utf8');
childProc.stdout.on('data', function (data) {
    console.log("data triggered from interpreter.js: " + data);
    if (data.trim() === 'PYTHON SERVER READY'){
        log.debug('py stdout:' + data);
        
    }
});
childProc.stderr.setEncoding('utf8');
childProc.stderr.on('data', function (data) {
    log.debug('py stderr:' + data);
});

// hardcoded params for run_composition
var data = [[10],[1],[2],[3],[4],[5],[10],[7]];
var inputs = {"input": data};
var first = {"componentName": 'input-243', "parameterName": 'InputPort-0', "condition": 2};
var sec = {"componentName": 'output-243', "parameterName": 'OutputPort-0', "condition": 2};
var deliv = [first, sec];

var ms = 2000;
setTimeout(run_composition, ms, inputs, deliv);
// run_composition(inputs, deliv);