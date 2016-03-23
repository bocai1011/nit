import React from 'react';
import { Alert, Well } from 'react-bootstrap';
import ManLink from 'common/components/ManLink';

function _renderTableOfContents(node) {
    return (
        <ul>
        {
            React.Children.map(node.props.children, function (c) {
                if (c && c.type && c.type.displayName === 'Section') {
                    return (
                        <li>
                            <ManLink to={c.props.anchor}>
                                { c.props.title }
                            </ManLink>
                            { _renderTableOfContents(c) }
                        </li>
                    );
                }
            })
        }
        </ul>
    );
}

/**
 * Component to render a manual section.
 * @component
 */
export const Section = React.createClass({

    propTypes: {
        anchor: React.PropTypes.string,
        title: React.PropTypes.node,
    },

    render: function() {
        return (
            <section>
                <h1 id={this.props.anchor} className='content-subhead'>
                    { this.props.title }
                </h1>
                { this.props.children }
            </section>
        );
    }

});

/**
 * Component for an important alert item in the manual.
 * Use this component to draw the reader's attention to
 * a small piece of critical information that may otherwise
 * be missed.
 * @component
 */
export const Important = React.createClass({
    render: function() {
        return (
            <Alert>
                <h2>Important</h2>
                { this.props.children }
            </Alert>
        );
    }
});

/**
 * Component that draws the manual's table of contents.
 * @component
 */
export const TableOfContents = React.createClass({
    render: function() {
        return (
            <Well>
                <h2 id='table-of-contents'>Table of Contents</h2>
                { _renderTableOfContents(this.props.children) }
            </Well>
        );
    }
});

/**
 * Component that draws the manual.
 * @component
 */
export const Manual = React.createClass({
    render: function() {
        return (
            <article className='neat-manual'>
                { this.props.children }
            </article>
        );
    }
});
