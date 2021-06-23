import * as atypes from '../action-types'

export function addTab(
    {parentId, label, takeFocus}
) {
    return {
        type: atypes.CONFIG_PANEL_ADD_TAB,
        parentId: parentId,
        label: label,
        takeFocus: takeFocus
    }
}

export function setMainTabFocus(
    {parentId}
) {
    return {
        type: atypes.CONFIG_PANEL_SET_TAB_FOCUS,
        parentId: parentId
    }
}