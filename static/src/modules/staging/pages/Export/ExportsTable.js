import React from 'react';
import { Row, Col, Well, Alert, Table } from 'react-bootstrap';
import ProgressMixin from 'common/utils/ProgressMixin';
import util from 'common/utils/util';
import AppButton from 'common/components/AppButton';
import NeatApp from 'app/utils/NeatApp';
import ExportsTableItem from 'staging/pages/Export/ExportsTableItem';
import format from 'string-format';

var ExportsTable = React.createClass({

    mixins: [ProgressMixin],

    getInitialState: function () {
        return {
            generated: false,
            href: null
        };
    },

    propTypes: {
        name: React.PropTypes.string.isRequired,
        available: React.PropTypes.bool.isRequired,
        includes: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
    },

    _generateCSV: function() {
        var ALL = 'all',
            CODE = 'code',
            EXCLUDE = 'exclude';

        var options = {}, self = this;
        this.props.includes.forEach(function(fTbl,index) {
            if (index===0) {
                return;
            }
            var item = self.refs['item'+index];

            if ( item.state.include && !item.state.codeOnly ) {
                options[fTbl] = ALL;
            } else if ( item.state.include ) {
                options[fTbl] = CODE;
            } else {
                options[fTbl] = EXCLUDE;
            }
        });

        var url = format(
            '/generate_denormalized_csv_export/{}/{}/{}',
            NeatApp.caseName(),
            this.props.name,
            encodeURIComponent(JSON.stringify(options))
        );

        this.useFakeAsynch();
        this.beginProcessing('Generate CSV', url);
    },

    _resetGenerateButtons: function() {
        this.setState({generated: false});
    },

    onSuccessfulProcess: function(filePath) {
        var pathSeparator = /\\/g.test(filePath) ? '\\' : '/';
        var tmpDir = filePath.split(pathSeparator).slice(-3, -1)[0];
        var fileName = util.filenameFromPath(filePath);
        var url = format(
            '/download_denormalized_csv_export/{}?filename={}&tmpdir={}',
            NeatApp.caseName(),
            encodeURIComponent(fileName),
            encodeURIComponent(tmpDir)
        );
        this.setState({generated: true, href: url});
    },

    render: function() {
        var buttonOrLink;
        var progress = null;
        var status = null;

        if (!this.props.available) {
            status = (
                <Alert bsStyle='warning'>
                    <h4><i className='fa fa-hourglass-half' /> Unavailable</h4>
                    This export is unavailable because the case is too early in staging.
                    Please try again after completing Symbol Rectification.
                </Alert>
            );
        }

        if (this.state.processing) {
            progress = this.renderProgress();
        }

        if ( this.state.generated ) {
            buttonOrLink = (
                <Well bsStyle='link'>
                    <i className='fa fa-download' /> <a href={this.state.href} download>Download CSV</a>
                </Well>
            );
        } else {
            buttonOrLink = (
                <div>
                    <AppButton
                        name='GenerateCSV'
                        onClick={this._generateCSV}
                        tooltip='Click to generate the desired CSV file'
                        disabled={!this.props.available}
                        block
                    />
                </div>
            );
        }

        var self = this;

        return (
            <div>
                {progress}
                {status}
                <Row>
                    <Col md={8}>
                        <Table bordered condensed hover>
                            <tbody>
                                {this.props.includes.map(function(fTbl,index) {
                                    return (
                                        <ExportsTableItem
                                            ref={'item'+index}
                                            foreignTable={fTbl}
                                            index={index}
                                            resetGenerateButtons={self._resetGenerateButtons}
                                        />
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={4}>
                        {buttonOrLink}
                    </Col>
                </Row>
            </div>
        );
    }
});

export default ExportsTable;
