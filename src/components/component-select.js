import React from 'react';
import 'antd/dist/antd.css';
import {Select} from 'antd';
import {Icon} from "@blueprintjs/core";
import {connect} from "react-redux";
import {setComponentFocus} from "../state/subplot-config-form/actions";
import {getMapParentIdToComponentFocus} from "../state/subplot-config-form/selectors";

const { Option } = Select;

const mapStateToProps = ({subplotConfigForm}) => {
    return {
        idToComponentFocus: getMapParentIdToComponentFocus(subplotConfigForm)
    }
};

const mapDispatchToProps = dispatch => ({
    setComponentFocus: ({parentId, tabKey}) => dispatch(setComponentFocus({parentId, tabKey}))
});

class ComponentSelect extends React.Component {
    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        var _ = this;
        this.onChange = this.onChange.bind(this);
        [this.render, this.onChange].forEach(
            fx=>fx=fx.bind(_)
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    onChange(value) {
        let {id, setComponentFocus} = this.props;
        setComponentFocus({parentId: id, tabKey: value});
    }

    onBlur() {
    }

    onFocus() {
    }

    onSearch(val) {
    }
    render() {
        var {id, idToComponentFocus} = this.props;
        var componentNames = [];
        var activeOption = idToComponentFocus[id] ?? null;
        for (const name of this.props.components){
            componentNames.push(
                <Option key={name}
                        value={name}
                        style={
                            {position:'flex',
                             flexDirection:'row',
                             justifyContent:'center',
                             alignContent:'center'}}><Icon iconSize={14} icon={'cog'} style={{'marginRight':'10px'}}/>{name}</Option>
            )
        }
        return (
            <Select
                showSearch
                style={{width: 300}}
                placeholder="Select a mechanism"
                optionFilterProp="PsyNeuLink Mechanisms"
                // dropdownStyle={{backgroundColor:'palevioletred'}}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onSearch={this.onSearch}
                bordered={this.props.bordered}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={activeOption}
            >
                {componentNames}
            </Select>)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentSelect);