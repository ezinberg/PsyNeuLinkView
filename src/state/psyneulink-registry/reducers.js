import * as atypes from '../action-types'
import * as _ from "lodash";

const initialState = {
    setIds: new Set(),
    arrIds: [],
    mapIdToName: {}
};

export function reducer(state = initialState, action){
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_COMPONENT:
            var {id, name} = action;
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
                arrIds: [...state.setIds, id],
                mapIdToName: {...state.mapIdToName, [id]: name}
            });

        case atypes.PSYNEULINK_REGISTER_PARAMETERS:
            var {ownerId, parameterSpecs} = action,
                newIds = Object.keys(parameterSpecs);
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, ...newIds]),
                arrIds: [...state.setIds, ...newIds],
                mapIdToName: {...state.mapIdToName, ...parameterSpecs},
            });

        default:
            return state
    }
}