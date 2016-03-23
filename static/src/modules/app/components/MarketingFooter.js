import React from 'react';

/**
 * Component for rendering the marketing footer in the dashboard.
 * Marketing is very important.
 * @component
 * @exports lib\Components\MarketingFooter
 */
const MarketingFooter = React.createClass({

    render: function() {
        return (
            <footer id="aboutNEAT"
                ref="fullFooter"
                className='container-fluid'>
                <h2 className="marketing-content-head text-center">The National Exam Analytics Tool</h2>
                <div className="row marketing-content-wrapper">
                    <div className="col-xs-12 col-lg-3">
                        <h3 className="marketing-content-subhead">Stronger</h3>
                        <p>
                            NEAT is an enterprise class platform for exam analyzes.
                            Built by the SEC&#39;s in-house QAU development team and
                            leveraging a leading edge technology stack, NEAT brings
                            high powered 21st century technology to your hands.
                            analyze billions of data points with ease.
                            NEAT ushers in the era of big data for market regulation.
                        </p>
                    </div>
                    <div className="col-xs-12 col-lg-3">
                        <h3 className="marketing-content-subhead">Faster</h3>
                        <p>
                            NEAT is fast. Blazing fast. NEAT uses state-of-the-art
                            data storage and processing technologies, allowing you
                            to process data 1,000x faster than with previous versions.
                            Do your worst, NEAT can handle it.
                        </p>
                    </div>
                    <div className="col-xs-12 col-lg-3">
                        <h3 className="marketing-content-subhead">Simpler</h3>
                        <p>
                            By taking NEAT out of Excel, the QAU has simplified your
                            experience dramatically. Don&#39;t worry about what needs
                            to happen before running a report. NEAT will handle that
                            for you. That means a shorter learning curve and faster exams.
                        </p>
                    </div>
                    <div className="col-xs-12 col-lg-3">
                        <h3 className="marketing-content-subhead">Modern</h3>
                        <p>
                            By leveraging modern browser technologies NEAT enables you
                            to visualize enormous data sets and quickly drill down to the
                            heart of the data. When you&#39;re ready, export reports for easy
                            viewing by everyone on your team.
                        </p>
                    </div>
                </div>

                <div className='marketing-content-ribbon row'>
                    <div className='col-xs-4 flex-center'>
                        <img className="pure-img-responsive"
                            alt="File Icons"
                            width="300"
                            src="/static/img/common/file-icons.png"/>
                    </div>
                    <div className='col-xs-8'>
                        <h2 className='marketing-content-head text-center'>
                            NEAT Still Integrates with Excel
                        </h2>
                        <p>
                            Instead of forcing Excel to do things it is bad at, the QAU has separated
                            Excel and NEAT. Moreover, reports with +100k lines are nearly impossible
                            for pretty much anyone to digest. But don&#39;t worry! NEAT aims to remedy
                            this by using Excel only for what it does best (data sheet analytics) and
                            helping you, the user, to cut out the portions of a report that you are not
                            interested in. You can still investigate the data your reports derive from
                            directly in Excel. Excel is the champion of data sheet analytics. Nothing
                            can beat it in terms of adoption or ease of use.
                        </p>
                    </div>
                </div>
                <div className='marketing-content-footer row text-center'>
                    <div className='col-xs-12'>
                        <h2>Powered by the QAU</h2>
                    </div>
                </div>
            </footer>
        );
    }
});

export default MarketingFooter;
