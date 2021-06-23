const path = require('path'),
    os = require('os'),
    fs = require('fs'),
    isWin = os.platform() === 'win32',
    _ = require('lodash');

class FileSystemInterface {
    appPath = null;

    constructor() {
        this.filewatchers = {};
        this.initializeConfig();
    }

    /**
     * Adds {array} to watched files containing the file watcher in the 0th index and the un-debounced callback in the 1st index,
     * so that the filewatcher can be reconstructed after being closed.
     *
     * Watched files execute callback when changes to them occur.
     *
     * NOTE: due to a known issue causing fs.watch to emit multiple change events, we have to debounce the callback.
     * It's still possible that the callback could fire twice if the change events are registered by the watch API
     * with a duration between them greater than the wait value set below.
     *
     * For more information on the issues with the watch api, see here: https://github.com/nodejs/node-v0.x-archive/issues/1970
     *
     * @param {string} filepath - path to file that should be watched.
     * @param {function} callback - function that describes actions to take when change occurs in file.
     *
     * */
    watch(filepath, callback = (e)=>{}) {
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        if (filepath in this.filewatchers) {
            this.filewatchers[filepath].close()
        }
        this.filewatchers[filepath] = fs.watch(filepath, _.debounce(callback, 50))
    }

    /**
     * Synchronously writes content (string or object) to filepath. If content is an object, first JSONifies content,
     * then writes to filepath.
     *
     * @param {string} filepath - path to file that should be written to.
     * @param {string, object} content - content that should be written to file.
     */
    write(filepath, content) {
        var writeToFile;
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        if (typeof content === 'object' && content !== null) {
            writeToFile = JSON.stringify(content);
        } else if (typeof content === 'string' || content instanceof String) {
            writeToFile = content;
        }
        fs.writeFileSync(filepath, writeToFile, () => {
            window.dispatchEvent('write')
        })
    }

    /**
     * Synchronously reads a file and returns a copy of its contents.
     *
     * @param {string} filepath - path to file that should be read.
     */
    read(filepath) {
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        return fs.readFileSync(filepath,  {encoding: "utf-8"});
    }

    /**
     * Returns the system-dependent path of the PsyNeuLinkView config file
     */
    getConfigPath(){
        var configFileDir,
            configFilePath;
        isWin ?
            configFileDir = path.join(os.homedir(), 'AppData', 'Roaming', 'PsyNeuLinkView')
            :
            configFileDir = path.join(os.homedir(), 'Library', 'Preferences', 'PsyNeuLinkView');
        configFilePath = path.join(configFileDir, 'config.json');
        return configFilePath
    }

    /**
     * Convenience method that returns an object containing the PsyNeuLinkView config file
     */
    getConfig(){
        return JSON.parse(this.read(this.getConfigPath()));
    }

    /**
     * Convenience method that writes an object to the PsyNeuLinkView config file
     */
    setConfig(content){
        var writeToFile = Object.assign({}, content);
        if (typeof content === 'string' || content instanceof String) {
            writeToFile = JSON.parse(content);
        }
        this.write(this.getConfigPath(), writeToFile);
    }

    getApplicationPath(){
        return this.appPath ? this.appPath : false
    }

    /**
     * Loads config file from local environment. Makes one if one does not exist. If one does exist, but is missing
     * keys that are present in the config-template file, the missing keys are copied to the local config file.
     */
    initializeConfig() {
        function keyCopy(templateObj, userObj) {
            Object.keys(templateObj).forEach(
                (key) => {
                    if (!(key in userObj)) {
                        userObj[key] = {...templateObj[key]};
                    }
                }
            );
            Object.keys(templateObj).forEach(
                (key) => {
                    keyCopy(templateObj[key], userObj[key])
                }
            );
            return userObj
        }
        var configPath = this.getConfigPath(),
            configDir = path.join(configPath, '..');
        if (!fs.existsSync(this.getConfigPath())){
            if (!fs.existsSync(configDir)){
                fs.mkdirSync(configDir)
            }
            this.setConfig({})
        }
        var config = this.getConfig(),
            configTemplate = JSON.parse(this.read(path.join(__dirname ,'../resources/config-template.json'))),
            config = keyCopy(configTemplate, config)
        this.setConfig(config)
    }
}

exports.fileSystemInterface = new FileSystemInterface();