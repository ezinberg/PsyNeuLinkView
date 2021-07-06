import React from 'react'
import {connect} from "react-redux";
import {store} from "../state/store";
import { setActiveView } from "../state/core/actions";
import {Icon, Tab, Tabs} from "@blueprintjs/core";
import '../css/controlstrip.css';

// const {spawn, spawnSync, exec} = require('child_process');

const mapStateToProps = ({core, psyNeuLinkParameters, psyNeuLinkComponents, subplots}) => {
    return {
        activeView: core.activeView,
        inputFile: core.inputFile,
        parameters: psyNeuLinkParameters,
        components: psyNeuLinkComponents,
        subplots: subplots
    }
};

const fs = window.interfaces.filesystem;
const rpc = window.interfaces.rpc;

class ControlStrip extends React.Component {
    constructor(props){
        super(props);
        this.handleTabChange = this.handleTabChange.bind(this)
    }

    handleTabChange(newTabId, prevTabId, e){
        store.dispatch(setActiveView(newTabId));
    }

    parseInputFile(filePath){
        let {mapIdToDataSources} = this.props;
        if (filePath.length > 0){
            let inputs = JSON.parse(fs.read(filePath[0]));
            let loggedDataIds = new Set();
            for (const val of Object.values(this.props.subplots.mapIdToDataSources)){
                for (const source of val){
                    loggedDataIds.add(source)
                }
            }
            let deliveryConditions = [...loggedDataIds].map(
                id => {
                    let ownerComponent = this.props.parameters.mapIdToOwnerComponent[id];
                    let ownerComponentName = this.props.components.mapIdToName[ownerComponent];
                    let parameterName = this.props.parameters.mapIdToName[id];
                    return {
                        componentName: ownerComponentName,
                        parameterName: parameterName,
                        condition: 2
                    }
                }
            );
            console.log("running comp with");
            console.log(inputs);
            console.log(deliveryConditions);
            rpc.run_composition(
                inputs, deliveryConditions
            );

        }
    }

    render() {
        return (
            <div className={'controlstrip-container'}
                 style={
                     {
                         width:`${this.props.width}px`,
                         height:'30px'
                     }
                 }>
                <div className={'controlstrip pnl-panel'}>
                    <div className={'view-tab-container'}>
                        <Tabs id="view-tab-group" onChange={this.handleTabChange} selectedTabId={this.props.activeView}>
                            <Tab id="graphview" title="Construct" panel={<div />} />
                            <Tab id="plotter" title="Monitor" panel={<div />} />
                            {/*<Tabs.Expander />*/}
                            {/*<input className="pt-input" type="text" placeholder="Search..." />*/}
                        </Tabs>
                    </div>
                    <div className={'run-flow-container'}>
                        <Icon
                            icon={"play"}
                            style={
                                {
                                    color:'green',
                                    cursor: 'pointer'
                                }
                            }
                            onClick= {()=>{this.parseInputFile(this.props.inputFile)}}
                            />
                        <Icon
                            icon={"stop"}
                            style={
                                {
                                    color:'red',
                                    cursor:'pointer'
                                }
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    { setActiveView }
)(ControlStrip)