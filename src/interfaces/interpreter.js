/*
If DEBUG_MODE is true, PNLV will not spawn its own python interpreter, thus allowing a developer to run and debug their
own instance in an interactive shell. This can be used, e.g., to step through the python RPC server methods in a debugger.
*/
const DEBUG_MODE = false;

const path = require('path'),
    fs = require('fs'),
    ifs = require('./filesystem').fileSystemInterface,
    os = require('os'),
    compareVersions = require('compare-versions'),
    log = require('electron-log'),
    {spawn, spawnSync, exec, execSync} = require('child_process'),
    isWin = os.platform() === 'win32';

class InterpreterInterface{
    constructor(){
        this.validateInterpreterPath = this.validateInterpreterPath.bind(this);
        this.startServer = this.startServer.bind(this);
        this.checkConda = this.checkConda.bind(this);
        this.findCondaBinary = this.findCondaBinary.bind(this);
        this.findEnvName = this.findEnvName.bind(this);
        this.constructPrefix = this.constructPrefix.bind(this);
        this.executeValidationScript = this.executeValidationScript.bind(this);
        this.spawnRPCServer = this.spawnRPCServer.bind(this);
        this.killRPCServer = this.killRPCServer.bind(this);
        this.restartRPCServer = this.restartRPCServer.bind(this);
        this.childProcs = [];
    }

    getChildProcs(){
        return this.childProcs
    }

    startServer(prefix = '', interpreterPath, callback, errorHandler) {
        var callback = callback,
            config = ifs.getConfig(),
            pnlPath = config['Python']['PsyNeuLink Path'],
            // pnlPath = path.join(__dirname, "../../..", "PsyNeuLink"),
            self = this,
            appPath = ifs.getApplicationPath();
        pnlPath = pnlPath ? pnlPath : '';
        log.debug('' +
            'execute_script' +
            '\n ' +
            '\n' +
            `prefix: ${prefix}` +
            '\n' +
            `interpreterPath: ${interpreterPath}` +
            '\n' +
            `pnlPath: ${pnlPath}` +
            '\n' +
            `full command: ${
                [prefix + interpreterPath,
                    [
                        '-u -W ignore',
                        `"${path.join(appPath, 'src', 'py', 'rpc_server.py')}"`,
                        `"${pnlPath}"`
                    ]
                ]
            }`
        );
        var childProc = spawn(prefix + interpreterPath,
            [
                '-u -W ignore',
                `"${path.join(appPath, 'src', 'py', 'rpc_server.py')}"`,
                `"${pnlPath}"`
            ],
            {
                shell: true,
                detached: !isWin
            }
        );

        childProc.on('error', function (err) {
            log.debug('py stdout:' + err)
        });
        childProc.stdout.setEncoding('utf8');
        childProc.stdout.on('data', function (data) {
            if (data.trim() === 'PYTHON SERVER READY'){
                if (callback){
                    log.debug('py stdout:' + data);
                    callback()
                }
            }
        });
        childProc.stderr.setEncoding('utf8');
        childProc.stderr.on('data', function (data) {
            if (errorHandler){
                errorHandler()
            }
            log.debug('py stderr:' + data);
        });
        this.childProc = childProc
    }

    validateInterpreterPath(filepath, callback) {
        var pyIntPath = filepath;
        this.checkConda(pyIntPath,
            (err, stat, interpreterPath) => {
                if (!stat) {
                    this.executeValidationScript('', interpreterPath, callback)
                } else {
                    this.findCondaBinary(
                        interpreterPath,
                        (err, stat, oneLevelUp, pathToCheck, originalInterpreterPath, possibleCondaBinary) => {
                            if (oneLevelUp === pathToCheck) {
                                this.executeValidationScript('', interpreterPath, callback)
                            } else {
                                this.findEnvName(originalInterpreterPath, possibleCondaBinary,
                                    (err, stdout, stderr, envName, binaryPath, interpreterPath) => {
                                        this.constructPrefix(envName, binaryPath, interpreterPath,
                                            (condaPrefix, interpreterPath) => {
                                                this.executeValidationScript(condaPrefix, interpreterPath, callback)
                                            }
                                        );
                                    }
                                )
                            }
                        }
                    )
                }
            }
        );
    }

