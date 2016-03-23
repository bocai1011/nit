import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ProcessingResults from 'staging/pages/StagingFile/ProcessingResults';

describe('ProcessingResults', function () {

    describe('#_make()', function () {

        it('should indicate number of lines and number of errors',
            function () {
                var el = React.createElement(ProcessingResults, {
                    item: {
                        success: true,
                        lineCount: 1,
                    }
                });

                var component = TestUtils.renderIntoDocument(el);

                expect(component.getDOMNode().textContent).to.equal(
                    '1 line with 0 errors'
                );
            }
        );

    });

});
