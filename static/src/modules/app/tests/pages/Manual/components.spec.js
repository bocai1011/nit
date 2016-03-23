import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import {
    Manual,
    Section,
    Important,
    TableOfContents,
} from 'app/pages/Manual/Components';

describe('Components', function() {

    var ntUtils = new NeatTestUtils(React);
    var sandbox = sinon.sandbox.create();

    afterEach(function () { sandbox.restore(); });

    it('should return a react component class', function() {
        expect(TestUtils.isElement(
            React.createElement(Manual))).to.be.true;
    });

    it('should render an <Important/>', function () {

        var renderSpy = sandbox.spy(TestUtils, 'renderIntoDocument');

        var importantComponent = React.createElement(
            Important, { key: 'imp' }, 'An important message'
        );

        var sectionComponent = React.createElement(
            Section,
            { title: 'Section 1', anchor: '#anchor', key: 'sec' },
            'Some delicious content'
        );

        var manualComponent = React.createElement(
            Manual, { key: 'man' }, 'This is how NEAT works!'
        );


        var components = TestUtils.renderIntoDocument(
            React.DOM.div({}, [
                manualComponent,
                sectionComponent,
                importantComponent,
            ])
        );

        var importantNode = TestUtils.findRenderedDOMComponentWithClass(
            components,
            'alert'
        ).getDOMNode();

        var manualNode = TestUtils.findRenderedDOMComponentWithClass(
            components,
            'neat-manual'
        ).getDOMNode();

        var sectionHeader = TestUtils.findRenderedDOMComponentWithClass(
            components,
            'content-subhead'
        ).getDOMNode();

        expect(renderSpy).to.be.called.and.to.not.throw;
        expect(importantNode.textContent)
            .to.contain('An important message');
        expect(manualNode.textContent)
            .to.contain('This is how NEAT works!');
        expect(sectionHeader.textContent).to.equal('Section 1');

    });

    it('should render a nice table of contents', function () {

        var ToCStub = React.createClass({
            render: function () {
                return (
                    <TableOfContents>
                        <Manual>
                            <Section
                                anchor='#anchor'
                                title='Section'
                            />
                        </Manual>
                    </TableOfContents>
                );
            },
        });

        var component = ntUtils.renderWithContext(ToCStub);
        var uls = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'ul'
        );

        var lis = TestUtils.scryRenderedDOMComponentsWithTag(
            component, 'li'
        );

        expect(uls).to.have.length(2);
        expect(lis).to.have.length(1);

    });

});
