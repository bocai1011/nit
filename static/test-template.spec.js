'use strict';

// Example of how to write a JS Unit test
//
// Test files follow the same RequireJS format as the source files. However,
// there is a RequireJS config specifically for running the unit tests, at
//
//   neat/static/tests/test-main.js
//
// Within a test file you should use describe('MyModule', function() {}); to
// create a test context where test cases can be written.
//
// Test fixtures are declared in beforeEach() and afterEach() methods.
//
// Test cases are defined in it('description', function() {}) methods.
//
// Assertions are made with the expect().to.equal() syntax (this is chai.js)
//
// For the sake of consistency please try to follow the existing conventions:
//  * each source file should have its own corresponding test file
//  * test files are named in lower case with dash separators
//  * test files end with .spec.js extension
//  * it() descriptions should start with 'should', e.g. 'should return 3
//    when adding 1 + 2'
//  * don't test too many things in a single test case, try to stick to one
//    assertion if possible.
//

define([
    'react',
], function (
    React
) {

    // Global reference to the SinonJS sandbox.
    var sandbox = sinon.sandbox.create();

    // Shortcut reference to TestUtils
    var TestUtils = React.addons.TestUtils;

    // Our own, home-baked NEAT test utilities.
    var ntUtils = new NeatTestUtils(React);

    describe('MyClass', function() {

        beforeEach(function () {
            // Code that will run before each test case.
        });

        afterEach(function () {
            // If you set up a sandbox make sure to restore it in afterEach. This
            // will clear the mocks/stubs/spies you set up in your test case
            sandbox.restore();
        });


        // Here is an example test case that renders a component and checks
        // its text content

        it('should test something', function() {

            // Create the element
            var el = React.createElement(MyClass);

            // Render the component
            var component = TestUtils.renderIntoDocument(el);

            // Find sub component by tag
            var span = TestUtils.findRenderedDOMComponentWithTag(
                component, 'span');

            // Assert something
            expect(span.getDOMNode().textContent).to.equal('foo');
        });

        // Here is an example where we render a component that requires a
        // React Router context.

        it('should transition to the error page on error', function () {

            // Create the component. Note that you don't need to create a
            // React element and then pass it to the renderWithContext() method.
            // Just pass the React Class; the method will create the element and
            // render it for you.
            var component = ntUtils.renderWithContext(MyClass, {
                transitionTo: sandbox.spy(),
            });

            component.causeAnErrorToOccur();

            expect(component.transitionTo).to.have.been.calledWith('error');
        });

        // Here is an example where we render a MappableWidget selector and click on
        // an item within it

        it('should propagate onSelect call from dropdown back to parent', function() {
            var vals = ['val1'];
            var props = {
                values: vals,
                options: ['opt1', 'opt2'],
                onSelect: sandbox.spy()
            };

            var el = React.createElement(MappableWidget, props);
            var component = TestUtils.renderIntoDocument(el);

            // Toggle the dropdown
            var btn = TestUtils.findRenderedDOMComponentWithTag(
                component, 'button');
            TestUtils.Simulate.focus(btn.getDOMNode());
            TestUtils.Simulate.click(btn.getDOMNode());

            // Simulate click
            var anchors = TestUtils.scryRenderedDOMComponentsWithTag(
                component, 'a');
            TestUtils.Simulate.click(anchors[0].getDOMNode());
            expect(props.onSelect).to.have.been.called;
        });
    });
});

// TestUtils cheatsheet
//
// Simulate
// renderIntoDocument
// mockComponent

// isElement
// isElementOfType
// isDOMComponent
// isCompositeComponent
// isCompositeComponentWithType

// findAllInRenderedTree

// findRenderedDOMComponentWithClass
// findRenderedDOMComponentWithTag
// findRenderedComponentWithType

// scryRenderedDOMComponentsWithClass
// scryRenderedDOMComponentsWithTag
// scryRenderedComponentsWithType
