import * as atypes from '../action-types'

export function initializeSubplotConfigForm({parentId, plotType}){
    return {
        type: atypes.SUBPLOT_INITIALIZE,
        parentId: parentId,
        plotType: plotType
    }
}

export function setTabFocus({parentId, tabKey}) {
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_TAB_FOCUS,
        parentId: parentId,
        tabKey: tabKey
    }
}

export function setComponentFocus({parentId, tabKey}) {
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_COMPONENT_FOCUS,
        parentId: parentId,
        tabKey: tabKey
    }
}

export function setOuterScroll({parentId, position}){
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_OUTER_SCROLL,
        parentId: parentId,
        position: position
    }
}

export function setAvailableDataScroll({parentId, position}){
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_AVAILABLE_DATA_SCROLL,
        parentId: parentId,
        position: position
    }
}
export function setSelectedDataScroll({parentId, position}){
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_SELECTED_DATA_SCROLL,
        parentId: parentId,
        position: position
    }
}