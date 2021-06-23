import React from 'react';
import Plot from "./plot";
import '../css/d3plotter.css'
import {getSubplotMetaData} from "../state/subplots/selectors";
import {getMapIdToData, getMapIdToOwnerComponent} from "../state/psyneulink-parameters/selectors";
import {connect} from 'react-redux';
import {getPsyNeuLinkMapIdToName} from "../state/psyneulink-registry/selectors";
import {ResponsiveLineCanvas} from '@nivo/line';
import * as _ from 'lodash';
import PlotBoundaries from "./plot-boundary";

const mapStateToProps = ({subplots, psyNeuLinkParameters, psyNeuLinkRegistry}) => ({
    dataSourceIdToData: getMapIdToData(psyNeuLinkParameters),
    dataSourceIdToOwnerId: getMapIdToOwnerComponent(psyNeuLinkParameters),
    psyNeuLinkIdToName: getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
    subplotMetaData: getSubplotMetaData(subplots),
});

class LinePlot extends Plot {
    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.getLinePlot = this.getLinePlot.bind(this);
        this.getData = this.getData.bind(this);
    }

    getData(){
        let {id, dataSourceIdToData, dataSourceIdToOwnerId, subplotMetaData, psyNeuLinkIdToName} = this.props;

        // console.log("dataSourceIdToData");
        let dsitdSize = 0;
        for (var prop in dataSourceIdToData) {
            // console.log(prop + ": " + dataSourceIdToData[prop]);
            dsitdSize++;
        }
        // console.log("dataSourceIdToData: " + dataSourceIdToData);

        let thisPlotMetaData = subplotMetaData[id];
        let data = [];
        let name, ownerName, color;

        console.log("dataSources.size: " + thisPlotMetaData.dataSources.size);
        // set size is 0 before any lines to plot are selected

        for (const dataSource of thisPlotMetaData.dataSources){
            
            console.log("dataSource: " + dataSource);
            
            name = psyNeuLinkIdToName[dataSource];
            ownerName = psyNeuLinkIdToName[dataSourceIdToOwnerId[dataSource]];
            color = subplotMetaData[id]['dataSourceColors'][dataSource];
            let datumObj = {
                id: `${ownerName}-${name}`,
                color: color,
                data: [

                ]
            };

            let staggeredTimeCounter = {};

            for (const datum of dataSourceIdToData[dataSource]){
                
                // console.log("datum: " + datum);
                // for (var key in datum) {
                //     // if (key === "dataSources") {
                //     //     for (var s in metaData[id][key]) {
                //     //         console.log("dataSource: " + s);
                //     //     }
                //     // }
                //     console.log(key + ": " + datum[key]);
                // }
                
                let time = datum.time.split(':');
                let run = time[0];
                let trial = time[1];
                let pass = time[2];
                let timestep = time[3];
                if (!(run in staggeredTimeCounter)) {
                    staggeredTimeCounter[run] = {
                        [trial]:{
                            [pass]:{
                                [timestep]:1
                            }
                        }
                    }
                }
                else if (!(trial in staggeredTimeCounter[run])) {
                    staggeredTimeCounter[run][trial] = {
                        [pass]:{
                            [timestep]:1
                        }
                    }
                }
                else if (!(pass in staggeredTimeCounter[run][trial])) {
                    staggeredTimeCounter[run][trial][pass] = {
                        [timestep]:1
                    }
                }
                else if (!(timestep in staggeredTimeCounter[run][trial][pass])) {
                    staggeredTimeCounter[run][trial][pass][timestep] = 1
                }
            }
            console.log("before loop line-plot:103");

            console.log("dataSourceIdToData.size: " + dsitdSize);
            console.log("dataSourceIdToData[dataSource]: " + dataSourceIdToData[dataSource]);
            (dataSource in dataSourceIdToData) ? console.log("found") : console.log("not found");

            

            // not entering this loop, not updating datumObj
            for (const datum of dataSourceIdToData[dataSource]){
                console.log("in datum loop line-plot:119");

                let time = datum.time.split(':');
                let run = parseInt(time[0]);
                let trial = parseInt(time[1]);
                for (var i = run-1; i >= 0; i--){
                    trial += Object.keys(staggeredTimeCounter[i]).length
                }
                datumObj.data.push({
                    x: trial,
                    y: datum.value.data[0]
                });
            }
            data.push(datumObj);

            console.log("datumObj: " + datumObj);
            for (var key in datumObj) {
                // if (key === "dataSources") {
                //     for (var s in metaData[id][key]) {
                //         console.log("dataSource: " + s);
                //     }
                // }
                console.log(key + ": " + datumObj[key]);
            }
        }
        return data
    }

    linRange(start, end, numSteps, dec){
        if (start > end) {return [end]}
        let range = end - start;
        let stepSize = _.floor(range/numSteps, dec);
        let steps = [];
        let lastStep = start;
        let i;
        for (i=0; i<numSteps+1; i++){
            steps.push(_.round(lastStep, dec));
            lastStep += stepSize
        }
        return steps
    }

    getLinePlot(){
        let {id, subplotMetaData, width, height, name} = this.props;
        let data = this.getData();
        let xAxis = subplotMetaData[id].xAxis;
        let yAxis = subplotMetaData[id].yAxis;
        console.log("line-plot data: " + data);
        return (
            <div
                style={{width:width, height:height, color:'black'}}
                className={`${id} plot`}
                onMouseMove={e => {
                }}>
                <span
                    className={"plot-title"}
                    style={{
                        position:"absolute",
                        right: "50%",
                        top:"15px",
                        fontSize:"13px"
                    }}
                >
                    {name}
                </span>
                <ResponsiveLineCanvas
                    data={data}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{
                        type: 'linear',
                        min: xAxis.minType == "dynamic" ? "auto":xAxis.min,
                        max: xAxis.maxType == "dynamic" ? "auto":xAxis.max
                    }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        tickValues: xAxis.tickType == "dynamic" ? 10: this.linRange(0, data[0].data.length-1, xAxis.ticks, 2),
                        legend: xAxis.label,
                        legendOffset: 36,
                        legendPosition: 'middle'
                    }}
                    axisLeft={{
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        tickValues: yAxis.tickType == "dynamic" ? 10: yAxis.ticks,
                        legend: yAxis.label,
                        legendOffset: -40,
                        legendPosition: 'middle'
                    }}
                    colors={d => d.color}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabel="y"
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 100,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}/>
                {super.render()}
            </div>
        )
    }

    render(){
        console.log(1);
        return(
            <div>
                {this.getLinePlot()}
            </div>
        )
    }
}

export default connect(mapStateToProps)(LinePlot)