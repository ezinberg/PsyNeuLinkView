import * as atypes from '../action-types'

export const initialState = {
    mapIdToName: {},
    mapIdToParameterSet: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_COMPONENT:
            var {id, name} = action;
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name}
            });
        case atypes.PSYNEULINK_REGISTER_PARAMETERS:
            var {ownerId, parameterSpecs} = action;
            var parameterIds = Object.keys(parameterSpecs);
            return Object.assign({}, state, {
                mapIdToParameterSet: {...state.mapIdToParameterSet, [ownerId]:new Set([...parameterIds])}
            });
        default:
            return state
    }
}