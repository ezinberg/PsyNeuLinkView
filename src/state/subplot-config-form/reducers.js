import * as atypes from '../action-types'
import {DEFAULT_TAB_KEY} from "./constants";

export const initialState = {
    mapParentIdToTabFocus:{},
    mapParentIdToComponentFocus:{},
    mapParentIdToPlotType:{},
    mapParentIdToOuterScroll:{},
    mapParentIdToAvailableDataScroll:{},
    mapParentIdToSelectedDataScroll:{}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id, plotType} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [id]:DEFAULT_TAB_KEY},
                mapParentIdToPlotType:{...state.mapParentIdToPlotType, [id]:plotType},
                mapParentIdToOuterScroll:{...state.mapParentIdToOuterScroll, [id]:0},
                mapParentIdToAvailableDataScroll:{...state.mapParentIdToAvailableDataScroll, [id]:0},
                mapParentIdToSelectedDataScroll:{...state.mapParentIdToSelectedDataScroll, [id]:0}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_TAB_FOCUS:
            var {parentId, tabKey} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [parentId]:tabKey}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_COMPONENT_FOCUS:
            var {parentId, tabKey} = action;
            return Object.assign({}, state, {
                mapParentIdToComponentFocus: {...state.mapParentIdToComponentFocus, [parentId]:tabKey}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_OUTER_SCROLL:
            var {parentId, position} = action;
            return Object.assign({}, state, {
                mapParentIdToOuterScroll: {...state.mapParentIdToOuterScroll, [parentId]:position}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_AVAILABLE_DATA_SCROLL:
            var {parentId, position} = action;
            return Object.assign({}, state, {
                mapParentIdToAvailableDataScroll: {...state.mapParentIdToAvailableDataScroll, [parentId]:position}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_SELECTED_DATA_SCROLL:
            var {parentId, position} = action;
            return Object.assign({}, state, {
                mapParentIdToSelectedDataScroll: {...state.mapParentIdToSelectedDataScroll, [parentId]:position}
            });
        default:
            return state
    }
}