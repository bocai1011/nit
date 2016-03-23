import React from 'react';
import { Link } from 'react-router';
import { Panel } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import ManLink from 'common/components/ManLink';
import Katex from 'common/components/Katex';
import ButtonReference from 'common/components/ButtonReference';
import Mailto from 'common/components/Mailto';
import { Link as DynamicLink } from 'reports/components/charts/Widgets';

/**
 * Collection of functions for creating useful help blurbs about
 * various pages in the Neat application.
 * @exports lib\Components\HelpBlurbs
 */
const HelpBlurbs = {
    StagingProcess: function() {
        return (
            <ol>
                <li>
                    Staging is the process of getting the data from a registrant cleaned up
                    and put into a standard format for easy analysis. <ManLink to='staging'>What is staging?</ManLink>
                </li>

                <li>
                    NEAT will walk you through staging. Simply press <ButtonReference name='Next' /> to continue, or when you're unsure what to do next.
                </li>
            </ol>
        );
    },

    FilePicker: function() {
        return (
            <ol>
                <li>
                    This is where we will tell NEAT which <ManLink to='staging-registrant-files'>registrant files</ManLink> we want to look at.
                </li>

                <li>
                    There are different types of registrant files we may want to look at. Below is the list of file types NEAT can analyze.
                </li>

                <li>
                    Next to each file type you want to look at press the <a>Browse...</a> link to pick a file.
                </li>
            </ol>
        );
    },

    ColumnMapping: function () {
        return (
            <ol>
                <li>
                    To analyze a file we need to tell NEAT <ManLink to='column-mapping'>what each column is.</ManLink>
                </li>
                <li>
                    For example, you may have a file with a column labeled <em>Exec time</em> which is the <b>execution time</b> of each trade. We need to tell NEAT that <em>Exec time</em> means <b>execution time</b>.
                </li>
                <li>
                    Below is the file we are staging. Next to each column name is a dropdown to tell NEAT what the column is. Next to the dropdown you can see what the first few cells from that column look like.
                </li>
                <li>
                    Once you&#39;ve told NEAT what each column is and the status bar shows no issues, press <ButtonReference name='ProcessFile'/> to have NEAT process your entire file.
                </li>
            </ol>
        );
    },

    CreateDataBase: function () {
        return (
            <ol>
                <li>
                    <ManLink to='staging-create-database'>Create Case Database</ManLink> is how we prepare data in NEAT.
                </li>
                <li>
                    You&#39;ve loaded all the registrant files into NEAT, please press <ButtonReference name='CreateDb'/> to have NEAT create case database from these files. This may take a while.
                </li>
                <li>
                    After the database is successfully created, you&#39;ll see a brief summmary of data statistics.
                </li>
            </ol>
        );
    },

    Interpretation: function () {
        return (
            <ol>
                <li>
                    <ManLink to='staging-interpretation'>Interpretation</ManLink> is how we tell NEAT what the data in particular columns means.
                </li>
                <li>
                    For example, the direction column may have many different words used to indicate what direction each trade is. We need to tell NEAT what those words mean.
                </li>
                <li>
                    For each column below we will explain to NEAT what the words in that column mean.
                </li>
                <li>
                    This step will also mark some transactions excluded from the case data if:
                    <ol>
                        <li>
                            they have zero price or quantity;
                        </li>
                        <li>
                            they are cancelled transactions, both the original trade and the cancel trade will be excluded.
                        </li>
                    </ol>
                </li>
            </ol>
        );
    },

    RefData: function () {
        return (
            <ol>
                <li>
                    This is where we get <ManLink to='staging-ref-data'>Reference Data</ManLink> to join with our registrant data.
                </li>
                <li>
                    Look at the symbols listed below. These are the symbols we will get data from the Reference Data Server.
                </li>
                <li>
                    If this looks correct, press <ButtonReference name='GetRefData'/>.
                </li>
            </ol>
        );
    },

    Symbols: function () {
        return (
            <ol>
                <li>
                    This stage provides utilities to enhance and confirm the integrity of registrant-provided data.
                </li>
                <li>
                    On the left you will see the full list of symbols NEAT has seen in the registrant data.
                    Select a row in the table to see more in-depth information about a specific symbol.
                </li>
                <li>
                    On the right you will see reference data that is associated with each symbol.
                    If you see discrepancies you can re-map reference data or apply special adjustments.
                    Reference the <ManLink to='staging-symbols'>Symbol Rectification</ManLink> section of the manual for more information.
                </li>
                <li>
                    Note that some securities are excluded by default.
                    You may override this behavior, or choose to exclude other securities for various reasons.
                    For more information see <ManLink to='staging-symbols-excluding-securities'>Excluding Securities</ManLink>.
                </li>
            </ol>
        );
    },

    Finalize: function () {
        return (
            <ol>
                <li>
                    We are now ready to <ManLink to='staging-finalize'>finalize</ManLink> the case database!
                </li>
                <li>
                    During this time NEAT will run many calculations that will make your exploration of this case faster and more powerful.
                </li>
                <li>
                    When you are ready, click the <ButtonReference name='Finalize'/> button below. A progress bar will let you know how far along we are.
                    This may take a few minutes.
                </li>
            </ol>
        );
    },

    Export: function () {
        return (
            <ol>
                <li>
                    This is where you can export individual tables from the NEAT database.
                </li>
                <li>
                    Note, the NEAT database evolves as the case advances through staging.
                    Its tables should not be exported prior to case finalization.
                </li>
                <li>
                    When you're ready to export a table, choose that table from the list. A
                    control panel will appear, allowing you to customize which columns and which
                    format the exported table will have.
                </li>
            </ol>
        );
    },

    Share: function () {
        return (
            <ol>
                <li>
                    This is where you can <ManLink to='staging-share'>share</ManLink> your case with colleagues.
                </li>
                <li>
                    We recommend that you only share your case after completing all the steps in staging.
                </li>
                <li>
                    Once you&#39;re ready to share your case, click the <ButtonReference name='Share'/> button and choose a location to share your case.
                    Usually a good location is somewhere on your J: or F: drive, in a location easy for your colleagues to find it and access.
                </li>
                <li>
                    After your case has been shared, send your colleagues a message letting them know where the case was stored.
                </li>
            </ol>
        );
    },

    Restore: function () {
        return (
            <ol>
                <li>
                    You may also <ManLink to='restore-case'>restore</ManLink> a case from an archive shared by your colleagues (or created by you).
                </li>
                <li>
                    Clicking the <ButtonReference name="Restore" /> button will open a file browser that you can use to select an archive to restore.
                    Usually an archive file will have a <code>.neat</code> extension; for example, <code>MyCase.neat</code>.
                </li>
                <li>
                    After the archive is uploaded, the case will be restored and it will appear in the list of cases above.
                </li>
            </ol>
        );
    },

    Reports: function () {
        if (NeatApp.finalized()) {
            return (
                <div>
                    <p>
                        Now that you have successfully staged your case we are ready to start analysing your data.
                        NEAT separates its analyses into different pages called Reports.
                        Each report is designed to help you look at the data in a certain way.
                    </p>

                    <p>
                        Because there are many reports and many ways to look at your data,
                        we have organized the reports into groups below.
                    </p>

                    <p>
                        Pick a starting point that best describes how you want to look at your data.
                        If you're new to NEAT we recommend starting with the <DynamicLink linking_to='Jump Into the Data'/>.
                    </p>
                </div>
            );
        } else {
            return (
                <Panel header={<h3>Case Not Finalized</h3>} bsStyle="danger">
                    Warning. You have not yet finished finalizing your case.
                    <p />
                    Many reports will not work correctly until your case has been finalized.
                    <p />
                    The output of reports that do work may change as you make additional changes in staging.
                    <p />
                    We do not recommend proceeding unless you know what you're doing.
                </Panel>
            )
        }
    },

    LegacyReports: function () {
        return (
            <div>
                <p>
                    For those comfortable with the reports from NEAT2 you may find all NEAT2 reports here.
                </p>

                <p>
                    While many of these reports are useful, we encourage you to find modern NEAT reports to replace these.
                </p>

                <p>
                    If there is no modern report that provides the functionality you need, please <Mailto>suggest an improvement</Mailto>.
                </p>
            </div>
        );
    },

    DataReports: function () {
        return (
            <div>
                <p>
                    In order to understand a registrant it is important to look at the data in various ways.
                </p>

                <p>
                    Here you will find various reports organized in different ways of slicing the data.
                </p>

                <p>
                    If you are more interested in looking for a particular violation,
                    we recommend you start <Link to="regulation-reports" params={{name: NeatApp.caseName()}}>here</Link>.
                </p>
            </div>
        );
    },

    RegulationReports: function () {
        return (
            <div>
                <p>
                    Often we want to investigate a firm's activity with respect to specific regulations.
                </p>

                <p>
                    Here you will find various reports organized by both regulations and potential violations of those regulations.
                </p>

                <p>
                    If you are more interested in looking at the data of the registrant without a regulatory lense, we recommend you
                    start with <DynamicLink linking_to='Jump Into the Data'/>.
                </p>
            </div>
        );
    },
};

export default HelpBlurbs;