    checkConda(interpreterPath, callback) {
        var interpreterDir = path.dirname(interpreterPath);
        var pathToCheck;
        if (isWin) {
            pathToCheck = path.join(interpreterDir, 'conda-meta')
        } else {
            pathToCheck = path.join(interpreterDir, '..', 'conda-meta')
        }

        log.debug('' +
            'checkConda' +
            '\n ' +
            '\n' +
            `interpreterDir: ${interpreterDir}` +
            '\n' +
            `interpreterDir: ${pathToCheck}`
        );

        fs.stat(pathToCheck,
            (err, stat) => {
                callback(err, stat, interpreterPath);
            });
        return false
    }

    findCondaBinary(originalInterpreterPath, callback, pathToCheck = '') {
        if (!pathToCheck) {
            pathToCheck = path.join(originalInterpreterPath, '..');
        }
        var oneLevelUp = path.join(pathToCheck, '..');
        var possibleCondaBinary = path.join(pathToCheck, 'activate');

        log.debug('' +
            'findCondaBinary' +
            '\n ' +
            '\n' +
            `originalInterpreterPath: ${originalInterpreterPath}` +
            '\n' +
            `pathToCheck: ${pathToCheck}` +
            '\n' +
            `oneLevelUp: ${oneLevelUp}` +
            '\n' +
            `possibleCondaBinary: ${possibleCondaBinary}`
        );

        fs.stat(possibleCondaBinary,
            (err, stat) => {
                if (!stat && !(oneLevelUp === pathToCheck)) {
                    if (!(oneLevelUp === pathToCheck)) {
                        this.findCondaBinary(originalInterpreterPath, callback, oneLevelUp)
                    }
                } else {
                    callback(err, stat, oneLevelUp, pathToCheck, originalInterpreterPath, possibleCondaBinary);
                }
            })
    }

    findEnvName(interpreterPath, binaryPath, callback) {
        var interpreterDir = path.dirname(interpreterPath);
        var pathToCheck = path.join(interpreterDir, '..');
        var envPathLen = pathToCheck.length;
        var binaryPath = binaryPath;

        log.debug('' +
            'findEnvName' +
            '\n ' +
            '\n' +
            `interpreterDir: ${interpreterDir}` +
            '\n' +
            `pathToCheck: ${pathToCheck}` +
            '\n' +
            `envPathLen: ${envPathLen}` +
            '\n' +
            `binaryPath: ${binaryPath}`
        );


        exec(`source ${binaryPath} && conda env list`,
            (err, stdout, stderr) => {
                var envs = stdout.split('\n');
                for (var i in envs) {
                    var iLen = envs[i].length;
                    if (iLen >= envPathLen) {
                        if (envs[i].slice(iLen - envPathLen - 1, iLen) == ` ${pathToCheck}`) {
                            var envNameRe = new RegExp(/\w*/);
                            var envName = envs[i].match(envNameRe)[0];
                            callback(err, stdout, stderr, envName, binaryPath, interpreterPath);
                        }
                    }
                }
            }
        )
    }

    constructPrefix(envName, binaryPath, interpreterPath, callback) {
        var interpreterPath = interpreterPath;
        exec(`source "${binaryPath}" && conda --version`,
            (err, stdout, stderr) => {
                var activationCommand;
                if (compareVersions(stdout.replace('conda','').trim(),'4.6.0') >= 0){
                    activationCommand = 'conda activate'
                }
                else {
                    activationCommand = 'source activate'
                }
                log.debug('ACTIVATION COMMAND', activationCommand);
                var condaPrefix = '' +
                    `source "${binaryPath}" && ` +
                    `${activationCommand} ${envName} && `;
                log.debug('' +
                    'constructPrefix' +
                    '\n ' +
                    '\n' +
                    `interpreterPath: ${interpreterPath}` +
                    '\n' +
                    `condaPrefix: ${condaPrefix}`
                );
                callback(condaPrefix, interpreterPath);
            }
        );
    }

