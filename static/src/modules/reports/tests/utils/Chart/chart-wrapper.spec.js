import React from 'react';
import { div } from 'react/lib/ReactDOM';
import { renderIntoDocument } from 'react/lib/ReactTestUtils';
import ChartWrapper from 'reports/utils/Chart/ChartWrapper';

describe('ChartWrapper', function () {

    let Wrapped,
        sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    Wrapped = ChartWrapper(div);

    function props() {
        return {
            query: {
                isQuery: true,
                subscribe: sandbox.spy(),
                useData: () => Promise.resolve('Query'),
            },
            grouper: 'ham',
            title: 'Cheese',
            yAxis: {
                isQuery: true,
                subscribe: sandbox.spy(),
                useData: () => Promise.resolve('Y-Axis'),
            },
        }
    }

    it ('should subscribe to each of its props of type Query', function () {
        let _props = props();
        renderIntoDocument(<Wrapped { ..._props } />);
        expect(_props.query.subscribe).to.have.been.calledOnce;
        expect(_props.yAxis.subscribe).to.have.been.calledOnce;
    });

    it('should only _update() once within 100ms', function () {

        sandbox.useFakeTimers();

        // ChartWrapper#_getData will be called once in the componentWillMount
        // method, but the sinon spy doesn't start watching it until the stub
        // is set up in the line after the next.
        let _props = props(),
            instance = renderIntoDocument(<Wrapped { ..._props } />);
        sandbox.stub(instance, '_getData');
        instance._update();
        instance._update();
        expect(instance._getData).to.have.been.calledOnce;

        // Fast-forward 150ms; ChartWrapper#_update should now be callable.
        sandbox.clock.tick(150);
        instance._update();
        expect(instance._getData).to.have.been.calledTwice;

    });

    describe('#_getData', function () {

        it('should set instance state with the results of its Query props',
            function () {
                let _props = props(),
                    instance = renderIntoDocument(<Wrapped { ..._props } />);
                instance._getData().then(() => {
                    expect(instance.state.loading).to.be.false;
                    expect(instance.state.queryResults).to.eql({
                        query: 'Query',
                        yAxis: 'Y-Axis',
                    });
                });
            }
        );

        it('should set instance state with an error if a props Query fails',
            function () {

                let instance,
                    _props = props();

                _props.query.useData = () => Promise.reject('Nope!');

                instance = renderIntoDocument(<Wrapped { ..._props } />);

                instance._getData().then(() => {
                    expect(instance.state.loading).to.be.false;
                    expect(instance.state.error).to.equal('Nope!');
                });

            }
        );

    });

});
