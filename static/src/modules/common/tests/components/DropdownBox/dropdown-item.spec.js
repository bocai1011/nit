import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import DropdownItem from 'common/components/DropdownBox/DropdownItem';

describe('DropdownItem', function () {

    it('should create a <DropdownItem/>', function () {
        var el = (<DropdownItem info={{description: 'Foooo'}}/>);
        expect(TestUtils.isElementOfType(el, DropdownItem)).to.be.true;
    });

});
