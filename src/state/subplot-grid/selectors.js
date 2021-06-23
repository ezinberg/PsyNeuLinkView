import { createSelector } from 'reselect'

const getMapIdToColSpan = state => state.mapIdToColSpan;
const getMapIdToRowSpan = state => state.mapIdToRowSpan;
const getMapIdToPosition = state => state.mapIdToPosition;
const getDropFocus = state => state.dropFocus;

export const getGridLayout = createSelector(
    getMapIdToPosition,
    getMapIdToColSpan,
    getMapIdToRowSpan,
    (position, colSpan, rowSpan) => {
        var metaData = {};
        for ( const id of Object.keys(position) ){
            metaData[id] = {x:position[id][0], y:position[id][1], w:colSpan[id], h:rowSpan[id], i:id}
        }
        return metaData
    }
);

export const getGridShape = createSelector(
    getMapIdToPosition,
    pos => {
        var positions = Object.values(pos),
            maxX=0, maxY=0;
        for (const [x,y] of positions){
            maxX = x>maxX ? x:maxX;
            maxY = y>maxY ? y:maxY;
        }
        return {rows: maxY + 1, cols: maxX + 1} // add 1 to return dimension sizes instead of indices
    }
);

export const getGridPositions = createSelector(
    getMapIdToPosition,
    pos => {
        var gridPositions = {};
        for (const [id, position] of Object.entries(pos)){
            gridPositions[position] = id
        }
        return gridPositions
    }
);

export const getGridDropFocus = createSelector(
    getDropFocus,
    dropFocus => dropFocus
);