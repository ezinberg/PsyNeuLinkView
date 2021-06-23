import * as atypes from '../action-types';

export function registerParameters({
    ownerId,
    parameterSpecs
}){
    return {
        type: atypes.PSYNEULINK_REGISTER_PARAMETERS,
        ownerId: ownerId,
        parameterSpecs: parameterSpecs
    }
}

export function addData({
    id,
    data
}){
    return {
        type: atypes.PSYNEULINK_ADD_DATA,
        id: id,
        data: data
    }
}