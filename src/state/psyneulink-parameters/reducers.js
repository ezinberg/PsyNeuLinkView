import * as atypes from '../action-types'
import * as _ from 'lodash'

export const initialState = {
    mapIdToName: {},
    mapIdToOwnerComponent: {},
    mapIdToData: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_PARAMETERS:
            var {ownerId, parameterSpecs} = action,
                idToOwner = _.fromPairs(Object.keys(parameterSpecs).map(id => [id, ownerId])),
                idToData = _.fromPairs(Object.keys(parameterSpecs).map(id => [id, []]));
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, ...parameterSpecs},
                mapIdToOwnerComponent: {...state.mapIdToOwnerComponent, ...idToOwner},
                mapIdToData: {...state.mapIdToData, ...idToData}
            });

        case atypes.PSYNEULINK_ADD_DATA:
            var {id, data} = action;
            return Object.assign({}, state, {
                mapIdToData: {
                    ...state.mapIdToData,
                    [id]: [...state.mapIdToData[id], data]
                }
            });

        default:
            return state
    }
}