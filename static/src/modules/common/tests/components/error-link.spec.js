import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ErrorLink from 'common/components/ErrorLink';

describe('ErrorLink', function () {

    it('should correctly render', function () {
        var el = <ErrorLink
                    error='An error!'
                    recommend='Do this:'
                    text='A text.'
                    title='ErrorLink'
                 />

        var component = TestUtils.renderIntoDocument(el);
        expect(component).to.exist;
        expect(TestUtils.isElementOfType(el, ErrorLink)).true;
    });

});
