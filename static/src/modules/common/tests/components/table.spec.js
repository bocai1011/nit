import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import $ from 'jquery';
import Table from 'common/components/Table';

describe('Table', function () {
    it('should create a ReactElement', function () {
        var props = {
            caption: '',
            columnCssClasses: {},
            data: {
                data: {
                    pandas: {
                        axes: {
                            columns: {
                                dtype: '|O8',
                                names: [null],
                                values: ['Index', 'Date', 'Tid'],
                            },
                            index: {
                                dtype: '<i8',
                                names: [null],
                                values: [0,1,2],
                            },
                        },
                        date_unit: 'ms',
                        dtypes: {
                            character: ['q', 'O', 'O'],
                            kind: ['Integer', null, null],
                            str: ['<i8', '|O8', '|O8'],
                        },
                        orient: 'records',
                        type: 'DataFrame',
                        values: [
                            { Index: 0, Date: '2012-12-12', Tid: '' },
                            { Index: 1, Date: '2012-10-02', Tid: '' },
                            { Index: 2, Date: '2012-12-26', Tid: '' },
                        ],
                        version: '0.16.2',
                    },
                },
                meta: {
                    format_spec: {
                        fee: { precision: 2 },
                        gross_amt: { precision: 0 },
                        gross_comm: { precision: 2 },
                        net_amt: { precision: 0 },
                        notional: { precision: 0 },
                        price: { precision: 2 },
                        strategy: { precision: 2 },
                    },
                    link: {},
                    type: 'StagingTable',
                },
            },
            editors: {},
            options: {
                forceFitColumns: false,
                gridHeight: '90%',
            },
            style: {
                width: '100%',
            },
        };

        var el = React.createElement(Table, props);
        expect(TestUtils.isElementOfType(el, Table)).to.be.true;
    });

    // Rendering is currently failing because some of the 508 JavaScript
    // is not playing nicely with the testing environment.
    it('should properly render');

});
