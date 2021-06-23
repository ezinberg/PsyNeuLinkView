import React from 'react'
import {DYNAMIC, FIXED} from "../keywords";
import {Button, Divider, Form, Input, InputNumber, Menu, Select} from "antd"
import SelectedDataSourceTable from "./selected-data-source-table";
import {Spinner} from "@blueprintjs/core";
import '../css/paramform.css';
import AvailableDataSourceTable from "./available-data-source-table";
import {connect} from "react-redux";
import {getMapParentIdToComponentFocus, getMapParentIdToTabFocus} from "../state/subplot-config-form/selectors";
import {setComponentFocus, setOuterScroll, setTabFocus} from "../state/subplot-config-form/actions";
import {getPsyNeuLinkIdSet} from "../state/psyneulink-registry/selectors";
import {getSubplotMetaData} from "../state/subplots/selectors";
import {parseNameOnEdit} from "../state/subplots/util";
import {editSubplotMetaData} from "../state/subplots/actions";
import {getComponentMapNameToId} from "../state/psyneulink-components/selectors";

const mapStateToProps = ({core, subplots, subplotConfigForm, psyNeuLinkRegistry, psyNeuLinkComponents}) => {
    return {
        psyNeuLinkIdSet: getPsyNeuLinkIdSet(psyNeuLinkRegistry),
        mapIdToTabFocus: getMapParentIdToTabFocus(subplotConfigForm),
        mapIdToComponentFocus: getMapParentIdToComponentFocus(subplotConfigForm),
        subplotMetaData: getSubplotMetaData(subplots),
        subplotState: subplots,
        activeComposition: core.activeComposition,
        componentMapNameToId: getComponentMapNameToId(psyNeuLinkComponents)
    }
};

const mapDispatchToProps = dispatch => (
    {
        editSubplotMetaData: (
            {id, plotType, name, dataSources,
                xAxisSource, xAxisMinType, xAxisMin, xAxisMaxType, xAxisMax, xAxisTickCount, xAxisTickType, xAxisLabel, xAxisScale,
                yAxisSource, yAxisMinType, yAxisMin, yAxisMaxType, yAxisMax, yAxisTickCount, yAxisTickType, yAxisLabel, yAxisScale}
        ) => dispatch(editSubplotMetaData(
            {id, plotType, name, dataSources,
                xAxisSource, xAxisMinType, xAxisMin, xAxisMaxType, xAxisMax, xAxisTickCount, xAxisTickType, xAxisLabel, xAxisScale,
                yAxisSource, yAxisMinType, yAxisMin, yAxisMaxType, yAxisMax, yAxisTickCount, yAxisTickType, yAxisLabel, yAxisScale}
        )),
        setTabFocus: ({parentId, tabKey}) => dispatch(setTabFocus({parentId, tabKey})),
        setComponentFocus: ({parentId, tabKey}) => dispatch(setComponentFocus({parentId, tabKey})),
        setOuterScroll: ({parentId, position}) => dispatch(setOuterScroll({parentId: parentId, position: position}))
    }
);

