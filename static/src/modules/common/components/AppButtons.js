/**
 * Collection of string references for buttons throughout the application.
 * Use these references rather than hardcoded strings to avoid Buttons
 * and ButtonReferences from getting out of sync throughout the UI.
 * @exports lib\Components\Buttons
 */
const Buttons = {
    //Next: '>',
    Next: { glyph: 'chevron-right' },
    Previous: '<',

    NewCase: 'New Case',
    OpenCase: 'Open Case',
    CreateCase: 'Create',
    CancelCreate: 'Cancel',

    ViewFile: 'View',
    RemoveFile: 'Remove',
    StageFile: 'Stage',

    FileConfirm: 'Confirm',
    FileReset: 'Reset',
    // ViewFile: { glyph: 'search' },
    // RemoveFile: { glyph: 'remove' },
    // StageFile: { glyph: 'arrow-right' },
    CreateDb: 'Create Database',
    CreatingDb: 'Creating Database...',

    ProcessFile: 'Process',
    ResetFile: 'Reset',

    InterpretationConfirm: 'Confirm',
    InterpretationReset: 'Reset',
    ViewTrans: 'View',

    GetRefData: 'Get Reference Data',
    GettingRefData: 'Getting Reference Data...',

    ConfirmSymbols: 'Confirm Changes',
    RDOs: 'Adjustments',

    Finalize: 'Finalize',
    Finalizing: 'Finalizing...',

    Share: 'Share',
    Sharing: 'Preparing...',

    Restore: 'Restore case',
    Restoring: 'Restoring...',

    UnlockCase: 'Unlock Case',

    GenerateCSV: 'Generate CSV',
};

export default Buttons;
