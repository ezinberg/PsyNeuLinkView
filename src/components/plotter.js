import React from 'react'
import '../css/d3plotter.css'
import LinePlot from "./line-plot";
import {Resizable} from 're-resizable'
import { DropTarget } from 'react-dnd'
import { ItemTypes } from './constants'
import * as _ from "lodash";
import Layout from "./layout";
import {addPlot, removePlot} from "../state/core/actions"
import {connect} from "react-redux";
import {initializeSubplot} from "../state/subplots/actions";
import { createId } from "../state/util";
import {PLOT_PREFIX, ID_LEN, LINE_PLOT} from "../keywords";
import {
    getGridLayout,
    getGridPositions,
    getGridShape,
    getGridDropFocus
} from "../state/subplot-grid/selectors";
import {getSubplotIdSet} from "../state/subplot-registry/selectors";
import {editGridLayout} from "../state/subplot-grid/actions";
import {
    getSubplotMetaData,
    getMapIdToName,
    getMapPlotTypeToDefaultNameCounter
} from "../state/subplots/selectors";
import {editSubplotMetaData} from "../state/subplots/actions";
import { data } from 'jquery';

const mapStateToProps = ({subplots, subplotGrid, subplotRegistry}) => {
    
    // // console.log("(plotter:32) subplots");
    // for (var prop in subplots) {
    //     if (prop === "mapIdToDataSources") {
    //         // console.log("mapIdToDataSources");
    //         for (var id in subplots[prop]) {
    //             // console.log(id + ": " + subplots[prop][id] + ", size: " + subplots[prop][id].size);
    //             // console.log("above object size: " + subplots[prop][p].size)
    //             for (var i = 0; i < subplots[prop][id].size; i++) {
    //                 console.log((subplots[prop][id].keys()[i] ?? "null prop") + ": " + (subplots[prop][id].values()[i] ?? "null val"));
                    
    //                 // ! data within subplot object is null!!
    //             }
    //         }
    //     }
    //         // console.log(prop + ": " + subplots[prop]);
    // }
    
    return {
        subplotIdSet: getSubplotIdSet(subplotRegistry),
        mapIdToName: getMapIdToName(subplots),
        mapPlotTypeToDefaultNameCounter: getMapPlotTypeToDefaultNameCounter(subplots),
        subplotMetadata: getSubplotMetaData(subplots),
        gridLayout: getGridLayout(subplotGrid),
        gridShape: getGridShape(subplotGrid),
        gridPositions: getGridPositions(subplotGrid),
        gridDropFocus: getGridDropFocus(subplotGrid),
    }
};

const mapDispatchToProps = dispatch => ({
    addPlot: (plotSpec) => dispatch(addPlot(plotSpec)),
    initializeSubplot: ({id, plotType, name, dataSources, position, colSpan, rowSpan}) =>
        dispatch(initializeSubplot({id, plotType, name, dataSources, position, colSpan, rowSpan})),
    editGridLayout: (id, colSpan, rowSpan, position) =>
        dispatch(editGridLayout(id, colSpan, rowSpan, position)),
    editSubplotMetadata: ({id, plotType, name, dataSources})=> dispatch(editSubplotMetaData({id, plotType, name, dataSources}))
});

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const PlotSpec = {
    drop(props, monitor, component){
        if (monitor.getItem().name === 'Line Plot') {
            if (props.subplotIdSet.size === 0){
                component.insertSubPlot(LINE_PLOT, [0, 0]);
                return {dropped: true}
            }
            var type = ItemTypes.LINE_PLOT,
                dropFocus = component.props.gridDropFocus,
                dropFocusLayout = _.clone(component.props.gridLayout[dropFocus[0]]),
                dropFocusPosition = [dropFocusLayout.x, dropFocusLayout.y],
                placementFromReference = dropFocus[1],
                shiftDirection;
            switch (placementFromReference) {
                case 'left':
                    shiftDirection = 'right';
                    break;
                case 'right':
                    dropFocusPosition[0] += 1;
                    shiftDirection = 'right';
                    break;
                case 'top':
                    shiftDirection = 'bottom';
                    break;
                case 'bottom':
                    dropFocusPosition[1] += 1;
                    shiftDirection = 'bottom';
                    break;
            }
            component.insertSubPlot(type, dropFocusPosition, shiftDirection);
        }
        return {dropped: true}
    },
    hover(props, monitor, component){
        var {gridDropFocus, subplotIdSet} = component.props;
        this.canDrop = ()=>{return gridDropFocus[1]!==null || subplotIdSet.size===0}
    },
    canDrop(props, monitor){
        return false
    }
};

