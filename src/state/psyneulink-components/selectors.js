import { createSelector } from 'reselect'
import * as _ from "lodash";

export const getMapIdToParameterSet = state => state.mapIdToParameterSet;
export const getMapIdToName = state => state.mapIdToName;

export const getComponentMapIdToParameterSet = createSelector(
    getMapIdToParameterSet,
    param => param
);

export const getComponentMapNameToId = createSelector(
    getMapIdToName,
    idToName => _.invert(idToName)
);