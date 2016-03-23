import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import ColumnNameWidget from 'staging/components/ColumnNameWidget/ColumnNameWidget';

describe('ColumnNameWidget', function() {

    var sandbox;
    var shallowRenderer = TestUtils.createRenderer();

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    var makeObj = function(name) {
        return {
            options: [{
                name: name,
                selected_display: name
            }],
            mapping: {
                type: 'bar',
                name: name
            },
            values: ['val1', 'val2']
        };
    };

    var createEl = function(props) {
        if (props.item === undefined) {
            props.item = { type: 'foo' };
        }
        if (props.onChange === undefined) {
            props.onChange = function() {};
        }
        return React.createElement(ColumnNameWidget, props);
    };

    it('should render X number of rows', function() {
        var rows = [{}, {}, {}, {}];
        var el = createEl({ layout: rows });
        shallowRenderer.render(el);
        var component = shallowRenderer.getRenderOutput();
        var childrenRows = component.props.children[1].props.children;
        expect(React.Children.count(childrenRows)).to.equal(rows.length);
    });

    it('should find repeats on calculateRepeats()', function() {
        var layout =  [makeObj('foo'), makeObj('foo'), makeObj('foo')];
        var el = createEl({ layout: layout });
        // Use renderIntoDocument instead of shallowRenderer because latter
        // doesn't allow access to _calculateRepeats()
        var component = TestUtils.renderIntoDocument(el);
        var repeats = component._calculateRepeats();
        expect(repeats.length).to.equal(layout.length - 1);
    });

    it('should find no repeats on calculateRepeats()', function() {
        var layout =  [makeObj('foo'), makeObj('bar'), makeObj('baz')];
        var el = createEl({ layout: layout });
        var component = TestUtils.renderIntoDocument(el);
        var repeats = component._calculateRepeats();
        expect(repeats.length).to.equal(0);
    });

    it('should update selector when mapping conflict resolved', function() {
        var layout =  [makeObj('foo'), makeObj('foo')];
        var el = createEl({ layout: layout });
        var component = TestUtils.renderIntoDocument(el);
        sandbox.spy(component.selectors[0], 'forceUpdate');
        component.selectors[0].props.column.mapping.name = 'bar';
        component._updateGlobalInfo();
        expect(component.selectors[0].forceUpdate).to.have.been.called;
    });

    // it('should handle change event', function() {
    //     var rows = [{}, {}, {}, {}];
    //     var el = React.createEl(ColumnNameWidget, {
    //         layout: [{
    //             options: [{
    //                 name: 'foo',
    //                 selected_display: 'foo'
    //             }],
    //             mapping: {
    //                 type: 'bar',
    //                 name: 'foo'
    //             },
    //             values: ['val1', 'val2']
    //         }],
    //         item: {
    //             type: 'foo'
    //         },
    //         onChange: function() { console.log('change'); }
    //     });

    //     // Use renderIntoDocument instead of shallowRenderer because latter
    //     // doesn't propagate change event
    //     var component = TestUtils.renderIntoDocument(el);
    //     console.log(Object.keys(component));
    //     var repeats = component.calculateRepeats();
    //     expect(repeats.length).to.equal(0);
    //     // var node = React.findDOMNode(component);
    //     // sandbox.stub(component, 'updateGlobalInfo', function() {});
    //     // var childrenRows = component.props.children;
    //     // console.log(Object.keys(component.selectors[0].props))
    //     // React.Children.forEach(childrenRows, function(child) {
    //     //     console.log('test', child)
    //     // });
    //     // var arr = TestUtils.scryRenderedDOMComponentsWithTag(component, 'button');
    //     // console.log(arr.length);
    //     // TestUtils.Simulate.change(arr[0]);
    //     // TestUtils.findAllInRenderedTree(component, function(comp) {
    //     //     console.log('comp', comp.getDOMNode().constructor);
    //     // })
    //     // expect(component.updateGlobalInfo).to.have.been.called;
    //     // var childrenRows = component.props.children[1].props.children;
    //     // expect(React.Children.count(childrenRows)).to.equal(rows.length);
    // });
});
