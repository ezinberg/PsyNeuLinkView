import { createSelector } from 'reselect';
import * as _ from 'lodash';

export const getMapParentIdToTabFocus = state => state.mapParentIdToTabFocus;
export const getMapParentIdToComponentFocus = state => state.mapParentIdToComponentFocus;
export const getMapParentIdToPlotType = state => state.mapParentIdToPlotType;
export const getMapParentIdToOuterScroll = state => state.mapParentIdToOuterScroll;
export const getMapParentIdToAvailableDataScroll = state => state.mapParentIdToAvailableDataScroll;
export const getMapParentIdToSelectedDataScroll = state => state.mapParentIdToSelectedDataScroll;

export const getSubplotConfigFormMetadata = createSelector(
    getMapParentIdToTabFocus,
    getMapParentIdToComponentFocus,
    getMapParentIdToPlotType,
    getMapParentIdToOuterScroll,
    getMapParentIdToAvailableDataScroll,
    getMapParentIdToSelectedDataScroll,
    (tab, com, type,
     outer, avail, selected) => {
        let ids = Object.keys(tab);
        return _.fromPairs(ids.map(
            id => [id, {
                tabFocus:tab[id],
                comFocus:com[id],
                plotType:type[id],
                outerScroll:outer[id],
                availScroll:avail[id],
                selectedScroll:selected[id]
            }]
        )) ?? {}
    }
);

export const getConfigureTabMetadata = createSelector(
    getMapParentIdToComponentFocus,
    com => {
        let ids = Object.keys(com);
        return _.fromPairs(ids.map(
            id => [id, {
                comFocus:com[id]
            }]
        )) ?? {}
    }
);