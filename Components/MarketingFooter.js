import React from 'react'

export default React.createClass({
  
    render: function() {
        return (
            <div className="marketing-content-wrapper">
                <div className="marketing-content" id="about-neat">
                    <h2 className="marketing-content-head is-center">The National Exam Analytics Tool</h2>

                    <div className="pure-g">
                        <div className="l-box pure-u-1 pure-u-med-1-2 pure-u-lrg-1-4">

                            <h3 className="marketing-content-subhead">
                                Stronger
                            </h3>
                            <p>
                                NEAT3 is an enterprise class platform for exam analyses. Built by the SEC's in-house QAU development team and leveraging a leading edge technology stack, NEAT3 brings high powered 21st century technology to your hands. Analyse billions of data points with ease. NEAT3 ushers in the era of big data for market regulation.
                            </p>
                        </div>
                        <div className="l-box pure-u-1 pure-u-med-1-2 pure-u-lrg-1-4">
                            <h3 className="marketing-content-subhead">
                                Faster 
                            </h3>
                            <p>
                                NEAT3 is fast. Blazing fast. NEAT3 uses state-of-the-art data storage and processing technologies, allowing you to process data 1,000x faster than with previous versions. Do your worst, NEAT3 can handle it.
                            </p>
                        </div>
                        <div className="l-box pure-u-1 pure-u-med-1-2 pure-u-lrg-1-4">
                            <h3 className="marketing-content-subhead">
                                Simpler
                            </h3>
                            <p>
                                By taking NEAT out of Excel, the QAU has simplified your experience dramatically. No longer do you need to remember what you need to do to run report X. NEAT3 will handle that for you. That means a shorter learning curve and faster exams.
                            </p>
                        </div>
                        <div className="l-box pure-u-1 pure-u-med-1-2 pure-u-lrg-1-4">
                            <h3 className="marketing-content-subhead">
                                Modern
                            </h3>
                            <p>
                                By leveraging modern browser technologies NEAT3 enables you to visualize enormous data sets and quickly drill down to the heart of the data. When you're ready, export reports for easy viewing by everyone on your team.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="ribbon l-box-lrg pure-g">
                    <div className="l-box-lrg is-center pure-u-1 pure-u-med-1-2 pure-u-lrg-2-5">
                        <img className="pure-img-responsive" alt="File Icons" width="300" src="static/img/common/file-icons.png"/>
                    </div>
                    <div className="pure-u-1 pure-u-med-1-2 pure-u-lrg-3-5">

                        <h2 className="marketing-content-head content-head-ribbon">NEAT3 Still Integrates with Excel</h2>
                        <p>
                           Instead of forcing Excel to do things it is bad at, the QAU has separated Excel and NEAT. Moreover, reports with +100k lines are nearly impossible for pretty much anyone to digest. But don't worry! NEAT3 aims to remedy this by using Excel only for what it does best (data sheet analytics) and helping you, the user, to cut out the portions of a report that you are not interested in. You can still investigate the data your reports derive from directly in Excel. Excel is the champion of data sheet analytics. Nothing can beat it in terms of adoption or ease of use. 
                        </p>
                    </div>
                </div>
                <div className="footer l-box is-center">
                    Powered by the QAU
                </div>
            </div>
        );
    }
});
