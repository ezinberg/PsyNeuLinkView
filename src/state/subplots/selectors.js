import { createSelector } from 'reselect'
import { LINE_PLOT } from './constants';

export const getMapIdToName = state => state.mapIdToName;
export const getMapIdToPlotType = state => state.mapIdToPlotType;
export const getMapIdToDataSources = state => state.mapIdToDataSources;
export const getMapIdToDataSourceColors = state => state.mapIdToDataSourceColors;
export const getMapPlotTypeToDefaultNameCounter = state => state.mapPlotTypeToDefaultNameCounter;
export const getMapIdToXAxisSource = state => state.mapIdToXAxisSource;
export const getMapIdToXAxisMinType = state => state.mapIdToXAxisMinType;
export const getMapIdToXAxisMin = state => state.mapIdToXAxisMin;
export const getMapIdToXAxisMaxType = state => state.mapIdToXAxisMaxType;
export const getMapIdToXAxisMax = state => state.mapIdToXAxisMax;
export const getMapIdToXAxisTickCount = state => state.mapIdToXAxisTickCount;
export const getMapIdToXAxisTickType = state => state.mapIdToXAxisTickType;
export const getMapIdToXAxisLabel = state => state.mapIdToXAxisLabel;
export const getMapIdToXAxisScale = state => state.mapIdToXAxisScale;
export const getMapIdToYAxisSource = state => state.mapIdToYAxisSource;
export const getMapIdToYAxisMinType = state => state.mapIdToYAxisMinType;
export const getMapIdToYAxisMin = state => state.mapIdToYAxisMin;
export const getMapIdToYAxisMaxType = state => state.mapIdToYAxisMaxType;
export const getMapIdToYAxisMax = state => state.mapIdToYAxisMax;
export const getMapIdToYAxisTickCount = state => state.mapIdToYAxisTickCount;
export const getMapIdToYAxisTickType = state => state.mapIdToYAxisTickType;
export const getMapIdToYAxisLabel = state => state.mapIdToYAxisLabel;
export const getMapIdToYAxisScale = state => state.mapIdToYAxisScale;

export const getSubplotMetaData = createSelector(
    getMapIdToName,
    getMapIdToPlotType,
    getMapIdToDataSources,
    getMapIdToDataSourceColors,
    getMapIdToXAxisSource,
    getMapIdToXAxisMinType,
    getMapIdToXAxisMin,
    getMapIdToXAxisMaxType,
    getMapIdToXAxisMax,
    getMapIdToXAxisTickCount,
    getMapIdToXAxisTickType,
    getMapIdToXAxisLabel,
    getMapIdToXAxisScale,
    getMapIdToYAxisSource,
    getMapIdToYAxisMinType,
    getMapIdToYAxisMin,
    getMapIdToYAxisMaxType,
    getMapIdToYAxisMax,
    getMapIdToYAxisTickCount,
    getMapIdToYAxisTickType,
    getMapIdToYAxisLabel,
    getMapIdToYAxisScale,
    (name, plotType, dataSources, dataSourceColors,
     xSource, xMinType, xMin, xMaxType, xMax, xTickCount, xTickType, xLabel, xScale,
     ySource, yMinType, yMin, yMaxType, yMax, yTickCount, yTickType, yLabel, yScale) => {
        const ids = Object.keys(name),
            metaData = {};
        ids.forEach( (id)=>{
            metaData[id] = {
                name:name[id],
                plotType:plotType[id],
                dataSources:dataSources[id],
                dataSourceColors: dataSourceColors[id],
                xAxis:{
                    source: xSource[id],
                    minType: xMinType[id],
                    min: xMin[id],
                    maxType: xMaxType[id],
                    max: xMax[id],
                    ticks: xTickCount[id],
                    tickType: xTickType[id],
                    label: xLabel[id],
                    scale: xScale[id]
                },
                yAxis:{
                    source: ySource[id],
                    minType: yMinType[id],
                    min: yMin[id],
                    maxType: yMaxType[id],
                    max: yMax[id],
                    ticks: yTickCount[id],
                    tickType: yTickType[id],
                    label: yLabel[id],
                    scale: yScale[id]
                },
            };

            console.log("metaData[" + id + "]");
            for (var key in metaData[id]) {
                if (key === "dataSources") {
                    console.log("metadata datasources");
                    for (var s in metaData[id][key]) {
                        console.log("dataSource: " + s);
                    }
                }
                console.log(key + ": " + metaData[id][key]);
            }
            
        });
        return metaData
    }
);