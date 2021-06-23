import { createSelector } from 'reselect'
import * as _ from 'lodash'

const mapIdToName = state => state.mapIdToName;
const mapIdToOwnerComponent = state => state.mapIdToOwnerComponent;

export const getMapIdToData = state => state.mapIdToData;
export const getMapIdToOwnerComponent = state => state.mapIdToOwnerComponent;

export const getPsyNeuLinkParameterMetadata = createSelector(
    mapIdToName,
    mapIdToOwnerComponent,
    (idToName, idToOwner) => {
        const ids = Object.keys(idToName);
        return _.fromPairs(
            ids.map(
                id => [id, {name: idToName[id], ownerId: idToOwner[id]}]
            )
        ) ?? {}
    }
);
