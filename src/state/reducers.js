import {reducer as configuration} from './configuration/reducers'
import {reducer as core} from "./core/reducers";
import {reducer as psyNeuLinkComponents} from "./psyneulink-components/reducers"
import {reducer as psyNeuLinkParameters} from "./psyneulink-parameters/reducers"
import {reducer as psyNeuLinkRegistry} from "./psyneulink-registry/reducers"
import {reducer as subplotConfigForm} from "./subplot-config-form/reducers"
import {reducer as subplotGrid} from "./subplot-grid/reducers"
import {reducer as subplotRegistry} from "./subplot-registry/reducers"
import {reducer as subplots} from "./subplots/reducers"
import {reducer as forms} from 'redux-form'

import {combineReducers} from 'redux'

export const rootReducer = combineReducers(
    {
        configuration: configuration,
        core: core,
        psyNeuLinkComponents: psyNeuLinkComponents,
        psyNeuLinkParameters: psyNeuLinkParameters,
        psyNeuLinkRegistry:psyNeuLinkRegistry,
        subplotConfigForm: subplotConfigForm,
        subplotGrid: subplotGrid,
        subplotRegistry: subplotRegistry,
        subplots: subplots,
        forms: forms
    }
);