class Plotter extends React.Component {
    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.getSinglePlotSize = this.getSinglePlotSize.bind(this);
        this.insertSubPlot = this.insertSubPlot.bind(this);
        this.lateralShift = this.lateralShift.bind(this);
        this.verticalShift = this.verticalShift.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    snakeCaseToUpperCamelCase(word) {
        return word.split('_').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join('')
    }

    generateDefaultName(plotType, counter=null){
        const prefix = this.snakeCaseToUpperCamelCase(plotType);
        counter = counter ?? this.props.mapPlotTypeToDefaultNameCounter[plotType];
        return `${prefix}-${counter}`
    }

    parseName(plotType, name, allowDuplicates){
        /**
         * validates legality of name and returns it including any necessary modifications
         */
        const nameSet = new Set([...Object.values(this.props.mapIdToName)]);
        name = name.trim();
        if (name === '' || !name){
            name = this.generateDefaultName(plotType);
        }
        if (!allowDuplicates){
            if (nameSet.has(name)){
                const namePrefix = name;
                let nameSuffixCounter = 1;
                while (nameSet.has(name)){
                    name = `${namePrefix}(${nameSuffixCounter})`;
                    nameSuffixCounter += 1;
                }
            }
        }
        return name
    }

    getDefaultNameCounter(plotType, name){
        /**
         * checks if adding subplot with `name` should increment the default name counter for `plotType` and returns
         * the counter, including increment if necessary
         */
        let counter = this.props.mapPlotTypeToDefaultNameCounter[plotType];
        if (name == this.generateDefaultName(plotType)){
            counter += 1
        }
        return counter
    }

    parseDefaultNameCounterOnEdit(id, plotType, name){
        /**
         * checks if default name counter for `plotType` should be decremented due to a change in `name`
         */
        let baseCounter = this.props.mapPlotTypeToDefaultNameCounter[plotType];
        // null value for name means no edit, so don't parse in that case
        if (name){
            let baseName = this.props.mapIdToName[id];
            if (baseName!==name){
                if (name==this.generateDefaultName(plotType, baseCounter-1)){
                    return baseCounter - 1
                }
            }
        }
        return baseCounter
    }

    insertSubPlot(type, position, shiftDirection='right'){

        

        var {gridPositions, subplotIdSet} = this.props,
            updatedLayout = {}, maxXNew, maxYNew,
            id = createId(subplotIdSet, PLOT_PREFIX, ID_LEN);
        if (position in gridPositions){
            if (shiftDirection=='right'){
                updatedLayout =  this.lateralShift(position[1], position[0]);
            }
            else if (shiftDirection=='bottom'){
                updatedLayout = this.verticalShift(position[0], position[1]);
            }
        }
        for ( const [subplotId, layout] of Object.entries(updatedLayout) ){
            this.props.editGridLayout(subplotId, layout.w, layout.h, [layout.x, layout.y])
        }
        this.props.initializeSubplot({
            id:id,
            plotType:LINE_PLOT,
            name:this.generateDefaultName(LINE_PLOT),
            dataSources:[],
            position:position,
            colSpan:1,
            rowSpan:1
        });
    }

    lateralShift(row, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            cols = this.props.gridShape.rows,
            range = _.range(startIndex, cols);
        for (const i of range){
            if (!([i, row] in gridPositions)){continue}
            id = gridPositions[[i, row]];
            updatedLayout[id].x += 1;
        }
        return updatedLayout
    }

