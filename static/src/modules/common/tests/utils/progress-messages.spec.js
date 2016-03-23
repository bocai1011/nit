import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import ProgressMessages from 'common/utils/ProgressMessages';

var sandbox;

describe('ProgressMessages', function() {

    var el, component;

    beforeEach(function () {
        el = <ProgressMessages msgList={['foo']}/>;
        component = TestUtils.renderIntoDocument(el);
    })

    it('should return a react component class', function() {
        expect(TestUtils.isElement(el)).to.be.true;
    });

    it('should get a class name of "progressmessages" if msgList has positive length', function () {
        expect(component.getDOMNode().classList.contains('progressmessages'))
            .to
            .be
            .true;
    });

    it('should NOT get a class name of "progressmessages" if msgList has length 0', function () {
        var el0 = <ProgressMessages msgList={[]}/>;
        var component0 = TestUtils.renderIntoDocument(el0);
        expect(component0.getDOMNode()).to.equal(null);
    })

});
