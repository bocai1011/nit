import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import util from 'common/utils/util';
import CaseItem from 'app/pages/PageCases/CaseItem';

describe('CaseItem', function () {

    var transitionSpy;

    var caseObj = {
        base: 'foo',
        name: 'foo-20151107030000-20151108030000-locked',
        create: '20151107030000',
        update: '20151108030000',
        compat: 'ok',
    };

    var ntUtils = new NeatTestUtils(React);

    var sandbox = sinon.sandbox.create();

    // We have to wrap the <CaseItem/> in a <table> because if we don't,
    // React has trouble rendering it as a standalone <tr>. So this just
    // wraps <CaseItem/> passes down all the props, and attaches a ref so
    // we can reference the actual <CaseItem/> in tests.
    var WrappedCaseItem = React.createClass({
        render: function () {
            return (
                <table>
                    <tbody>
                        <CaseItem {...this.props} ref='caseItem' />
                    </tbody>
                </table>
            );
        },
    });

    function renderHelper(props) {
        transitionSpy = sandbox.spy();
        let component = ntUtils.renderWithContext(WrappedCaseItem, {
            transitionTo: transitionSpy,
            props
        });

        // The component we actually care about is the <CaseItem/>, which is
        // stored as a ref in the <WrappedCaseItem/>.
        return component.refs.caseItem;
    }

    afterEach(function () {
        sandbox.restore();
    });

    it('should transition to \'overview\' on _loadCase()', function () {
        let component = renderHelper({
            myCase: caseObj
        });

        component._loadCase();

        expect(transitionSpy).to.have.been.calledWith(
            'overview',
            {
                name: caseObj.name,
            }
        );
    });

    it('should call props.onModify() when it is deleted', function () {
        sandbox.stub(util, 'post',
            function (_route, _data, _success) {
                _success();
            }
        );

        let component = renderHelper({
            myCase: caseObj,
            onModify: sandbox.spy(),
        });

        component.setState({ showDeleteModal: true });
        component._deleteCase();
        expect(util.post).been.calledWith('/delete_case/' + caseObj.name);
        expect(component.props.onModify).to.have.been.called;
    });

    it('should transition to \'files\' on _upgradeCase()', () => {

        let dataObj = { name: 'prawn-46825-97135-unlocked' };

        sandbox.stub(util, 'post', () => $.Deferred().resolve(dataObj));

        let restageCaseObj = _.assign({}, caseObj, { compat: 'restage' });

        let component = renderHelper({
            myCase: restageCaseObj,
        });

        component._upgradeCase();

        expect(util.post).to.have.been.calledWith(
            '/upgrade_case/foo-20151107030000-20151108030000-locked'
        );

        expect(transitionSpy).been.calledWith('files', dataObj);
    });

});
