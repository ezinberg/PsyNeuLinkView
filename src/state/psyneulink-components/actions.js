import * as atypes from '../action-types'

export function registerComponent({
    id,
    name
}){
    return {
        type: atypes.PSYNEULINK_REGISTER_COMPONENT,
        id: id,
        name: name
    }
}