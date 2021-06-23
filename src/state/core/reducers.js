import * as atypes from './actionTypes';

const initialState = {
    activeComposition:'',
    activeView: 'graphview',
    activeParamTab: 'composition',
    inputFile: [],
    stylesheet: {},
    modelAspectRatio: null,
    plots: {},
    plotSpecs: {},
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SET_INPUT_FILE:
            return Object.assign({}, state, {
                    inputFile: action.filepath
                }
            );

        case atypes.SET_ACTIVE_VIEW:
            return Object.assign({}, state, {
                    activeView: action.view
                }
            );

        case atypes.SET_STYLESHEET:
            return Object.assign({}, state, {
                    stylesheet: action.stylesheet
                }
            );

        case atypes.SET_MODEL_ASPECT_RATIO:
            return Object.assign({}, state, {
                    modelAspectRatio: action.ratio
                }
            );

        case atypes.SET_ACTIVE_PARAM_TAB:
            return Object.assign( {}, state, {
                    activeParamTab: action.id
                }
            );

        case atypes.ADD_PLOT:
            var id = action.plotSpec.id;
            return Object.assign({}, state, {
                    plots: {...state.plots, [id]:action.plotSpec},
                    plotSpecs: {...state.plotSpecs, ...{[id]:[]}}
                }
            );

        case atypes.SET_PLOT_SPECS:
            var id = action.id,
                plotSpec = action.plotSpec,
                parameters = action.plotSpec.parameters,
                mechanism = plotSpec.mechanism;
            //todo: this method of dealing with nested redux objects is extremely ugly. at some point refactor with
            // external library (or redux's createReducer) or refactor to flatten plotSpec state
            return Object.assign({}, state,
                {
                    ...state,
                    ...{
                        plotSpecs:{
                            ...state.plotSpecs,
                            [id]:{
                                ...state.plotSpecs[id],
                                [mechanism]:{
                                    ...state.plotSpecs[id][mechanism] = parameters
                                }}
                        }
                    }
                });

        case atypes.REMOVE_PLOT_SPEC:
            var id = action.id,
                plotSpec = action.plotSpec,
                mechanism = plotSpec.mechanism;
            //todo: this method of dealing with nested redux objects is extremely ugly. at some point refactor with
            // external library (or redux's createReducer) or refactor to flatten plotSpec state
            return Object.assign({}, state,
                {
                    ...state,
                    ...{
                        plotSpecs:{
                            ...state.plotSpecs,
                            [id]:{
                                ...state.plotSpecs[id],
                                [mechanism]:{
                                    ...state.plotSpecs[id][mechanism] = parameters
                                }}
                        }
                    }
                });

        case atypes.SET_ACTIVE_COMPOSITION:
            var name = action.name;
            return Object.assign({}, state, {
                    activeComposition:name
                }
            );

        default:
            return state
    }
}