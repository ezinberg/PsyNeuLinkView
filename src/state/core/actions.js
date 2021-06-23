import * as atypes from './actionTypes'

export function setInputFile(filepath){
    return {
        type: atypes.SET_INPUT_FILE,
        filepath: filepath
    }
}

export function setActiveView(id){
    return {
        type: atypes.SET_ACTIVE_VIEW,
        view: id
    }
}

export function setActiveComposition(name) {
    return {
        type: atypes.SET_ACTIVE_COMPOSITION,
        name: name
    }
}

export function setActiveParamTab(id){
    return {
        type: atypes.SET_ACTIVE_PARAM_TAB,
        tab: id
    }
}

export function setStyleSheet(stylesheet){
    return {
        type: atypes.SET_STYLESHEET,
        stylesheet: stylesheet
    }
}

export function setModelAspectRatio(ratio){
    return {
        type: atypes.SET_MODEL_ASPECT_RATIO,
        ratio: ratio
    }
}

export function addPlot(plotSpec){
    return {
        type: atypes.ADD_PLOT,
        plotSpec: plotSpec
    }
}

export function removePlot(id){
    return {
        type: atypes.REMOVE_PLOT,
        id: id
    }
}

export function setPlotSpecs(id, plotSpec){
    return {
        type: atypes.SET_PLOT_SPECS,
        id: id,
        plotSpec: plotSpec
    }
}

export function removePlotSpec(plotSpec){
    return {
        type: atypes.REMOVE_PLOT_SPEC,
        plotSpec: plotSpec
    }
}