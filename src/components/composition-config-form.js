import React from 'react'
import '../css/paramform.css';
import {Divider, Input, Upload, Button} from "antd"
import {UploadOutlined} from "@ant-design/icons";
import {connect} from "react-redux";
import {setInputFile} from "../state/core/actions";

const mapStateToProps = ({core}) => {
    return {
        inputFile: core.inputFile
    }
};

const mapDispatchToProps = dispatch =>({
    setInputFile: (filePath) => dispatch(setInputFile(filePath))
});

class CompositionConfigForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var id = this.props.id;
        let groupProportion = '50%';
        let labelProportion = '14%';
        let inputProportion = '36%';
        const fileList = this.props.inputFile.length > 0 ? [
            {
                uid: '-1',
                name: this.props.inputFile[0],
                status: 'done',
            }
        ] : [];

        return (
        <div className={'metadata-row-container'}
            style={{
            padding:"10px",
            display: "grid",
            gridTemplateColumns: "1fr 100fr",
        }}
        >
            <div/>
            <div className={'horizontal-divider-container'}>
                <Divider orientation="left" plain>
                    Input
                </Divider>
            </div>
            <div/>
            <Input.Group
                style={{
                    width: groupProportion,
                    marginRight: "10px",
                    display: "inline-block"
                }}>
                <Input
                    disabled
                    value={"Input File"}
                    style={{width: labelProportion, color: 'rgba(0, 0, 0, 1)', cursor: 'auto'}}/>
                <Upload
                    disabled
                    name={'file'}
                    fileList={fileList}
                >
                    <Button
                        icon={<UploadOutlined />}
                        onClick={
                            ()=>{
                                window.dialog.showOpenDialog(
                                    window.getCurrentWindow(),
                                    {
                                        filters: [
                                            {name: 'JSON', extensions: ['json', 'txt']}
                                        ]
                                    }
                                ).then((paths) => {
                                        var pathArray = paths.filePaths;
                                        this.props.setInputFile(pathArray)
                                    }
                                )
                            }
                        }>
                    </Button>
                </Upload>
            </Input.Group>
        </div>
    )}
}

export default connect(mapStateToProps, mapDispatchToProps)(CompositionConfigForm)