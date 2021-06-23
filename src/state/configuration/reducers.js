import * as atypes from "../action-types"

export const initialState = {
    arrParentIds: [],
    mapIdToLabel:{},
    tabInFocus:''
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id, name} = action;
            return Object.assign({}, state, {
                arrParentIds: [...state.arrParentIds, id],
                mapIdToLabel: {...state.mapIdToLabel, [id]:name},
            });
            return state;

        case atypes.CONFIG_PANEL_SET_TAB_FOCUS:
            var {parentId} = action;
            return Object.assign({}, state, {
                tabInFocus: parentId
            });

        default:
            return state
    }
}