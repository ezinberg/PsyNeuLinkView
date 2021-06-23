import * as React from "react"
import {DeleteOutlined} from "@ant-design/icons"
import {Button, Divider, Empty, Typography} from "antd";
import {connect} from 'react-redux'
import {setPlotSpecs} from "../state/core/actions";
import VirtualTable from "./virtual-table";
import {getMapIdToDataSourceColors, getMapIdToDataSources} from "../state/subplots/selectors";
import {getPsyNeuLinkMapIdToName} from "../state/psyneulink-registry/selectors";
import {getPsyNeuLinkParameterMetadata} from "../state/psyneulink-parameters/selectors";
import {editDataSourceColor, removeDataSource} from "../state/subplots/actions";
import ColorPicker from "rc-color-picker";
import 'rc-color-picker/assets/index.css';
import {row} from "mathjs";

const { Text } = Typography;

const mapStateToProps = ({core, subplots, psyNeuLinkParameters, psyNeuLinkRegistry}) => {
    return {
        plotSpecs:core.plotSpecs,
        subplotMapIdToSelectedDataSources:getMapIdToDataSources(subplots),
        subplotMapIdToSelectedDataSourceColors:getMapIdToDataSourceColors(subplots),
        psyNeuLinkParameterMetadata:getPsyNeuLinkParameterMetadata(psyNeuLinkParameters),
        psyNeuLinkMapIdToName:getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
    }
};

const mapDispatchToProps = dispatch => ({
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
    removeDataSource: ({id, dataSourceId}) => dispatch(removeDataSource({id, dataSourceId})),
    editDataSourceColor: ({id, dataSourceId, color}) => dispatch(editDataSourceColor({id, dataSourceId, color}))
});

class SelectedDataSourceTable extends React.Component{
    reduxPrefix = 'sdst';

    state = {
        dataTable:[],
    };

    constructor() {
        super();
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.buildDataTable = this.buildDataTable.bind(this);
    }

    getDeleteButton(mechanism, rowId) {
        return (
            <div style={{
                textAlign: 'center'
            }}>
                <Button
                    style={{border: "none"}}
                    icon={<DeleteOutlined/>}
                    onClick={() => {this.removeRecord(rowId)}}/>
            </div>
        )
    }

    getColorPicker(mechanism, rowId) {
        let {id, subplotMapIdToSelectedDataSourceColors: idToColors, editDataSourceColor} = this.props;
        let color = idToColors[id][rowId];
        return (
            <div style={{
                textAlign: 'left',
                paddingLeft: '10px'
            }}>
                <ColorPicker
                    animation="slide-up"
                    color={color}
                    onClose={
                        (e)=>{
                            editDataSourceColor(
                                {id: id, dataSourceId: rowId, color: e.color}
                            )
                        }
                    }
                />
            </div>
        )
    }

    buildDataTable() {
        const {
            id: plotId,
            subplotMapIdToSelectedDataSources: plotIdToSelected,
            psyNeuLinkParameterMetadata: pnlParameterMetadata,
            psyNeuLinkMapIdToName: pnlIdToName
        } = this.props;
        const selected = plotIdToSelected[plotId];
        if (!selected){
            return []
        }
        var dataTable = [];
        for (const parameterId of selected){
            let metadata = pnlParameterMetadata[parameterId];
            let mechanismName = pnlIdToName[metadata.ownerId];
            let parameterName = pnlIdToName[parameterId];
            dataTable.push(
                {
                    id: parameterId,
                    mechanismName: mechanismName,
                    parameterName: parameterName,
                    colorPicker: this.getColorPicker(mechanismName, parameterId),
                    button: this.getDeleteButton(mechanismName, parameterId)
                }
            )
        }
        return dataTable
    }

    removeRecord(rowId){
        const {removeDataSource} = this.props;
        removeDataSource({id: this.props.id, dataSourceId: rowId})
    }

    render() {
        const dataTable = this.buildDataTable();
        return (
                <div
                    className={'selected-data-source-table'}>
                    <div style={{width:this.props.size.width}}>
                        <div/>
                    </div>
                    <VirtualTable
                        name={`${this.props.id}-dataTables`}
                        rowKey={(row) => row.id}
                        size="small"
                        onChange={this.onChange}
                        cellCheckbox={false}
                        cellDelete={true}
                        removeRecord={()=>{}}
                        locale={{ emptyText: <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{
                                    'height':this.props.size.height-117,
                                    'display': 'flex',
                                    'flexDirection': 'column',
                                    'justifyContent': 'center'
                                }}/> }}
                        columns={[
                            {
                                title: "Mechanism",
                                key: "mechanismName",
                                render: (text, record, i) => (
                                    <Text>
                                        {dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                title:<div className={'title-wrapper'}
                                           style={{'marginLeft':'8px'}}>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Parameter
                                    </Text>
                                </div>,
                                key: "parameterName",
                                render: (text, record, i) => (
                                    <Text>
                                        {dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                title: <div className={'title-wrapper'}
                                            style={{'marginLeft':'8px'}}>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Color
                                    </Text>
                                </div>,
                                key: "colorPicker",
                                render: (text, record, i) => (
                                    <div className={'test-div'}>
                                        {this.getColorPicker(dataTable[i].mechanismName, dataTable[i].id)}
                                    </div>
                                )
                            },
                            {
                                key: "button",
                                align: "right"
                            },
                        ]}
                        // dataSource={this.buildDataTable()}
                        dataSource={dataTable}
                        scroll={{
                            y: this.props.size.height - 117,
                        }}
                    />,
                </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedDataSourceTable)
