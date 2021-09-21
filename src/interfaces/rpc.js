const { time } = require('console');
const log = require('electron-log'),
    grpc = require('@grpc/grpc-js'),
    protoloader = require('@grpc/proto-loader'),
    path = require('path'),
    _ = require('lodash'),
    ifs = require('./filesystem').fileSystemInterface,
    efs = require('./electron').electronInterface;

class RPCInterface{
    constructor() {
        const PROTO_PATH = path.join(ifs.getConfig()['Python']['PsyNeuLink Path'], 'psyneulink/core/rpc/graph.proto');
        this.packageDefinition = protoloader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        this.graph_proto = grpc.loadPackageDefinition(this.packageDefinition).graph;
        this.script_maintainer = {
            parameters: {},
            components: {},
            compositions: {},
            gv: {},
            style: {}
        };
        this.stylesheet_writer = null;
        this.instantiate_client = this.instantiate_client.bind(this);
        this.load_script = this.load_script.bind(this);
        this.get_json = this.get_json.bind(this);
        this.load_custom_pnl = this.load_custom_pnl.bind(this);

        this.deepPrintObj = this.deepPrintObj.bind(this);
    }

    instantiate_client() {
        return new this.graph_proto.ServeGraph(
            'localhost:50051',
            grpc.credentials.createInsecure()
        );
    }

    deepPrintObj(obj) {
        
        for (var prop in obj) {
            if (typeof(obj[prop]) !== "object") {
                console.log(prop + ": " + obj[prop]);
            }
            else {
                console.log("printing props of " + prop + ": " + obj[prop])
                this.deepPrintObj(obj[prop]);
            }
        } 
    }

    get_parameters(name, callback = function () {}){
        var client = this.instantiate_client();
        var self = this;
        client.GetLoggableParameters({
            name: name
        }, function (err, response) {
            if (err) {
                console.log(err);
                callback(err)
            } else {
                efs.sendMessage('parameterList', {ownerName:name, parameters:response.parameters});
                // self.script_maintainer.parameters[name] = response.parameters;
                callback()
            }
        });
    }

    get_components(name, callback = function () {}){
        var client = this.instantiate_client();
        var self = this;
        client.GetComponents({
            name: name
        }, function (err, response) {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                efs.sendMessage('componentList', response.components);
                callback()
            }
        });
    }

    load_script(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.LoadScript({
            path: filepath
        }, function (err, response) {
            // log.debug("client.LoadScript");
            if (err) {
                // log.debug("with err: " + err.stack);
                callback(err)
            } else {
                self.script_maintainer.compositions = response.compositions;
                callback()
            }
        });
    }

    // added to reload script topology after changes to script
    // reload_script(filepath, callback = function () {
    // }) {
        
    //     var client = this.instantiate_client();
    //     var self = this;
    //     client.LoadScript({
    //         path: filepath
    //     }, function (err, response) {
    //         // log.debug("client.LoadScript");
    //         if (err) {
    //             // log.debug("with err: " + err.stack);
    //             callback(err)
    //         } else {
    //             self.script_maintainer.compositions = response.compositions;
    //             callback()
    //         }
    //     });
    // }


    get_style(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.LoadGraphics({
            path: filepath
        }, function (err, response) {
            if (err) {
                callback(err)
            } else {
                self.script_maintainer.style = JSON.parse(response.styleJSON);
                callback()
            }
        })
    }

    get_json(name, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.GetJSON({
            name: name
        }, function (err, response) {
            if (err) {
                callback(err)
            } else {

                // console.log("\n\n\nBEFORE script_maintainer.gv: " + JSON.stringify(self.script_maintainer.gv, null, 4));
                
                self.script_maintainer.gv = JSON.parse(response.objectsJSON);

                // ! script_maintainer.gv does not get updated with newly added node
                console.log("\nAFTER script_maintainer.gv: " + JSON.stringify(self.script_maintainer.gv, null, 4));

                self.script_maintainer.style = JSON.parse(response.styleJSON);
                callback()
            }
        });
    }

    load_custom_pnl(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        client.LoadCustomPnl({
            path: filepath
        }, function (err, response) {
            if (err) {
                // log.debug(err)
                console.log(err)
            } else {
                callback()
            }
        })
    }

    instantiate_stylesheet_writer(callback = () => {}) {
        var client = this.instantiate_client();
        return client.UpdateStylesheet(callback)
    }

    updateStylesheet(stylesheet, callback = () => {}) {
        var writeToFile;
        if (this.stylesheet_writer === null){
            this.stylesheet_writer = this.instantiate_stylesheet_writer(callback)
        }
        if (typeof stylesheet === 'object' && stylesheet !== null) {
            writeToFile = JSON.stringify(stylesheet);
        }
        else if (typeof stylesheet === 'string' || stylesheet instanceof String) {
            writeToFile = stylesheet;
        }
        else {
            throw "styleSheet arg of updateStylesheet must be a styleSheet object or a stringified JSON"
        }
        this.stylesheet_writer.write({styleJSON:writeToFile}, callback)
    }

    health_check(callback = function () {
    }) {
        var self = this;
        var client = this.instantiate_client();
        client.HealthCheck({}, function (err, response) {
            if (err) {
                // log.debug(err)
                console.log('error:', err)
            } else {
                self.most_recent_response = response;
                callback();
            }
        })
    }

    run_composition(
        inputs,
        servePrefs,
        runtime_parameters,
        callback = () => {
        }) {
        var self = this,
            client = this.instantiate_client(),
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

        var call = client.RunComposition(
            {
                inputs: formatted_inputs,
                servePrefs: {servePrefSet: servePrefs}
            }
        );


        call.on('data', function (entry) {
            efs.sendMessage('runData', entry);
            self.got_data = true
        });

        call.on('error', function(e) {
            console.log("RPC error: " + e);
          });
        
        call.on('status', function(st) {
            // console.log("status: " + st);
        });

        call.on('end', function() {
            console.log("RPC stream end");
        }); 
    }
}

exports.rpcInterface = new RPCInterface();