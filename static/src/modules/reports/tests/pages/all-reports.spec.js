import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import AllReports from 'reports/pages/AllReports';
import * as helper from 'reports/utils/ReportHelper';

const ntUtils   = new NeatTestUtils(React);

/**
 * Simulates a change event on an input domNode.
 * @param {domNode} input - The input on which to simulate the event.
 * @param {string} value - The event target's value to pass in the sim.
 */
function simulateChange(input, value) {
    TestUtils.Simulate.change(input, {
        target: {
            value: value,
        },
    })
}

/**
 * Finds and returns the search bar input component from the page.
 * @param {component} - The rendered React Component in which to search.
 * @return {domNode} - The input.
 */
function findInput(component) {
    return TestUtils.findRenderedDOMComponentWithTag(component, 'input');
}

function findTagByName(component, tagName) {
    let tags = TestUtils.scryRenderedDOMComponentsWithClass(
        component,
        'tag'
    );

    return ntUtils.filterByTextContent(tags, tagName);
}

/**
 * Get the display names of all the reports rendered in the list.
 * @param {component} - The React Component from which to get the names.
 * @return {array} - Array of strings corresponding to the display names of
 *   the rendered components.
 */
function getReportNames(component) {
    return TestUtils.scryRenderedDOMComponentsWithClass(
        component, 'report-name'
    ).map(domComponent => domComponent.getDOMNode().textContent);
}

/**
 * Renders and returns the component under test.
 * @return {component} - A reference to the rendered React Component.
 */
function renderHelper() {
    let el = React.createElement(AllReports);
    return TestUtils.renderIntoDocument(el);
}

describe('AllReports', () => {

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        helper.reportList = [
            {
                displayName: 'Egyptian Mau',
                urlName: 'Egyptian-Mau',
                meta: [ 'celadon', 'cerise', 'chamoisee' ],
            },
            {
                displayName: 'Khao Manee',
                urlName: 'Khao-Manee',
                meta: [ 'chamoisee', 'emerald' ],
            },
            {
                displayName: 'Turkish Angora',
                urlName: 'Turkish-Angora',
                meta: [ 'feldspar', 'icterine', 'mauve' ],
            },
        ];

        helper.tagSet = new Set([
            'celadon',
            'cerise',
            'chamoisee',
            'emerald',
            'feldspar',
            'icterine',
            'mauve',
        ]);

        sandbox.stub(NeatApp, 'getApp', () => ntUtils.stubForHelpBlurb());
        ntUtils.stubCurrentCase(NeatApp);
    });

    afterEach(() => {
        sandbox.restore();
        ntUtils.unsetCase(NeatApp);
    });

    it('should filter the reports when a tag is selected', () => {
        let component = renderHelper();
        let reportNames = getReportNames(component);

        // Assert that all reports are rendered.
        expect(reportNames).to.eql([
            'Egyptian Mau',
            'Khao Manee',
            'Turkish Angora',
        ]);

        // Click a tag to filter the reports.
        let chamoiseeTag = findTagByName(component, 'Chamoisee');
        TestUtils.Simulate.click(chamoiseeTag);

        reportNames = getReportNames(component);

        // Assert that only the filter reports are rendered.
        expect(reportNames).to.eql([ 'Egyptian Mau', 'Khao Manee' ]);
    });

    it('should filter the reports when a search query is entered', () => {
        let component = renderHelper();
        let reportNames = getReportNames(component);

        // Assert that all reports are rendered.
        expect(reportNames).to.eql([
            'Egyptian Mau',
            'Khao Manee',
            'Turkish Angora',
        ]);

        // Enter a search query.
        let input = findInput(component);
        simulateChange(input, 'Khao');

        reportNames = getReportNames(component);

        // Assert that only reports that match the search query render.
        expect(reportNames).to.eql([ 'Khao Manee' ]);
    });

    it('should restore the reports list when a tag is cleared', () => {
        let component = renderHelper();

        // Click a tag to filter the reports.
        let chamoiseeTag = findTagByName(component, 'Chamoisee');
        TestUtils.Simulate.click(chamoiseeTag);

        let reportNames = getReportNames(component);

        expect(reportNames).to.eql([ 'Egyptian Mau', 'Khao Manee' ]);

        // De-select the tag.
        TestUtils.Simulate.click(chamoiseeTag);

        reportNames = getReportNames(component);

        // Assert all reports are again rendered.
        expect(reportNames).to.eql([
            'Egyptian Mau',
            'Khao Manee',
            'Turkish Angora',
        ]);
    });

    it('should restore the reports list when a search query is removed',
        () => {
            let component = renderHelper();

            // Enter a search query.
            let input = findInput(component);
            simulateChange(input, 'Khao');

            let reportNames = getReportNames(component);

            // Assert that only reports that match the search query render.
            expect(reportNames).to.eql([ 'Khao Manee' ]);

            // Clear the search bar.
            simulateChange(input, '');

            reportNames = getReportNames(component);

            // Assert all reports are rendered.
            expect(reportNames).to.eql([
                'Egyptian Mau',
                'Khao Manee',
                'Turkish Angora',
            ]);
        }
    );

    it('should restore all reports when the Clear All button is clicked',
        () => {
            let component = renderHelper();

            let celadonTag = findTagByName(component, 'Celadon');
            let icterineTag = findTagByName(component, 'Icterine');

            TestUtils.Simulate.click(celadonTag);
            TestUtils.Simulate.click(icterineTag);

            let reportNames = getReportNames(component);

            // Assert that only reports with matching tags are rendered.
            expect(reportNames).to.eql([
                'Egyptian Mau',
                'Turkish Angora',
            ]);

            let clearAll = TestUtils.findRenderedDOMComponentWithClass(
                component,
                'clear-selected-tags'
            );

            // Click the "Clear All" button.
            TestUtils.Simulate.click(clearAll);

            reportNames = getReportNames(component);

            // Assert that no reports have been filtered.
            expect(reportNames).to.eql([
                'Egyptian Mau',
                'Khao Manee',
                'Turkish Angora',
            ]);
        }
    );

});
