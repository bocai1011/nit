import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import Chart from 'reports/utils/Chart/Chart';
import LoadingIcon from 'common/components/LoadingIcon';
import CallStack from 'reports/components/charts/CallStack';

describe('Chart', function () {

    let shallow = TestUtils.createRenderer(),
        render = function (element) {
            shallow.render(element);
            return shallow.getRenderOutput();
        },
        ntUtils = new NeatTestUtils(React),
        sandbox = sinon.sandbox.create();


    afterEach(() => sandbox.restore());

    it('should render a LoadingIcon when props.loading is true', () => {

        let component = render(<Chart title='Le District' loading={true} />),
            child = React.Children.only(component.props.children);

        expect(TestUtils.isElementOfType(child, LoadingIcon)).to.be.true;

    });

    it('should render an error Panel when it has a props.error', () => {
        let component = render(<Chart title='Le District' error=':(' />);
        expect(component.props.bsStyle).to.equal('danger');
    });

    it('should call its download methods when the buttons are clicked', () => {

        let downloaders,
            component,
            menuItems,
            csv, xlsx, notebook;

        downloaders = {
            downloadCSV: sandbox.spy(),
            downloadXLSX: sandbox.spy(),
            downloadNotebook: sandbox.spy(),
        }

        component = TestUtils.renderIntoDocument(
            <Chart title='Le District' { ...downloaders } />
        );

        // Find all the <li>'s in the <Chart>. They're <ChartItem>s.
        menuItems = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'li'
        );

        // Pick out the download buttons.
        csv = ntUtils.filterByTextContent(menuItems, 'Download CSV');
        xlsx = ntUtils.filterByTextContent(menuItems, 'Download XLSX');
        notebook = ntUtils.filterByTextContent(
            menuItems,
            'Export Calculation as iPython Notebook'
        );

        TestUtils.Simulate.click(csv);
        expect(downloaders.downloadCSV).to.have.been.calledOnce;

        TestUtils.Simulate.click(xlsx);
        expect(downloaders.downloadXLSX).to.have.been.calledOnce;

        TestUtils.Simulate.click(notebook);
        expect(downloaders.downloadNotebook).to.have.been.calledOnce;

    });

    it('should display a CallStack when its button is clicked', () => {

        sandbox.stub(NeatApp, 'getApp', () => {
            return {
                NeatOptions: { Debugging: { value: true } },
            };
        });

        let menuItems,
            callstack,
            callstackBtn,
            component = TestUtils.renderIntoDocument(
                <Chart title='Le District' queryCalls={[]} />
            );

        // Get a reference to the <CallStack> component.
        callstack = TestUtils.findRenderedComponentWithType(
            component,
            CallStack
        );

        // Get an array of the Chart's <ChartItem>s.
        menuItems = TestUtils.scryRenderedDOMComponentsWithTag(
            component,
            'li'
        );

        // Pick out the View Call Stack <ChartItem>.
        callstackBtn = ntUtils.filterByTextContent(
            menuItems,
            'View Query Call Stack'
        );

        expect(callstack.props.visible).to.be.false;
        TestUtils.Simulate.click(callstackBtn);
        expect(callstack.props.visible).to.be.true;

    });

});
