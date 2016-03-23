import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils';
import util from 'common/utils/util';
import LoadingIcon from 'common/components/LoadingIcon';
import Cases from 'app/pages/PageCases/PageCases';

let sandbox, component;
let ntUtils = new NeatTestUtils(React);

describe('Cases', function() {

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should show a loading icon while it\'s retrieving cases', () => {
        sandbox.stub(util, 'get');
        component = ntUtils.renderWithContext(Cases);

        let loadingIcon = TestUtils.findRenderedComponentWithType(
            component,
            LoadingIcon
        );

        expect(loadingIcon).to.exist;

        component.setState({ loading: false });

        loadingIcon = TestUtils.scryRenderedComponentsWithType(
            component,
            LoadingIcon
        );

        expect(loadingIcon).to.be.empty;

    });

    it('should get cases from server & set them to state', function() {
        // Reference to mocked / stubbed data
        var route, cb, testCases = {};

        // Wire up util stub before rendering
        sandbox.stub(util, 'get', function(_route, _cb) {
            route = _route;
            cb = _cb;
        });

        // render
        component = ntUtils.renderWithContext(Cases);

        // wire up setState stub only after rendering the component
        sandbox.stub(component, 'setState');

        cb(testCases);

        // Assert route was GET & cases were set in state
        expect(route).to.equal('/get_cases/');
        expect(component.setState.args[0][0].cases).to.equal(testCases);
    });

    it('should delete all cases when Delete All button clicked', function() {
        component = ntUtils.renderWithContext(Cases);

        sandbox.stub(util, 'post', function(_route, _data, _success) {
            _success();
        });

        sandbox.stub(component, '_getCases');

        component._deleteAllCases();
        expect(util.post).to.have.been.calledWith('/delete_all_cases/');
        expect(component._getCases).to.have.been.called;
    });

    it('should sort cases by name by default', function() {
        component = ntUtils.renderWithContext(Cases);
        var cases = [
            { name: 'foo' },
            { name: 'zed' },
            { name: 'bar' },
        ];
        expect(component._sortCases(cases)).to.eql([
            { name: 'bar' },
            { name: 'foo' },
            { name: 'zed' },
        ]);
    });

    it('should call beginProcessing on file upload', function () {
        component = ntUtils.renderWithContext(Cases);
        sandbox.stub(component, 'beginProcessing');
        component._onFileUpload({ tempPath: 'foo' });
        expect(component.beginProcessing).to.have.been.calledWith(
            'Restore',
            '/restore_case/true',
            'foo'
        );
    });

    it('should sort cases by name in reverse', function() {
        component = ntUtils.renderWithContext(Cases);
        component._sortBy('name');
        var cases = [
            { name: 'foo' },
            { name: 'zed' },
            { name: 'bar' },
        ];
        expect(component._sortCases(cases)).to.eql([
            { name: 'zed' },
            { name: 'foo' },
            { name: 'bar' },
        ]);
    });

    describe('should sort cases by modified / created /status', function() {

        // created mock case objects
        var mod1 = { status: 'locked', update: (new Date(2015, 5, 15)), create: (new Date(2015, 5, 1)) };
        var mod2 = { status: 'unlocked', update: (new Date(2015, 6, 1)), create: (new Date(2015, 6, 1)) };
        var mod3 = { status: 'unlocked', update: (new Date(2015, 7, 1)), create: (new Date(2015, 7, 1)) };

        beforeEach(function() {
            component = ntUtils.renderWithContext(Cases);
        });

        it('should sort cases by when updated', function() {
            component._sortBy('update');
            expect(component._sortCases([mod3, mod2, mod1])).to.eql([mod1, mod2, mod3]);
        });

        it('should sort cases by when created', function() {
            component._sortBy('create');
            expect(component._sortCases([mod3, mod2, mod1])).to.eql([mod1, mod2, mod3]);
        });

        it('should sort cases by status', function() {
            component._sortBy('status');
            expect(component._sortCases([mod3, mod2, mod1])).to.eql([mod1, mod3, mod2]);
        });
    });
});
