export default class ErrorDispatcher {
    /**
     * This class is meant to be instantiated throughout the render process, to be used as a hook for catching and handling
     * errors that occur in the main process.
     *
     * @param errorSpec {Error, Object} an error to be ferried to the render process or an object with properties "type",
     *  "error", and "message" with which to construct a new Error.
     *
     */
    constructor(parent){
        this.errorEvent = null;
        this.parent_component = parent;
        this.capture = this.capture.bind(this);
        this.emit = this.emit.bind(this);
    }

    capture(errorSpec, stateUpdates) {
        var type, error, message;
        if (errorSpec instanceof Error) {
            type = errorSpec.name;
            error = errorSpec;
            message = errorSpec.message;
        } else {
            console.log(errorSpec);
            if (typeof errorSpec.type == 'string' || errorSpec.type instanceof String) {
                type = errorSpec.type
            } else {
                type = ''
            }

            if (typeof errorSpec.message == 'string' || errorSpec.message instanceof String) {
                message = errorSpec.message
            } else {
                message = ''
            }

            if (errorSpec.error instanceof Error) {
                error = errorSpec.error
            }
            else if (typeof errorSpec.error == 'string' || errorSpec.error instanceof String){
                error = new Error(errorSpec.error)
            }
            else{
                error = new Error()
            }
        }
        this.errorEvent = new ErrorEvent(type,
            {
                bubbles: true,
                error: error,
                message: message
            }
        );
        console.log(this.errorEvent);
        if (stateUpdates) {
            this.parent_component.setState(stateUpdates);
        }
        this.parent_component.forceUpdate();
        this.parent_component.handleErrors();
    }

    emit() {
        if (this.errorEvent) {
            console.log(this.errorEvent);
            window.dialog.showMessageBox(
                window.getCurrentWindow(),
                {
                    type: "error",
                    message: this.errorEvent.error.message,
                    detail: this.errorEvent.message
                }
            );
        }
    }
};