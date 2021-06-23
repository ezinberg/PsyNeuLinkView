import * as atypes from '../action-types'

const initialState = {
    setIds: new Set(),
    arrIds: [],
};

export function reducer(state = initialState, action){
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id} = action;
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
                arrIds: [...state.setIds, id],
            });

        default:
            return state
    }
}