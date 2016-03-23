import React from 'react';
import CSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import $ from 'jquery';
import { Portal } from 'react-bootstrap';

const CallStack = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _handleClickHide: function () {
        this.props.onHide();
    },

    _handleExpandCall: function (e) {

        // .func handles the click, but its parent (.call) must be the
        // element modified.
        let el = e.target.parentNode;

        // If the user is using a keyboard, they can press enter to expand
        // a call. In that case, the element that fired the event
        // is the actual .call div.
        let isKeyDown = e && e.type === 'keydown';
        let keyCode = isKeyDown && (e.which || e.keyCode);
        if (keyCode === 13) {
            el = e.target;
        }

        $(el).toggleClass('expanded');

        // Handle highlighting of a call's dependencies. Gets all the
        // call's deps (stored in a data- attribute), then converts those
        // deps into the classnames used to decorate them. Finally, adds a
        // class to highlight the deps. Also adds a hover class so if a call
        // has more than 1 dependency, hovering will create a second
        // highlighting that reveals which calls correspond specifically
        // to which dependencies.
        if (el.dataset.deps) {
            let deps = el.dataset.deps.split('|');
            deps.forEach(dep => {
                let depSelector = '.' + dep.replace(/:/g, '_');
                $(depSelector).toggleClass('hilite')
                              .hover(() => {
                                  $(depSelector).toggleClass('hiliter');
                              });
            });
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        calls: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                args: React.PropTypes.object,
                doc: React.PropTypes.string,
                func: React.PropTypes.string,
                id: React.PropTypes.string,
            })
        ),
        onHide: React.PropTypes.func.isRequired,
        title: React.PropTypes.string.isRequired,
        visible: React.PropTypes.bool.isRequired,
    },

    componentDidUpdate: function () {
        if (this.props.visible) {
            this.refs.callStack.getDOMNode().focus();
        }
    },

    render: function () {

        let { calls } = this.props;

        // For testing a call argument to see if it's another call
        // in the stack.
        let queryRE = /^query:-?.+$/;

        calls = calls.map(call => {

            let { doc, func, args, id } = call;

            // Create a docs container if docs are supplied.
            if (doc && doc !== 'undocumented') {
                doc = (
                    <div className='doc'>{ doc }</div>
                );
            } else {
                doc = null;
            }

            let callDeps = [];

            // Create an args container if args are supplied.
            if (args && _.size(args)) {

                args = _.map(args, (val, arg) => {

                    // Always want the value of the argument to be
                    // rendered, but these three will not be rendered by
                    // React.
                    switch (val) {
                    case false:
                    case null:
                    case undefined:
                        val = String(val);
                    }

                    let className = 'arg-val';

                    // If the argument value is an Array or Object, it
                    // is displayed in shorthand. A user may inspect its
                    // contents by clicking it, which logs it to the
                    // developer console.
                    let clickHandler;
                    if (_.isObject(val)) {

                        // Wrapped in a span so the number can be
                        // styled separately from the other text. Like
                        // syntax-highlighting, essentially.
                        let size = (
                            <span className='arg-count'>
                                { _.size(val) }
                            </span>
                        );

                        clickHandler = function (val) {
                            console.log(val);
                        }.bind(null, val);

                        if (_.isArray(val)) {
                            val = (
                                <span className='arg-object'>
                                    Array [{size}]
                                </span>
                            );
                        } else if (_.isPlainObject(val)) {
                            val = (
                                <span className='arg-object'>
                                    Object {'{'}{ size }{'}'}
                                </span>
                            );
                        }

                    // If val is a query:XXXXXXXXXX string, look it up
                    // in the call stack to get the call's real name.
                    } else if (_.isString(val) && queryRE.test(val)) {
                        callDeps.push(val);
                        className += ` ${val.replace(/:/g, '_')}`;
                        let call = _.find(calls, { id: val });
                        val = call.func;
                    }



                    return (
                        <div className='arg'>
                            <span className='arg-name'>{ arg }</span>
                            <span
                                className={className}
                                onClick={clickHandler}
                            >
                                { val }
                            </span>
                        </div>
                    );
                });

                // Wrap the list of 'arg' divs generated above in a
                // container that adds a title and some extra styling.
                args = (
                    <div className='args'>
                        <span>Arguments</span>
                        <div className='args-container'>
                            { args }
                        </div>
                    </div>
                );

            } else {
                args = null;
            }

            // Each call div has its id as a classname; that way they
            // can be easily selected for highlighting to show
            // dependency relationships.
            let classId = id.replace(/:/g, '_');
            let funcClassName = `func ${classId}`;

            return (
                <div
                    className='call'
                    tabIndex='0'
                    data-deps={callDeps.join('|')}
                    onKeyDown={this._handleExpandCall}
                >
                    <div
                        className={funcClassName}
                        onClick={this._handleExpandCall}
                    >
                        <i className='fa fa-caret-right' />
                        { func }
                    </div>
                    <div className='detail'>
                        { doc }
                        { args }
                    </div>
                </div>
            );
        });

        let callStack;
        if (this.props.visible) {
            callStack = (
                <section
                    className='call-stack'
                    tabIndex='0'
                    key={this.props.title}
                >
                    <header>
                        <h1>Call stack for { this.props.title }</h1>
                        <i
                            onClick={this._handleClickHide}
                            className='fa fa-times-circle'
                        />
                    </header>
                    <div className='calls'>
                        { calls }
                    </div>
                </section>
            );
        }

        return (
            <Portal
                container={document.body}
            >
                <CSSTransitionGroup
                    transitionName='call-stack'
                    transitionAppear={true}
                    ref='callStack'
                    tabIndex='0'
                >
                    { callStack }
                </CSSTransitionGroup>
            </Portal>
        );
    },

});

export default CallStack;