    executeValidationScript(prefix = '', interpreterPath, callback){
        var config = ifs.getConfig();
        var pnlPath = config['Python']['PsyNeuLink Path'];
        pnlPath = pnlPath ? pnlPath : '';
        log.debug('' +
            'executeValidationScript' +
            '\n ' +
            '\n' +
            `prefix: ${prefix}` +
            '\n' +
            `interpreterPath: ${interpreterPath}` +
            '\n' +
            `pnlPath: ${pnlPath}` +
            '\n' +
            `full command: ${
                [prefix + `"${interpreterPath}"`,
                    [
                        '-u',
                        `${path.join(ifs.getApplicationPath(), 'src', 'py', 'validate_interpreter.py')}`,
                        `${pnlPath}`
                    ]
                ]
            }`
        );

        var launchInterpreterValidatorCmd = `${prefix} "${interpreterPath}" -u "${path.join(ifs.getApplicationPath(), 'src', 'py', 'validate_interpreter.py')}" "${pnlPath}"`;
        exec(launchInterpreterValidatorCmd,
            {
                shell: true,
                detached: true
            },
            (err, stdout, stderr)=>{
                callback(err, stdout, stderr);
            }
        );
    }

    spawnRPCServer(callback, errorhandler) {
        var config = ifs.getConfig();
        var pyIntPath = config.Python['Interpreter Path'];
        this.checkConda(pyIntPath,
            (err, stat, interpreterPath) => {
                if (!stat) {
                    this.startServer('', interpreterPath, callback, errorhandler)
                } else {
                    this.findCondaBinary(
                        interpreterPath,
                        (err, stat, oneLevelUp, pathToCheck, originalInterpreterPath, possibleCondaBinary) => {
                            if (oneLevelUp === pathToCheck) {
                                this.startServer('', originalInterpreterPath, callback, errorhandler)
                            } else {
                                this.findEnvName(originalInterpreterPath, possibleCondaBinary,
                                    (err, stdout, stderr, envName, binaryPath, interpreterPath) => {
                                        this.constructPrefix(envName, binaryPath, interpreterPath,
                                            (condaPrefix, interpreterPath) => {
                                                this.startServer(condaPrefix, interpreterPath, callback, errorhandler)
                                            }
                                        );
                                    }
                                )
                            }
                        }
                    )
                }
            }
        );
    }

    killRPCServer() {
        if (this.childProc) {
            try {
                if (isWin) {
                    spawnSync("taskkill", [
                            "/PID", this.childProc.pid, '/F', '/T'
                        ],
                    );
                    this.childProc = null
                } else {
                    // process.kill(this.childProc.pid);

                    // this.childProc.kill();

                    var ret = spawnSync("kill", [this.childProc.pid]);
                    console.log("killed " + this.childProc.pid + " with ret value: " + ret);
                    for (var prop in ret) {
                        console.log(prop + ": " + ret[prop]);
                    }
                    this.childProc = null;
                }
            }
            catch (e) {
                console.log("error in killRPCServer(): " + e);
            }
        }
    }

    restartRPCServer(callback, errorhandler) {
        this.killRPCServer();
        this.spawnRPCServer(callback, errorhandler);
    }
}

/**
 * Stub interpreter interface to be swapped out for real one in cases where a dev wants to debug the rpc server
 * separately from the main application in an interactive python session
 * */
class DebugInterpreterInterface{
    constructor(){}
    getChildProcs(){}
    startServer(prefix = '', interpreterPath, callback, errorhandler){
        callback()
    }
    validateInterpreterPath(filepath, callback){
        callback()
    }
    checkConda(interpreterPath, callback) {
        callback()
    }
    findCondaBinary(nal_interpreterPath, callback, pathToCheck) {
        callback()
    }
    findEnvName(interpreterPath, binaryPath, callback) {
        callback()
    }
    constructPrefix(envName, binaryPath, interpreterPath, callback) {
        callback()
    }
    executeValidationScript(prefix = '', interpreterPath, callback){
        callback()
    }
    spawnRPCServer(callback, errorhandler) {
        callback()
    }
    killRPCServer() {}
    restartRPCServer(callback, errorhandler) {
        callback()
    }
}

if (DEBUG_MODE){
    exports.interpreterInterface = new DebugInterpreterInterface();
}
else {
    exports.interpreterInterface = new InterpreterInterface();
}