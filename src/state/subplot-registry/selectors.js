import { createSelector } from 'reselect'

const getSetIds = state => state.setIds;
const getArrIds = state => state.arrIds;

export const getSubplotIdSet = createSelector(
    getSetIds,
    ids => ids
);

export const getSubplotIdArr = createSelector(
    getArrIds,
    ids => ids
);