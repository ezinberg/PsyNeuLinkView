import * as atypes from '../action-types'
import {PLOT_TYPES} from './constants';
import {DYNAMIC, FIXED, TRIAL_NUMBER, VALUE} from "../../keywords";

import * as util from './util';
import * as _ from 'lodash';

export const initialState = {
    mapIdToName:{},
    mapIdToPlotType:{},
    mapIdToDataSources:{},
    mapIdToDataSourceColors:{},
    mapIdToXAxisSource:{},
    mapIdToXAxisMinType:{},
    mapIdToXAxisMin:{},
    mapIdToXAxisMaxType:{},
    mapIdToXAxisMax:{},
    mapIdToXAxisTickCount:{},
    mapIdToXAxisTickType:{},
    mapIdToXAxisLabel:{},
    mapIdToXAxisScale:{},
    mapIdToYAxisSource:{},
    mapIdToYAxisMinType:{},
    mapIdToYAxisMin:{},
    mapIdToYAxisMaxType:{},
    mapIdToYAxisMax:{},
    mapIdToYAxisTickCount:{},
    mapIdToYAxisTickType:{},
    mapIdToYAxisLabel:{},
    mapIdToYAxisScale:{},
    mapPlotTypeToDefaultNameCounter:_.fromPairs(PLOT_TYPES.map( type => [type, 1] ))
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id, plotType, name, dataSources} = action,
                counter = util.getDefaultNameCounter(state, plotType, name);
            dataSources = new Set([...dataSources]) ?? new Set();
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name},
                mapIdToPlotType: {...state.mapIdToPlotType, [id]:plotType},
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources},
                mapIdToDataSourceColors: {...state.mapIdToDataSourceColors, [id]:{}},
                mapPlotTypeToDefaultNameCounter: {...state.mapPlotTypeToDefaultNameCounter, [plotType]:counter},
                mapIdToXAxisSource: {...state.mapIdToXAxisSource, [id]:TRIAL_NUMBER},
                mapIdToXAxisMinType: {...state.mapIdToXAxisMinType, [id]:DYNAMIC},
                mapIdToXAxisMin: {...state.mapIdToXAxisMin, [id]:0},
                mapIdToXAxisMaxType:{...state.mapIdToXAxisMaxType, [id]:DYNAMIC},
                mapIdToXAxisMax: {...state.mapIdToXAxisMax, [id]:0},
                mapIdToXAxisTickCount:  {...state.mapIdToXAxisTickCount, [id]:5},
                mapIdToXAxisTickType: {...state.mapIdToXAxisTickType, [id]:DYNAMIC},
                mapIdToXAxisLabel: {...state.mapIdToXAxisLabel, [id]:"Trial"},
                mapIdToXAxisScale: {...state.mapIdToXAxisScale, [id]:"linear"},
                mapIdToYAxisSource: {...state.mapIdToYAxisSource, [id]:VALUE},
                mapIdToYAxisMinType: {...state.mapIdToYAxisMinType, [id]:DYNAMIC},
                mapIdToYAxisMin: {...state.mapIdToYAxisMin, [id]:0},
                mapIdToYAxisMaxType: {...state.mapIdToYAxisMaxType, [id]:DYNAMIC},
                mapIdToYAxisMax: {...state.mapIdToYAxisMax, [id]:0},
                mapIdToYAxisTickCount: {...state.mapIdToYAxisTickCount, [id]:5},
                mapIdToYAxisTickType: {...state.mapIdToXAxisTickType, [id]:DYNAMIC},
                mapIdToYAxisLabel: {...state.mapIdToYAxisLabel, [id]:"Value"},
                mapIdToYAxisScale: {...state.mapIdToYAxisScale, [id]:"linear"}
            });

        case atypes.SUBPLOT_EDIT_METADATA:
            var {id, plotType, name, dataSources, dataSourceColors,
                    xAxisSource, xAxisMinType, xAxisMin, xAxisMaxType, xAxisMax, xAxisTickCount, xAxisTickType, xAxisLabel, xAxisScale,
                    yAxisSource, yAxisMinType, yAxisMin, yAxisMaxType, yAxisMax, yAxisTickCount, yAxisTickType, yAxisLabel, yAxisScale} = action,
                counter;
            return Object.assign({}, state, {
                mapIdToName:{
                    ...state.mapIdToName,
                    ...(name !== undefined ? {[id]:name} : {})
                },
                mapIdToPlotType:{
                    ...state.mapIdToPlotType,
                    ...(plotType !== undefined ? {[id]:plotType} : {})
                },
                mapIdToDataSources:{
                    ...state.mapIdToDataSources,
                    ...(dataSources !== undefined ? {[id]:dataSources} : {})
                },
                mapIdToDataSourceColors:{
                    ...state.mapIdToDataSourceColors,
                    ...(dataSources !== undefined ? {[id]:dataSources} : {})
                },
                mapPlotTypeToDefaultNameCounter: {
                    ...state.mapPlotTypeToDefaultNameCounter,
                    [plotType]:counter
                },
                mapIdToXAxisSource: {
                    ...state.mapIdToXAxisSource,
                    ...(xAxisSource !== undefined ? {[id]:xAxisSource} : {})
                },
                mapIdToXAxisMinType: {
                    ...state.mapIdToXAxisMinType,
                    ...(xAxisMinType !== undefined ? {[id]:xAxisMinType} : {})
                },
                mapIdToXAxisMin: {
                    ...state.mapIdToXAxisMin,
                    ...(xAxisMin !== undefined ? {[id]:xAxisMin} : {})
                },
                mapIdToXAxisMaxType: {
                    ...state.mapIdToXAxisMaxType,
                    ...(xAxisMaxType !== undefined ? {[id]:xAxisMaxType} : {})
                },
                mapIdToXAxisMax: {
                    ...state.mapIdToXAxisMax,
                    ...(xAxisMax !== undefined ? {[id]:xAxisMax} : {})
                },
                mapIdToXAxisTickCount: {
                    ...state.mapIdToXAxisTickCount,
                    ...(xAxisTickCount !== undefined ? {[id]:xAxisTickCount} : {})
                },
                mapIdToXAxisTickType: {
                    ...state.mapIdToXAxisTickType,
                    ...(xAxisTickType !== undefined ? {[id]:xAxisTickType} : {})
                },
                mapIdToXAxisLabel: {
                    ...state.mapIdToXAxisLabel,
                    ...(xAxisLabel !== undefined ? {[id]:xAxisLabel} : {})
                },
                mapIdToXAxisScale: {
                    ...state.mapIdToXAxisScale,
                    ...(xAxisScale !== undefined ? {[id]:xAxisScale} : {})
                },
                mapIdToYAxisSource: {
                    ...state.mapIdToYAxisSource,
                    ...(yAxisSource !== undefined ? {[id]:yAxisSource} : {})
                },
                mapIdToYAxisMinType: {
                    ...state.mapIdToYAxisMinType,
                    ...(yAxisMinType !== undefined ? {[id]:yAxisMinType} : {})
                },
                mapIdToYAxisMin: {
                    ...state.mapIdToYAxisMin,
                    ...(yAxisMin !== undefined ? {[id]:yAxisMin} : {})
                },
                mapIdToYAxisMaxType: {
                    ...state.mapIdToYAxisMaxType,
                    ...(yAxisMaxType !== undefined ? {[id]:yAxisMaxType} : {})
                },
                mapIdToYAxisMax: {
                    ...state.mapIdToYAxisMax,
                    ...(yAxisMax !== undefined ? {[id]:yAxisMax} : {})
                },
                mapIdToYAxisTickCount: {
                    ...state.mapIdToYAxisTickCount,
                    ...(yAxisTickCount !== undefined ? {[id]:yAxisTickCount} : {})
                },
                mapIdToYAxisLabel: {
                    ...state.mapIdToYAxisLabel,
                    ...(yAxisLabel !== undefined ? {[id]:yAxisLabel} : {})
                },
                mapIdToYAxisScale: {
                    ...state.mapIdToYAxisScale,
                    ...(yAxisScale !== undefined ? {[id]:yAxisScale} : {})
                }
            });

        case atypes.SUBPLOT_ADD_DATA_SOURCE:
            var {id, dataSourceId} = action;
            var dataSources = new Set([...state.mapIdToDataSources[id], dataSourceId]);
            return Object.assign({}, state, {
                mapIdToDataSources: {...state.mapIdToDataSources, [id]: dataSources},
                mapIdToDataSourceColors: {
                    ...state.mapIdToDataSourceColors,
                    [id]:{
                        ...state.mapIdToDataSourceColors[id],
                        [dataSourceId]:"#1f77b4"
                    }
                }
            });

        case atypes.SUBPLOT_REMOVE_DATA_SOURCE:
            var {id, dataSourceId} = action;
            var dataSources = new Set([...state.mapIdToDataSources[id]]);
            dataSources.delete(dataSourceId);
            var dataSourceColors = {
                ...state.mapIdToDataSourceColors,
                [id]:{
                    ...state.mapIdToDataSourceColors[id],
                }
            };
            delete dataSourceColors[id][dataSourceId];
            return Object.assign({}, state, {
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources},
                mapIdToDataSourceColors: dataSourceColors
            });

        case atypes.SUBPLOT_EDIT_DATA_SOURCE_COLOR:
            var {id, dataSourceId, color} = action;
            var dataSourceColors = {
                ...state.mapIdToDataSourceColors,
                [id]:{
                    ...state.mapIdToDataSourceColors[id],
                    [dataSourceId]:color
                }
            };
            return Object.assign({}, state, {
                mapIdToDataSourceColors: dataSourceColors
            });

        default:
            return state
    }
}