import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import NeatApp from 'app/utils/NeatApp';
import ReportButton from 'reports/components/ReportButton';

let ntUtils = new NeatTestUtils(React);

describe('ReportButton', () => {

    let sandbox = sinon.sandbox.create();
    let transitionSpy;

    beforeEach(() => {
        sandbox.stub(NeatApp, 'getCurrentCase', () => {
            return {
                name: 'Aubergine',
            };
        });

        transitionSpy = sandbox.spy();
    })

    afterEach(() => {
        sandbox.restore();
    });

    it('should transition to a PAGE on click', () => {
        let reportButton = ntUtils.renderWithContext(ReportButton, {
            transitionTo: transitionSpy,
            props: {
                page: 'a-cool-page',
            },
        });

        let domNode = TestUtils.findRenderedDOMComponentWithClass(
            reportButton,
            'report-button'
        );

        TestUtils.Simulate.click(domNode);

        expect(transitionSpy).to.have.been.calledWith(
            'a-cool-page',
            { name: 'Aubergine' }
        );
    });

    it('should transition to a REPORT on click',
        () => {
            let reportButton = ntUtils.renderWithContext(ReportButton, {
                transitionTo: transitionSpy,
                props: {
                    report: 'A-Cool-Report',
                },
            });

            let domNode = TestUtils.findRenderedDOMComponentWithClass(
                reportButton,
                'report-button'
            );

            TestUtils.Simulate.click(domNode);

            expect(transitionSpy).to.have.been.calledWith(
                'report',
                {
                    name: 'Aubergine',
                    report: 'A-Cool-Report',
                }
            );
        }
    );

});
