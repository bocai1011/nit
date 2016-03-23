/** @jsx React.DOM */

var HelpBlurbs = {
    StagingProcess: function() { return (
        <div>
            <p>
                1. We recommend one person on your team handle staging. <Link to="manual">What is staging?</Link>
            </p>

            <p>
                2. After staging is complete, click 'Upload' on the side bar to upload the 
                case to the J drive for easy distribution to team members. All member can then analyse and run reports on the case, and can easily
                share findings.
            </p>

            <p>
                3. Before staging always copy the data files from the J drive to your computer.
                Do not load files directly into NEAT from the J drive.
            </p>
        </div>
        ); },

    Staging_Step1: function() { return (
        <div>
            <p>
                1. To analyse a file we need to tell NEAT what each column is. 
            </p>
            <p>
                2. For example, you may have a file with a column labeled <em>Exec time</em> which is the <b>execution time</b> of each trade. We need to tell NEAT that <em>Exec time</em> means <b>execution time</b>.
            </p>
            <p>
                3. Below is the file we are staging. Next to each column name is a dropdown to tell NEAT what the column is. Next to the dropdown you can see what the first few cells from that column look like.
            </p>
            <p>
                4. Once you've told NEAT what each column is and the status bar shows no issues, press the <b>Import Data</b> button.
            </p>
        </div>
        ); },

    Staging_Step2: function() { return (
        <div>
            <p>
                1. <Link to="manual">Interpretation</Link> is how we tell NEAT what the data in particular columns mean.
            </p>
            <p>
                2. For example, the direction column may have many different words used to indicate what direction each trade is. We need to tell NEAT what those words mean.
            </p>
            <p>
                3. For each column below we will explain to NEAT what the words in that column mean. For more information <Link to="manual">read about interpretation</Link>.
            </p>
        </div>
        ); },

}
