import { createSelector } from 'reselect'
import * as _ from 'lodash'

const getSetIds = state => state.setIds;
const getArrIds = state => state.arrIds;
const getMapIdToName = state => state.mapIdToName;

export const getPsyNeuLinkIdSet = createSelector(
    getSetIds,
    ids => ids
);

export const getPsyNeuLinkIdArr = createSelector(
    getArrIds,
    ids => ids
);

export const getPsyNeuLinkMapIdToName = createSelector(
    getMapIdToName,
    idToName => idToName
);
