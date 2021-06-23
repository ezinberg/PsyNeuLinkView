import * as atypes from '../action-types'
import { AUTO } from "../core/constants";

export function setPlotInGrid(id, position, rowSpan = AUTO, colSpan= AUTO){
    return {
        type: atypes.SUBPLOT_GRID_SET_PLOT,
        id: id,
        position: position,
        colSpan: colSpan,
        rowSpan: rowSpan
    }
}

export function editGridLayout(id, colSpan, rowSpan, position){
    return {
        type: atypes.SUBPLOT_GRID_EDIT_LAYOUT,
        id: id,
        colSpan: colSpan,
        rowSpan: rowSpan,
        position: position
    }
}

export function setGridDropFocus(id, edge){
    return {
        type: atypes.SUBPLOT_GRID_SET_DROP_FOCUS,
        id: id,
        edge: edge
    }
}