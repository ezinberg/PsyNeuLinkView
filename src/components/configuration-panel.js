import React from 'react'
import '../css/parametercontrolbox.css'
import {Resizable} from 're-resizable'
import {Tab, Tabs} from "@blueprintjs/core"
import {connect} from "react-redux";
import {setActiveParamTab} from "../state/core/actions";
import SubplotConfigForm from "./subplot-config-form";
import CompositionConfigForm from "./composition-config-form";
import {getSubplotIdArr} from "../state/subplot-registry/selectors";
import {getSubplotMetaData} from "../state/subplots/selectors";
import {getGridLayout} from "../state/subplot-grid/selectors";
import {parseLabelForEmptyName} from "../state/subplots/util";

const mapStateToProps = ({subplotRegistry, subplots, subplotGrid}) => {
    return {
        subplotIdArr: getSubplotIdArr(subplotRegistry),
        subplotMetadata: getSubplotMetaData(subplots),
        gridLayout : getGridLayout(subplotGrid)
    };
};

const mapDispatchToProps = dispatch => ({
    setActiveParamTab: (id)=>dispatch(setActiveParamTab(id))
});

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export class ConfigurationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.text,
            class: props.className !== undefined ? `parametercontrolbox ${props.className}`:'parametercontrolbox',
            activeTabId: 'composition',
            tabs: [{id: 'composition', label: 'Composition'}],
            linePlotCounter: {},
            linePlotGlobal: 0
        };
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    updateText(newText) {
        this.setState({ text: newText })
    }

    handleTabChange(newTabId, prevTabId, e) {
        this.setState({activeTabId:newTabId});
        this.props.setActiveParamTab(newTabId)
    }

    getTab(id, label){
        if (label.trim() === ""){
            let plotType = this.props.subplotMetadata[id].plotType;
            label = parseLabelForEmptyName(plotType);
        }
        return <Tab key={id} id={id} title={label} panel={<div/>}/>
    }

    getTabs() {
        let ids = this.props.subplotIdArr;
        let metadata = this.props.subplotMetadata;
        return [
            this.getTab('composition', 'Composition'),
            ...ids.map( id => this.getTab(id, metadata[id].name) )
        ];
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    getFormForActiveTab(id){
        if (id === 'composition'){
            return <CompositionConfigForm id={'composition'}/>
        }
        else {
            return <SubplotConfigForm
                id={id}
                size={{height: this.props.size.height - 30}}
                padding={10}
            />
        }
    }

    render() {
        let id = this.state.activeTabId;
        return (
            <Resizable
                style={style}
                onResize={this.props.onResize}
                onResizeStart={this.props.onResizeStart}
                onResizeStop={this.props.onResizeStop}
                enable={{
                    top:true,
                    right:false,
                    bottom:false,
                    left:true,
                    topRight:false,
                    bottomRight:false,
                    bottomLeft:false,
                    topLeft:true
                }}
                className='pnl-resizable'
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
                <div className={this.state.class}>
                    <div className={'parameter-control-title'}>
                        <div className={'param-tab-container'}>
                            <Tabs id="param-tab-group" onChange={this.handleTabChange} selectedTabId={this.state.activeTabId}>
                                {this.getTabs()}
                            </Tabs>
                        </div>
                    </div>
                    <div className={'active-tab-container'}>
                        {this.getFormForActiveTab(id)}
                    </div>
                </div>
            </Resizable>
        )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationPanel)
