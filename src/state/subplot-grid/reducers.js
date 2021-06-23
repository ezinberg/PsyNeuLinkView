import * as atypes from '../action-types'

export const initialState = {
    mapIdToColSpan:{},
    mapIdToRowSpan:{},
    mapIdToPosition:{},
    dropFocus:[null,null]
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
        case atypes.SUBPLOT_GRID_SET_PLOT:
            return Object.assign({}, state, {
                mapIdToPosition: {...state.mapIdToPosition, [action.id]:action.position},
                mapIdToColSpan: {...state.mapIdToColSpan, [action.id]:action.colSpan},
                mapIdToRowSpan: {...state.mapIdToRowSpan, [action.id]:action.rowSpan},
            });

        case atypes.SUBPLOT_GRID_EDIT_LAYOUT:
            var {id, position, colSpan, rowSpan} = action;
            return Object.assign({}, state, {
                mapIdToPosition:{
                    ...state.mapIdToPosition,
                    ...(position ? {[id]:position} : {})
                },
                mapIdToColSpan:{
                    ...state.mapIdToColSpan,
                    ...(colSpan ? {[id]:colSpan} : {})
                },
                mapIdToRowSpan:{
                    ...state.mapIdToRowSpan,
                    ...(rowSpan ? {[id]:rowSpan} : {})
                }
            });

        case atypes.SUBPLOT_GRID_SET_DROP_FOCUS:
            var {id, edge} = action;
            return Object.assign({}, state, {
                ...state,
                dropFocus:[id,edge]
            });

        default:
            return state

    }
}