    verticalShift(column, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            rows = this.props.gridShape.rows,
            range = _.range(startIndex, rows);
        for (const i of range){
            if (!([column, i] in gridPositions)){continue}
            id = gridPositions[[column, i]];
            updatedLayout[id].y += 1;
        }
        return updatedLayout
    }

    getSinglePlotSize(rows, cols){
        var componentHeight = (this.props.size.height-30)/(rows ? rows: 1),
            componentWidth = (this.props.size.width-30)/(cols ? cols: 1);
        return {width: componentWidth, height: componentHeight}
    }

    _handleNewLayout(newLayouts){
        // TODO: COME BACK TO THIS
        var {gridLayout, gridPositions, gridShape} = this.props,
            updatedGridLayout = {...gridLayout};
        newLayouts.forEach(
            (layout)=>{
            }
        )
    }

    createLinePlot(id, name, dataSources, width, height) {

        // console.log("(plotter:261) dataSources size:" + dataSources.size);
        // for (var i = 0; i < dataSources.size; i++) {
        //     console.log("dataSources[" + i + "]: " + dataSources[i]);
        // }

        return <div key={id}>
            <LinePlot
                id={id}
                name={name}
                width={width}
                height={height}
                data={dataSources}
            />
        </div>
    }

    getPlots(){
        const { subplotIdSet, subplotMetadata, gridShape } = this.props,
            {rows, cols} = gridShape,
            plotSize = this.getSinglePlotSize(rows, cols),
            {width, height} = plotSize;
        return [...subplotIdSet].map(
            id => {
                var {name, dataSources} = subplotMetadata[id];
                
                // console.log("(plotter:287) name, dataSources size: " + name + ", " + dataSources.size);

                return this.createLinePlot(id, name, dataSources, width, height)
            }
        )
    }

    getLayout(){
        const {gridLayout} = this.props;
        return Object.values(gridLayout)
    }

    render() {
        const {connectDropTarget, isOver, canDrop, gridShape} = this.props,
            {rows, cols} = gridShape,
            isEmpty = _.isEqual(gridShape, [0, 0]),
            emptyValidDragHover = isOver && canDrop && isEmpty,
            components = this.getPlots(),
            layout = this.getLayout(),
            plotSize = this.getSinglePlotSize(rows, cols);

        return connectDropTarget (
            <div className={emptyValidDragHover ? "valid-drag-hover": ""}>
            <Resizable
                    style={style}
                    onResize={this.props.onResize}
                    onResizeStart={this.props.onResizeStart}
                    onResizeStop={this.props.onResizeStop}
                    enable={{
                        top: false,
                        right: false,
                        bottom: true,
                        left: true,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: true,
                        topLeft: false
                    }}
                    className='plotter_canvas'
                    defaultSize={
                        this.props.defaultSize
                    }
                    size={
                        this.props.size
                    }
                    minHeight={
                        40
                    }
                    minWidth={
                        40
                    }
                    maxWidth={
                        this.props.maxWidth
                    }
                    maxHeight={
                        this.props.maxHeight
                    }
                >
                    <div className={`plotter ${this.props.className}`}>
                        <Layout
                            className = {'plot-grid'}
                            margin = {[0, 0]}
                            layout = {layout}
                            cols = {gridShape.cols}
                            rowHeight={plotSize.height}
                            width={this.props.size.width-30}
                            components = {components}
                            isDraggable={true}
                            maxRows={gridShape.rows}
                            onLayoutChange={this.handleNewLayout}
                            preventCollision={false}
                            forceLayoutSetState={()=>{}}
                        />
                    </div>
                </Resizable>
            </div>
        )
    }
}

// connect DnD
Plotter = DropTarget(ItemTypes.PLOT, PlotSpec, collect)(Plotter);
// connect Redux
Plotter = connect(mapStateToProps, mapDispatchToProps)(Plotter);

export default Plotter