class SubplotConfigForm extends React.Component{

    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        this.state = {
            activeTab:`${this.props.id}-data`,
            components:[]
        };
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.setComposition = this.setComposition.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.getOptionsForm = this.getOptionsForm.bind(this);
        this.getDataForm = this.getDataForm.bind(this);
        this.getActiveForm = this.getActiveForm.bind(this);
        this.editName = this.editName.bind(this);
    }

    componentDidMount() {
        if (this.props.activeComposition !== ''){
            this.setComposition();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeComposition !== this.props.activeComposition){
            this.setComposition();
        }
    }

    setComposition(){
        if (this.props.activeComposition !== ''){
            // rpc.getComponents(this.props.activeComposition)
        }
    }


    handleTabChange(newTabId, prevTabId, e) {
        let {id, setTabFocus} = this.props;
        this.setState({activeTab:newTabId});
        setTabFocus({parentId:id, tabKey:newTabId});
    }

    getDataForm(){
        var tableHeight = this.props.size.height - (this.props.padding * 2);
        let {mapIdToComponentFocus, id, componentMapNameToId} = this.props;
        let components = Object.keys(componentMapNameToId) ?? [];
        let componentTabs =
            components.length > 0 ?
                <Menu
                    style={{width:'100px'}}
                    mode="inline"
                    selectedKeys={[mapIdToComponentFocus[id] ?? null]}
                    onSelect={
                        ({key}) => {
                            this.props.setComponentFocus({
                                parentId:this.props.id,
                                tabKey:key
                            });
                }}>
                    {components.map(
                        c =>
                            <Menu.Item
                                key={c}
                                style={{placeSelf: 'center'}}>
                                {c}
                            </Menu.Item>
                    )}
                </Menu>
                :
                <div
                    style={{
                        width:'100px',
                        placeSelf:'center'
                    }}>
                    <Spinner
                        size = {Spinner.SIZE_SMALL}
                        className={"graph_loading_spinner"}/>
                    <Divider type={'vertical'}/>,
                </div>;

        return (
            <div
                style={{
                    gridTemplateColumns: "1fr 1fr 50fr 1fr 50fr",
                    display: "grid",
                }}>
                {[
                    componentTabs,
                    <div/>,
                    <AvailableDataSourceTable
                        name={`${this.props.id}-available-data`}
                        id={this.props.id}
                        components={this.state.components}
                        size={{height: tableHeight, width: "100%"}}/>,
                    <Divider type={'vertical'}/>,
                    <SelectedDataSourceTable
                        name={`${this.props.id}-selected-data`}
                        id={this.props.id}
                        size={{height: tableHeight, width: "100%"}}/>
                ]}
            </div>
        )
    }

    editName(e) {
        let {id, subplotState, subplotMetaData, editSubplotMetaData} = this.props;
        let name = e.target.value;
        let plotType = subplotMetaData[id].plotType;
        name = parseNameOnEdit(id, subplotState, plotType, name);
        editSubplotMetaData({id: id, name: name})
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    getOptionsForm() {
        let {id, subplotMetaData, editSubplotMetaData} = this.props;
        let subplotName = subplotMetaData[id].name;
        let xAxis = subplotMetaData[id].xAxis;
        let yAxis = subplotMetaData[id].yAxis;
        let metaDataDivider =
        <div className={'horizontal-divider-container'}>
            <Divider orientation="left" plain>
                Metadata
            </Divider>
        </div>;

        let groupProportion = '25%';
        let labelProportion = '28%';
        let inputProportion = '72%';
        let inputProportionWithButton = '47%';
        let buttonProportion = '25%';
        let metaDataRowOne =
        <div className={'metadata-row-container'}>
            <Input.Group
            style={{
                width:groupProportion,
                marginRight:"10px",
                display:"inline-block"
            }}>
                <Input
                    disabled
                    value={"Name"}
                    style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
                <Input
                    id={`metadata-name-${id}`}
                    value={subplotName}
                    style={{ width:inputProportion }}
                    spellCheck={false}
                    onChange={this.editName}
                />
            </Input.Group>
        </div>;

        let xAxisDivider =
        <div className={'horizontal-divider-container'}>
            <Divider orientation="left" plain>
                x-Axis
            </Divider>
        </div>;

        let xAxisOptions =
            <div className={'xAxis-row-container'}>
                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block"
                    }}>
                    <Input
                        disabled
                        value={"Label"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
                    <Input
                        id={`metadata-name-${id}`}
                        value={xAxis.label}
                        onChange={
                            (e) => {
                                editSubplotMetaData({id: id, xAxisLabel: e.target.value})
                            }
                        }
                        style={{ width:inputProportion }}
                        spellCheck={false}
                    />
                </Input.Group>

                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block",
                        verticalAlign:"top"
                    }}>
                    <Input
                        disabled
                        value={"Source"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
                    <Select disabled
                            defaultValue={"Trial #"}
                            style={{ width: inputProportion }}>
                        <Select.Option value="Trial #">Trial #</Select.Option>
                    </Select>
                </Input.Group>

                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block",
                        verticalAlign:"top"
                    }}>
                    <Input
                        disabled
                        value={"Scale"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
                    <Select disabled
                            defaultValue={"linear"}
                            style={{ width: inputProportion }}>
                        <Select.Option value="linear">Linear</Select.Option>
                    </Select>
                </Input.Group>

                <br/>

                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block",
                        verticalAlign:"top"
                    }}>
                    <Input
                        disabled
                        value={"Minimum"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />

                    <InputNumber
                        disabled={xAxis.minType == DYNAMIC}
                        style={{
                            width: inputProportionWithButton,
                            color: xAxis.minType == DYNAMIC ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 1)',
                            cursor: 'auto'
                        }}
                        value={xAxis.minType == DYNAMIC ? "Dynamic" : xAxis.min}
                        onChange={
                            (num) => {
                                editSubplotMetaData({id: id, xAxisMin: num})
                            }
                        }
                    />

                    <Button
                        style={{
                            width: buttonProportion,
                            bottom: "1px",
                            background: xAxis.minType == DYNAMIC ? "darkorange" : "",
                            borderColor: xAxis.minType == DYNAMIC ? "darkorange" : ""
                        }}
                        onClick={()=>{editSubplotMetaData({
                            id: id,
                            xAxisMinType: xAxis.minType == DYNAMIC ? FIXED : DYNAMIC
                        })}}
                        type={"primary"}>{
                            xAxis.minType.charAt(0).toUpperCase() + xAxis.minType.slice(1)
                        }</Button>
                </Input.Group>

                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block",
                        verticalAlign:"top"
                    }}>
                    <Input
                        disabled
                        value={"Maximum"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />

                    <InputNumber
                        style={{
                            width: inputProportionWithButton,
                            color: xAxis.maxType == DYNAMIC ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 1)',
                            cursor: 'auto'
                        }}
                        disabled={xAxis.maxType == DYNAMIC}
                        value={xAxis.maxType == DYNAMIC ? "Dynamic" : xAxis.max}
                        onChange={
                            (num) => {
                                editSubplotMetaData({id: id, xAxisMax: num})
                            }
                        }
                    />

                    <Button
                        style={{
                            width: buttonProportion,
                            bottom: "1px",
                            background: xAxis.maxType == DYNAMIC ? "darkorange" : "",
                            borderColor: xAxis.maxType == DYNAMIC ? "darkorange" : ""
                        }}
                        type={"primary"}
                        onClick={()=>{editSubplotMetaData({
                            id: id,
                            xAxisMaxType: xAxis.maxType == DYNAMIC ? FIXED : DYNAMIC
                        })}}
                    >{
                            xAxis.maxType.charAt(0).toUpperCase() + xAxis.maxType.slice(1)
                    }</Button>
                </Input.Group>

                <Input.Group
                    style={{
                        width:groupProportion,
                        marginRight:"10px",
                        display:"inline-block"
                    }}>
                    <Input
                        disabled
                        value={"Tick Marks"}
                        style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
                    <InputNumber
                        disabled={xAxis.tickType == DYNAMIC}
                        min={0}
                        value={xAxis.tickType == DYNAMIC ? "Dynamic" : xAxis.ticks}
                        style={{ width: inputProportionWithButton,
                            color: xAxis.tickType == DYNAMIC ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 1)',
                            cursor: 'auto' }}
                        onChange={
                            (num) => {
                                editSubplotMetaData({id: id, xAxisTickCount: num || 0})
                            }
                        }
                    />
                    <Button
                        style={{
                            width: buttonProportion,
                            bottom: "1px",
                            background: xAxis.tickType == DYNAMIC ? "darkorange" : "",
                            borderColor: xAxis.tickType == DYNAMIC ? "darkorange" : ""
                        }}
                        type={"primary"}
                        onClick={()=>{editSubplotMetaData({
                            id: id,
                            xAxisTickType: xAxis.tickType == DYNAMIC ? FIXED : DYNAMIC
                        })}}
                    >{
                        xAxis.tickType.charAt(0).toUpperCase() + xAxis.tickType.slice(1)
                    }</Button>
                </Input.Group>

            </div>;

        // let yAxisDivider =
        // <div className={'horizontal-divider-container'}>
        //     <Divider orientation="left" plain>
        //         y-Axis
        //     </Divider>
        // </div>;
        //
        // let yAxisOptions =
        //     <div className={'yAxis-row-container'}>
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Label"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //             <Input
        //                 id={`metadata-name-${id}`}
        //                 value={yAxis.label}
        //                 onChange={
        //                     (e) => {
        //                         editSubplotMetaData({id: id, yAxisLabel: e.target.value})
        //                     }
        //                 }
        //                 style={{ width:inputProportion }}
        //                 spellCheck={false}
        //             />
        //         </Input.Group>
        //
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block",
        //                 verticalAlign:"top"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Source"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //             <Select disabled
        //                     defaultValue={"value"}
        //                     style={{ width: inputProportion }}>
        //                 <Select.Option value="value">Value</Select.Option>
        //             </Select>
        //         </Input.Group>
        //
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block",
        //                 verticalAlign:"top"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Scale"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //             <Select disabled
        //                     defaultValue={"linear"}
        //                     style={{ width: inputProportion }}>
        //                 <Select.Option value="linear">Linear</Select.Option>
        //             </Select>
        //         </Input.Group>
        //
        //         <br/>
        //
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block",
        //                 verticalAlign:"top"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Minimum"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //
        //             <InputNumber
        //                 disabled={yAxis.minType == DYNAMIC}
        //                 style={{
        //                     width: inputProportionWithButton,
        //                     color: yAxis.minType == DYNAMIC ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 1)',
        //                     cursor: 'auto'
        //                 }}
        //                 value={yAxis.minType == DYNAMIC ? "Dynamic" : yAxis.min}
        //                 onChange={
        //                     (num) => {
        //                         editSubplotMetaData({id: id, yAxisMin: num})
        //                     }
        //                 }
        //             />
        //
        //             <Button
        //                 style={{
        //                     width: buttonProportion,
        //                     bottom: "1px",
        //                     background: yAxis.minType == DYNAMIC ? "darkorange" : "",
        //                     borderColor: yAxis.minType == DYNAMIC ? "darkorange" : ""
        //                 }}
        //                 onClick={()=>{editSubplotMetaData({
        //                     id: id,
        //                     yAxisMinType: yAxis.minType == DYNAMIC ? FIXED : DYNAMIC
        //                 })}}
        //                 type={"primary"}>{
        //                 yAxis.minType.charAt(0).toUpperCase() + yAxis.minType.slice(1)
        //             }</Button>
        //         </Input.Group>
        //
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block",
        //                 verticalAlign:"top"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Maximum"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //
        //             <InputNumber
        //                 style={{
        //                     width: inputProportionWithButton,
        //                     color: yAxis.maxType == DYNAMIC ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 1)',
        //                     cursor: 'auto'
        //                 }}
        //                 disabled={yAxis.maxType == DYNAMIC}
        //                 value={yAxis.maxType == DYNAMIC ? "Dynamic" : yAxis.max}
        //                 onChange={
        //                     (num) => {
        //                         editSubplotMetaData({id: id, yAxisMax: num})
        //                     }
        //                 }
        //             />
        //
        //             <Button
        //                 style={{
        //                     width: buttonProportion,
        //                     bottom: "1px",
        //                     background: yAxis.maxType == DYNAMIC ? "darkorange" : "",
        //                     borderColor: yAxis.maxType == DYNAMIC ? "darkorange" : ""
        //                 }}
        //                 type={"primary"}
        //                 onClick={()=>{editSubplotMetaData({
        //                     id: id,
        //                     yAxisMaxType: yAxis.maxType == DYNAMIC ? FIXED : DYNAMIC
        //                 })}}
        //             >{
        //                 yAxis.maxType.charAt(0).toUpperCase() + yAxis.maxType.slice(1)
        //             }</Button>
        //         </Input.Group>
        //
        //         <Input.Group
        //             style={{
        //                 width:groupProportion,
        //                 marginRight:"10px",
        //                 display:"inline-block"
        //             }}>
        //             <Input
        //                 disabled
        //                 value={"Tick Marks"}
        //                 style={{ width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }} />
        //             <InputNumber
        //                 min={0}
        //                 value={xAxis.ticks}
        //                 style={{ width: inputProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto' }}
        //                 onChange={
        //                     (num) => {
        //                         editSubplotMetaData({id: id, xAxisTickCount: num})
        //                     }
        //                 }
        //             />
        //         </Input.Group>
        //
        //     </div>;
        //

        let dataViewTableDivider =
        <div className={'horizontal-divider-container'}>
            <Divider orientation="left" plain>
                Data View
            </Divider>
        </div>;

        return [
            <div/>, metaDataDivider,
            <div/>, metaDataRowOne,
            <div/>, xAxisDivider,
            <div/>, xAxisOptions,
            // <div/>, yAxisDivider,
            // <div/>, yAxisOptions,
            <div/>, dataViewTableDivider,
            <div/>, this.getDataForm()
        ]
    }

    getActiveForm(){
        let {id, mapIdToTabFocus, setOuterScroll} = this.props;
        let activeForm;
        let outerColumnLayout;
        let innerColumnLayout;
        switch (mapIdToTabFocus[id]) {
            case 'data':
                outerColumnLayout = "1fr 50fr";
                innerColumnLayout = "1fr 1fr 50fr 1fr 50fr";
                activeForm = this.getDataForm();
                break;
            default:
                outerColumnLayout = "1fr";
                innerColumnLayout = "1fr 100fr";
                activeForm = this.getOptionsForm();
        }
        let form =
        <Form
            style={{
                padding:`${this.props.padding}px`,
                display: "grid",
                gridTemplateColumns: outerColumnLayout,
                height: this.props.size.height,
                ...this.props.style
            }}
            onScroll={this.props.setOuterScroll}
        >
            <div
                className={'scroll-test'}
                style={{
                    gridTemplateColumns: innerColumnLayout,
                    display: "grid",
                    marginBottom: "10px"
                }}
            >
                {activeForm}
            </div>
        </Form>;
        return form
    }

    render() {
        return (
            <div>
                {this.getActiveForm()}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubplotConfigForm)