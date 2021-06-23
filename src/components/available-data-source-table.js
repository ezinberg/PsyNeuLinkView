import {Checkbox, Divider, Empty, Typography} from "antd"
import * as React from "react"
import {connect} from 'react-redux';
import VirtualTable from "./virtual-table";
import * as _ from "lodash";
import {setPlotSpecs} from "../state/core/actions";
import {registerParameters} from "../state/psyneulink-parameters/actions"
import {addDataSource, removeDataSource} from "../state/subplots/actions";
import {createId} from "../state/util";
import {ID_LEN, PNL_PREFIX} from "../keywords";
import {
    getPsyNeuLinkIdSet,
    getPsyNeuLinkMapIdToName,
} from "../state/psyneulink-registry/selectors";
import {getMapParentIdToComponentFocus} from "../state/subplot-config-form/selectors";
import {setComponentFocus} from "../state/subplot-config-form/actions";
import {
    getComponentMapIdToParameterSet,
    getComponentMapNameToId,
    getMapIdToName
} from "../state/psyneulink-components/selectors";
import {getMapIdToDataSources} from "../state/subplots/selectors";

const { Text } = Typography;
const rpc = window.interfaces.rpc;

const mapStateToProps = ({core, psyNeuLinkRegistry, psyNeuLinkComponents, subplots, subplotConfigForm}) => {
    return {
        plotSpecs:core.plotSpecs,
        psyNeuLinkIdSet:getPsyNeuLinkIdSet(psyNeuLinkRegistry),
        psyNeuLinkMapIdToName:getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
        psyNeuLinkMapComponentIdToParameterIds:getComponentMapIdToParameterSet(psyNeuLinkComponents),
        psyNeuLinkMapComponentNameToId:getComponentMapNameToId(psyNeuLinkComponents),
        psyNeuLinkMapComponentIdToName:getMapIdToName(psyNeuLinkComponents),
        subplotMapIdToComponentFocus:getMapParentIdToComponentFocus(subplotConfigForm),
        subplotMapIdToSelectedDataSources:getMapIdToDataSources(subplots)
    }
};

const mapDispatchToProps = dispatch => ({
    addDataSource: ({id, dataSourceId}) => dispatch(addDataSource({id, dataSourceId})),
    removeDataSource: ({id, dataSourceId}) => dispatch(removeDataSource({id, dataSourceId})),
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
    registerParameters: ({ownerId, parameterSpecs}) => dispatch(registerParameters({ownerId, parameterSpecs})),
    setComponentFocus: ({id, tabKey}) => dispatch(setComponentFocus({id, tabKey}))
});

class AvailableDataSourceTable extends React.Component{
    state = {
        selectedDataSources: {},
        parameterLists: {},
    };
    selectionType = 'checkbox';

    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        if (this.props.components.length > 0){this.updateComponents()}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.components, this.props.components)) {
            this.updateComponents();
        }
    }

    updateComponents(){
        // const {psyNeuLinkMapComponentNameToId: nameToId,
        //     psyNeuLinkMapComponentIdToParameterIds: idToParameters} = this.props;
        // for (const component of this.props.components){
        //     if (!(nameToId[component] in idToParameters)){
        //         rpc.getParameters(component)
        //     }
        // }
    }

    updateDataTablesForId(id){
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
        // this.handleParameterList = this.handleParameterList.bind(this);
    }

    getActiveDataTable(){
        let {
            id: plotId,
            subplotMapIdToComponentFocus: mapIdToFocus,
            subplotMapIdToSelectedDataSources: selected,
            psyNeuLinkMapComponentIdToParameterIds: mapComponentIdToParameterIds,
            psyNeuLinkMapComponentNameToId: mapNameToId,
            psyNeuLinkMapIdToName: idToName
            } = this.props;
        let componentFocus = mapIdToFocus[plotId];
        if (!componentFocus){return []}
        let componentId = mapNameToId[componentFocus];
        let available = mapComponentIdToParameterIds[componentId] ?? [];
        selected = selected[plotId] ?? new Set();
        return [...available].map(
            parameterId => {
                return {
                    id: parameterId,
                    name: idToName[parameterId],
                    selected: selected.has(parameterId)
                }
            }
        );
    }

    onChange(e, row){
        const {id, addDataSource, removeDataSource} = this.props,
            isChecked = e.target.checked;
        if (isChecked){
            addDataSource({id:id, dataSourceId:row.id})
        }
        else {
            removeDataSource({id:id, dataSourceId:row.id})
        }
    }

    render() {
        let activeDataTable = this.getActiveDataTable();
        return (
            <div>
                <div style={{width:this.props.size.width}}>
                    <div/>
                </div>
                <VirtualTable
                    name={`${this.props.id}-dataTables`}
                    rowKey={(row) => row.id}
                    size="small"
                    cellCheckbox={true}
                    cellDelete={false}
                    onChange={this.onChange}
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
                            title:
                                <div className={'title-wrapper'}
                                    style={{'marginLeft':'8px'}}>
                                    <Checkbox onChange={(e)=>{}}
                                              style={{marginRight:'30px'}}/>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Name
                                    </Text>
                                </div>,
                            key: "name",
                            render: (text, record, i) =>
                                <Text>
                                    {activeDataTable[i].name}
                                </Text>,
                            // width: 300
                        },
                    ]}
                    dataSource={activeDataTable}
                    scroll={{
                        y: this.props.size.height - 117,
                    }}
                />,
            </div>
        )
    }
}

AvailableDataSourceTable = connect(mapStateToProps, mapDispatchToProps)(AvailableDataSourceTable);

export default AvailableDataSourceTable