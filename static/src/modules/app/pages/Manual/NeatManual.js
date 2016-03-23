import React from 'react';
import ManLink from 'common/components/ManLink';
import { Manual, Section, Important } from 'app/pages/Manual/Components';
import ButtonReference from 'common/components/ButtonReference';

/**
 * Function to create the Neat manual component.
 * @return {component} A component representation of the Neat manual.
 * @exports Pages\Dashboard\Manual\NeatManual
 */
const NeatManual = function() {
    return (
        <Manual>
            <Section anchor='dashboard' title='Dashboard'>
                <p>
                    The Dashboard is the first thing you will see when starting up NEAT.
                    The Dashboard presents two immediate options to you
                </p>

                <ol>
                    <li>create a <ManLink to='new-case'>New Case</ManLink>,</li>
                    <li>or <ManLink to='open-case'>Open</ManLink> an existing case.</li>
                </ol>

                <p>
                    In addition you have access to the File menu in the top right corner of the application.
                    From the File menu you can:
                </p>

                <ol>
                    <li><ManLink to='download-case'>Download</ManLink> a case from a shared drive,</li>
                    <li>check on the <ManLink to='status'>Status</ManLink> of your currently running NEAT application, for diagnostic purposes,</li>
                    <li>or <ManLink to='configure'>Configure</ManLink> various options for the NEAT application.</li>
                </ol>

                <Section anchor='new-case' title='New Case'>
                    <p>
                        The <ButtonReference name='NewCase' /> button on the Dashboard,
                        or the <a>New Case...</a> link from the File menu will let you create a new case.
                        A text box will appear and you will be asked to enter a name for your case.
                        We recommend using a descriptive name, such as <u>AbcCompany-2015</u>.
                    </p>

                    <p>
                        Once you've typed in a name click <ButtonReference name="CreateCase" /> to continue.
                        You will be taken to the <ManLink to='staging-overview'>Staging Overview</ManLink> page for your case,
                        where you will work through <ManLink to='staging'>Staging</ManLink> your case.
                        After finishing staging you'll be able to generate <ManLink to='reports'>Reports</ManLink>.
                    </p>
                </Section>

                <Section anchor='open-case' title='Open Case'>
                    <p>
                        The <ButtonReference name='OpenCase' /> button on the Dashboard,
                        or the <a>Open Case...</a> link from the File menu will let you open an existing case.
                        You will be taken to a page that lists all of your open cases.
                        From here you can click on any case to open it.
                        If the cases still has staging work left to be done,
                        you will be taken to the <ManLink to='staging-overview'>Staging Overview</ManLink> page for the case, where you can continue your work.
                        If the case has finished staging you will be taken directly to the <ManLink to='reports'>Reports</ManLink> pages for the case,
                        where you can begin or continue your analysis of the case's information.
                    </p>

                    <p>
                        Next to each case is a link to <a><i className="fa fa-trash"></i>&nbsp;Delete</a> the case.
                        After clicking this link and verifying that you want to delete the case,
                        the case will be removed from your computer.
                        Other copies of this case, such as those shared on a network drive, will continue to exist.
                    </p>

                    <Important>
                        We recommend that you <ManLink to='staging-share'>Share</ManLink> your case
                        to a network or shared drive before removing it from your machine, so that it will always be backed up and available somewhere.
                    </Important>
                </Section>

                <Section anchor='restore-case' title='Restore Case'>
                    <p>
                        The <ButtonReference name="Restore" /> button on the Open Case page will let you upload an archived case that was shared with you by
                        a colleague (or that you created yourself). Clicking the button will open a file browser, which you can use to navigate to the archive
                        that you want to restore. Case archives should have a <code>.neat</code> extension. When you've found it, double-click the archive file in the
                        file browser. NEAT will automatically upload the file and begin restoring it. When it has been restored, it will appear on the page in
                        the list of cases.
                    </p>
                </Section>

                <Section anchor='case-overview' title='Case Overview'>
                    <p>
                        Clicking on the <a>Case: CaseName</a> link on the top-left corner will bring you to the <a>Case Overview</a> page.
                        It shows the exact time the case was created, and if available, the time it was last finalized.
                    </p>

                    <p>
                        If the case is <ManLink to='staging-locking'>locked</ManLink>, the case name will have a <i className='fa fa-lock'></i> mark next to it.
                        If you want to re-stage the case, click on the <ButtonReference name='UnlockCase' /> button to unlock the case first.
                        Please note that once the case is unlocked, you should go through the staging steps until it is finalized again.
                    </p>
                </Section>

                <Section anchor='status' title='Status'>
                    <p>
                        The <a>Status</a> link from the File menu will bring you to the Status page.
                        On this page you can see a quick, high-level overview of the state and health of the NEAT application.
                        Most users will not need to worry about the information on this page,
                        but it can be helpful to diagnose some problems.
                        In particular, if your Disk Usage or Memory Usage is too high (abover 95%),
                        you may begin to experience problems with NEAT and any other application you may run.
                        We recommend deleting some unused cases.
                    </p>

                    <p>
                        You can delete cases on your machine by going to the <ManLink to='open-case'>Open Case</ManLink> page.
                        On this page you will have the option to delete any cases currently on your machine.
                        Note, we recommend that you <ManLink to='staging-share'>Share</ManLink> your case
                        to a network or shared drive before removing it from your machine.
                    </p>
                </Section>

                <Section anchor='configure' title='Configure'>
                    <p>
                        The <a>Configure...</a> link from the File menu will bring you to the Configure page.
                        On this page you can set various options about your NEAT application.
                        For most users we recommend using the default options.
                    </p>

                    <p>
                        Each option has a description available.
                        Please review the description before deciding whether to turn on or off the available option.
                    </p>
                </Section>
            </Section>

            <Section anchor='staging' title='Staging'>
                <p>
                    Staging, or data cleaning as data scientists call it, is the most difficult and time consuming part of analyzing data.
                    NEAT tries to make your life as easy as possible during this process, so you can get to the more interesting part of doing real analysis.
                </p>

                <p>
                    NEAT will walk you through how to stage your data.
                    If you're ever unsure what to do next, simply click the continue button in the top right corner, which looks like this <ButtonReference name="Next" />.
                    Pressing <ButtonReference name='Next' /> will either take you to the next thing you need to work on, or will tell you if you need to finish something on the current page.
                </p>

                <p>
                    In addition, each page has a small note at the top letting you know what the purpose of the page is and what you need to do.
                    Often this note will link back to this manual for a more detailed discussion if needed.
                </p>

                <p>
                    We recommend one person on your team handles staging the files.
                    Afterward that person can share the case with the team.
                    Each member of the team will then be able to work with the case independently, confident knowing that everyone is using the exact same data.
                </p>

                <p>
                    In the following subsections we will explain each page of Staging in the sequence you will see them.
                </p>

                <Section anchor='staging-overview' title='Staging Overview'>
                    <p>
                        Staging Overview lets you quickly see your progress while staging your case.
                        For each stage of Staging you will see a quick synopsis of your progress for that stage.
                        If the synopsis is highlighted in green it means that stage is complete.
                        Blue means the stage is incomplete and is ready to be worked on.
                        Grey means the stage is incomplete but requires previous stages to be finished before you can work on it.
                        By clicking on an available stage you can jump directly to that stage to continue or modify your work.
                    </p>
                </Section>

                <Section anchor='staging-registrant-files' title='Stage 1, Registrant Files'>
                    <p>
                        Before NEAT can do anything we need to provide it with files from the registrant we are examining.
                        During this stage we will
                    </p>

                    <ol>
                        <li>give NEAT the registrant files we are examining,</li>
                        <li>tell NEAT how to interpret those files,</li>
                        <li>create a powerful database from the files that we will use to do analysis with.</li>
                    </ol>

                    <p>
                        These steps are detailed below.
                    </p>

                    <Section anchor='file-picker' title='File Picker'>
                        <p>
                            This page allows us to pick the registrant files we are interested in looking at.
                            You will see a list of file types, such as Trade Blotter and Initial Position.
                            Next to each type you will see a <a>Browse...</a> link.
                            For each type you have a file for, click on <a>Browse...</a> to open a file browser that will allow you to pick the relevant registrant file from your machine.
                        </p>

                        <Important>The file you pick must be a .csv or .xlsx file.</Important>

                        <p>
                            Next to each file you can click <ButtonReference name='ViewFile' /> to see what the data inside the file looks like.
                            When you are happy with the files you have picked, you may click <ButtonReference name='StageFile' /> next to any file to proceed to tell NEAT what is inside that file.
                        </p>
                    </Section>

                    <Section anchor='column-mapping' title='Column Mapper'>
                        <p>
                            The next step is telling NEAT what each column in the file means.
                            During Column Mapping NEAT will present you a table of all columns in the registrant file.
                            To the right of each column name is a dropdown that you can use to tell NEAT what the column name means.
                            Further right of the dropdown is a preview of the first few data cells from the column in question.
                            Use these cells to inform your decision.
                            If you need to see more data cells you may click <ButtonReference name='ViewFile' /> at the top of the page to see the entire registrant file.
                        </p>

                        <p>
                            When you begin Column Mapping NEAT will make an initial guess as to what it thinks the columns are.
                            NEAT can be very good at this, but it is good practice to check its work, because, afterall, NEAT is just a program.
                            After making changes, if you ever wish to revert to NEAT's initial guesses, simply press <ButtonReference name="ResetFile" />.
                        </p>

                        <p>
                            Once you are satisified with your choices press <ButtonReference name='ProcessFile' />.
                            While processing, NEAT will go through the entire registrant file and verify that your choices make sense.
                            After processing, NEAT will inform you of how many lines were processed, and how many lines did not make sense.
                            By clicking on the erroneous line indicator you can see in detail which lines did not process correctly.
                            After reviewing these lines, you may choose to make changes to the dropdowns and reprocess;
                            or, you may decide that the errors found are OK to ignore.
                            When proceeding, NEAT will then ignore those lines from all further analyses.
                            Either way, when you are ready simply press <ButtonReference name='Next' /> to proceed.
                        </p>
                    </Section>

                    <Section anchor='required-columns' title='File Types and Required Columns'>
                        <p>
                            In the following subsections we explain what each file type is and what columns those files must have.
                        </p>

                        <Section anchor='trade-blotter' title='Trade Blotter'>
                            <p>
                                A Trade Blotter is a file detailing trade executions made by a registrant over a period of time.
                            </p>

                            <p>
                                <strong>Required columns: Date, Account, either Notional or Multiplier, some type of Symbology.</strong>
                            </p>

                            <Important>A Trade Blotter is always required by NEAT. All other file types are optional.</Important>
                        </Section>

                        <Section anchor='employee-trade-blotter' title='Employee Trade Blotter'>
                            <p>
                                An Employee Trade Blotter is a file detailing trade executions made by the employees of a registrant over a period of time.
                            </p>

                            <p>
                                <strong>Required columns: Date, Account, either Notional or Multiplier, some type of Symbology, and the name of the employee doing each trade.</strong>
                            </p>
                        </Section>

                        <Section anchor='restricted-list' title='Restricted List'>
                            <p>
                                A Restricted List is a file detailing securities that registrant's employees are not allowed to trade.
                            </p>

                            <p>
                                <strong>Required columns: some type of Symbology.</strong>
                            </p>
                        </Section>

                        <Section anchor='initial-position' title='Initial Position'>
                            <p>
                                An Initial Position is a file detailing security holdings, long or short, that a registrant held at the time corresponding to the beginning of the Trade Blotter.
                            </p>

                            <p>
                                <strong>Required columns: Account, either Notional or Multiplier, some type of Symbology.</strong>
                            </p>
                        </Section>
                    </Section>
                </Section>

                <Section anchor='staging-create-database' title='Stage 2, Create Database'>
                        <p>
                            Now that we have told NEAT what files we're interested in and what the columns in those files mean, we are ready to create a database for our case.
                            Simply click <ButtonReference name='CreateDb' /> and wait while NEAT prepares your case's database.
                            When the database is successfully created, you will see a brief summary of entities processed.
                            Afterward you can proceed by clicking <ButtonReference name='Next' />.
                        </p>
                </Section>

                <Section anchor='staging-interpretation' title='Stage 3, Interpretation'>
                    <p>
                        We now have a database with our registrant files loaded into it.
                        Some of the data in this database may need to be put into a more standard format.
                        For example, a registrant file may specify a buy execution with the letter B and a sell execution with the letter S.
                        We need to tell NEAT that B means Buy and S means Sell.
                        We call this process Interpretation.
                    </p>

                    <p>
                        On the Interpretaion page you will be shown all the values that we need to pick an interpretation for.
                        Next to each value you will see a dropdown you can use to choose from a small set of valid value.
                        As with Column Mapping NEAT will make a good initial guess as to what it thinks a good value is.
                        NEAT is often right, but it can be wrong at times, so it is good practice to check over the values.
                        If you ever want to revert to NEAT's original choices, simply press <ButtonReference name="InterpretationReset" />.
                    </p>

                    <p>
                        Once you are happy with the values press <ButtonReference name='InterpretationConfirm' /> to confirm your choices.
                        Afterward you may proceed by clicking <ButtonReference name='Next' />.
                    </p>
                </Section>

                <Section anchor='staging-ref-data' title='Stage 4, Reference Data'>
                    <p>
                        The data we get from registrants is only part of the puzzle.
                        In order to fully understand their data we need to pair it up with market reference data.
                        To do this we join with Reference and Market Data to validate and rectify the registrant data in a number of ways.
                        In particular, we look up every symbol provided, get associated reference data,
                        as well as historical pricing for the instrument over the period of time covered by the trade blotter.
                    </p>
                </Section>

                <Section anchor='staging-symbols'
                    title='Stage 5, Symbol Rectification'>
                    <p>
                        Symbol Rectification provides several data-cleaning and data-validation utilities to enhance and confirm the integrity of registrant-provided data.
                    </p>

                    <Section anchor='staging-symbols-reference-data'
                        title='Reference Data Validation'>
                        <p>
                            NEAT fetches reference security data from a third party data provider to ensure data integrity and to "fill in the gaps" in registrant data.
                            The third party provider is queried using registrant provided symbols, e.g. Symbol, Ticker, CUSIP, ISIN, SEDOL.
                            In cases of ambiguity&mdash;perhaps due to mistakes in the registrant data&mdash;there may be mismatches in the third party data.
                            Reference Data Validation is a feature that checks that certain fields are equivalent and will fail if there is too much ambiguity due to mismatched fields.
                        </p>

                        <Section anchor='staging-symbols-reference-data-ambiguaties'
                            title='Resolving Ambiguities'>
                            <p>
                                In some cases, the third party data provider finds multiple securities that could map to a single registrant security.
                                NEAT automatically selects one of the third party candidate securities but you will have the option to <em>re-map</em> it.
                            </p>
                        </Section>
                    </Section>

                    <Section anchor='staging-symbols-price-validation'
                        title='Price Validation'>
                        <p>
                            NEAT will automatically validate registrant reported prices against historical market prices for that security.
                            Specifically, NEAT will validate that a reported price falls within the high/low range for that security on the day it was traded.
                        </p>
                    </Section>

                    <Section anchor='staging-symbols-notional-validation'
                        title='Notional Validation'>
                        <p>
                            NEAT will automatically validate registrant reported notional values by manually calculating the notional value using other fields in the blotter.
                            Valid data should result in equal reported and calculated values.
                        </p>
                    </Section>

                    <Section anchor='staging-symbols-security-adjustments'
                        title='Applying Adjustments'>
                        <p>
                            NEAT provides the ability to toggle per-security adjustments, to account for currency differences, price adjustment difference, among other potential issues.
                            These adjustments are useful in tracking down discrepancies when registrant data seems uniformly incorrect.
                            A common example is when registrant security prices for a LSE-based security are in GBp but has notional values in GBP.
                            Since analysis needs to be done in a single currency (USD) the you should apply the <strong>Currency Multiplier for Notional</strong> adjustment to fix notional values in this case.
                        </p>

                        <p>
                            Click on <ButtonReference name="RDOs" /> to access adjustments.
                            After making changes press <ButtonReference name='ConfirmSymbols' /> to save your changes.
                            Afterward you may proceed by clicking&nbsp;<ButtonReference name='Next' />.
                        </p>

                        <p>
                            Here is a description of available adjustments:
                        </p>

                        <Section anchor='staging-symbols-security-adjustments-adjfactor'
                            title='Adjustment Factor'>
                            <p>
                                Typically on by default, the Adjustment Factor accounts for differences in prices due to corporate actions like splits.
                                In cases where the registrant-provided prices are already adjusted: disabling this option will prevent adjusting the price again.
                            </p>
                        </Section>

                        <Section anchor='staging-symbols-security-adjustments-adjfactor-registrant-provided'
                            title='Registrant-provided Adjustment Factor'>
                            <p>
                                If the <strong>Adjustment Factor</strong> is applied, the default adjustment factor used will come from the third party data provider.
                                However, you may toggle this to use the registrant's adjustment factor instead&mdash;assuming one is provided.
                            </p>
                        </Section>

                        <Section anchor='staging-symbols-security-adjustments-local-to-usd'
                            title='Convert Local to USD'>
                            <p>
                                Typically on by default, converts all foreign currency prices to USD.
                                Since the analysis phase expects values to be in USD it is essential that registrant data be adjusted as such.
                                However, in cases where the registant-provided prices are <em>already in USD</em> disabling this option will prevent adjusting the price again.
                            </p>
                        </Section>

                        <Section anchor='staging-symbols-security-adjustments-notional-mult-registrant-provided'
                            title='Registrant-provided Notional Multiplier'>
                            <p>
                                The Notional Multiplier is typically inferred from the security type.
                                However, you may enable this to use the registrant's multiplier instead&mdash;assuming one is provided.
                            </p>
                        </Section>

                        <Section anchor='staging-symbols-security-adjustments-currency-mult'
                            title='Apply Currency Multiplier'>
                            <p>
                                This option is <em>only available for currencies that are commonly quoted in several denominations</em>, e.g. GBP.
                                When the option is enabled it reflects the fact that the security is in the "lower" denomination of the currency, e.g. GBp.
                                If prices or notional values seem off by a constant factor, toggling this option may resolve the discrepancy.
                            </p>
                        </Section>
                    </Section>

                    <Section anchor='staging-symbols-excluding-securities'
                        title='Excluding Securities'>
                        <p>
                            NEAT provides the ability to exclude securities from reports and analyses.
                            To exclude a security, simply click the checkbox in the <strong>Exclude</strong> column
                            in the row corresponding to the concerned security.
                            To include a currently excluded security, you can likewise uncheck the checkbox.
                        </p>

                        <p>
                            You may wish to to exclude securities for a variety of reasons.
                            For example, you may wish to only focus on traded equities.
                            In this case you may filter the symbol table by non-equity security types and
                            click the checkbox above <strong>Exclude</strong> to exclude all non-equity securities.
                        </p>

                        <p>
                            You may also wish to to exclude securities that fail to price validate.
                            Often securities that have failed price validation have incorrect data
                            provided by the registrant. By including this data you may throw off P&L calculations.
                        </p>

                        <p>
                            At the very least, we suggest excluding securities that cannot be resolved using third party data.
                        </p>

                        <Section anchor='staging-symbols-excluding-securities-policy'
                            title='Exclusion Policy'>

                            <p>
                                By default, NEAT will automatically exclude securities for a variety of reasons:
                            </p>

                            <ul>
                                <li>If no third party data was found,</li>
                                <li>
                                    If some third party data was found,
                                    but our matching algorithm could not automatically
                                    infer if the data found matches the security,
                                </li>
                                <li>
                                    If matching third party data is found or is selected,
                                    but two out of three validation checks have failed;
                                    for instance, if both price and notional validation failed.
                                </li>
                            </ul>

                            <p>
                                Note that as you apply adjustments various failing validations
                                may no longer fail. In these cases we recommend unchecking
                                the <strong>Exclude</strong> checkbox so that the security is included.
                            </p>
                        </Section>
                    </Section>
                </Section>

                <Section anchor='staging-finalize' title='Stage 6, Finalize'>
                    <p>
                        After we are satisified with helping NEAT understand the files we've given it,
                        we can now let NEAT do a host of calculations to better understand the data at hand.
                        When you are ready, click <ButtonReference name='Finalize' /> to have NEAT begin these calculations.
                        Among other things, NEAT will calculate:
                    </p>

                    <ul>
                        <li>adjusted prices and notional values of trades,</li>
                        <li>holdings over time for every account,</li>
                        <li>different types of P&L for every account.</li>
                    </ul>

                    <p>
                        For large cases this may take a few minutes. After NEAT has finished you may proceed by clicking&nbsp;<ButtonReference name='Next' />.
                    </p>
                </Section>

                <Section anchor='staging-locking' title='Locking'>
                    <p>
                        After all staging steps are completed and the case is successfully finalized,
                        the case will be marked as "locked", with a <i className='fa fa-lock'></i> next to the case name.
                    </p>

                    <p>
                        A locked case provides a solid common ground for members of the team to work with the case independently on the exact same data.
                    </p>

                    <p>
                        Trying to redo any staging action on a locked case requires you to go to <ManLink to='case-overview'>Case Overview</ManLink>
                        page and "unlock" the case, once a case is unlocked, it is subject to staging changes and may deviate from the original locked case,
                        thus need to be staged and finalized again, at which point it will be locked again as another version of the case.
                    </p>
                </Section>

                <Section anchor='staging-share' title='Share'>
                    <p>
                        After Finalize we are ready to dive into our case.
                        If you have colleagues with whom you'd like to share your case, now is the best time to do so. Sharing involves downloading
                        an <b>archive</b> of your case and then sending that archive to your colleagues.
                        Click <ButtonReference name='Share' suffix='<CASE>' /> to generate the case archive. When the download link appears,
                        right-click it and save the archive to a location accessible by your colleagues---we recommend picking a location on a shared drive or network drive.
                        When the archive has been downloaded, all that's left to do is to send an email to your colleagues notifying them that the case is ready for viewing.
                    </p>

                    <p>
                        Your colleagues can now <ManLink to='restore-case'>restore the case archive</ManLink> from that location using NEAT.
                        Now that you and your colleagues have the same case, you can share case links by copying the URL of any page you are on in NEAT and sending the link to your colleague.
                    </p>

                    <Important>If you make changes to the previous steps in Staging, be sure to re-share the updated case with your colleagues.</Important>
                </Section>
            </Section>

            <Section anchor='reports' title='Reports'>
                <p>
                    Once a case has been properly <ManLink to='staging'>staged</ManLink> we can now do some real analysis of our data.
                    On the Reports page you will see a collection of groups of reports.
                    Each group has a particular theme and includes a set of reports related to that theme.
                </p>

                <p>
                    By clicking on one of the report links you will be taken to a Report page.
                    Each Report page will present different data in different ways.
                    The goal of each Report is different, but they are all intended to help you understand the data and find potential regulation violations.
                </p>

                <p>
                    For each Report you can click on the report name at the top of the page to get a descriptive overview of what the report is for.
                </p>

                <p>
                    Below the report name you may see a few dropdown boxes.
                    By changing what is selected in the dropdown box you can change what the report is looking at.
                    For instance, some reports have a dropdown that lets you pick between Account, Broker, Firm, etc.
                    By picking Account the focus of the report will be on Accounts.
                    Likewise by picking Broker the focus of the report will be on Brokers.
                    We call these dropdowns Controls.
                </p>

                <p>
                    Below the Controls you will see a collection of many graphs and other data representations.
                    We call these Widgets.
                    Each Widget presents a particular slice of information to you.
                    Many Widgets are interactive.
                    You can zoom, shift, and select what data is present.
                </p>

                <p>
                    Each Widget has a collection of options.
                    You can see these options by clicking the small arrrow next to the Widget title.
                    Among the options, you can view the Summary, which will help you understand what the Widget is for and what data it is presenting.
                    You can also download the graphical representation as a PNG file, which will let you include the image in any Word documents or other reports that you write.
                </p>

                <p>
                    At the bottom of most reports is a table view of the data seen in the report.
                    In the options for this Widget you can download the data as a .csv or .xlsx file.
                    You can then open this file in Excel to do more analysis on the data.
                </p>
            </Section>

            <Section anchor='power-tool' title='Power Tool'>
                <p>
                    This Power Tool is a great way to do custom analysis of your data when there is no available report that suits your needs.
                    When you click on the Power Tool link a new browser tab will open running an instance of iPython Notebook.
                    This Notebook will let you write custom Python scripts to analyze your data.
                    You will have access to all of the same functions that the native NEAT reports use to generate their data and widgets.
                </p>

                <p>
                    The Power Tool is a new feature and is still being worked on to provide the most seamless experience for you and your colleagues.
                    As the Power Tool matures we will expand this manual to include tutorials and examples of how to use this very flexible tool.
                </p>
            </Section>
        </Manual>
    );
}

export default NeatManual;
