type LanguageDataType = {
    "languageCode": string
    "languageName": string
    "submitted": number | null
    "processing": number | null
    "completed": number | null
    "cancelled": number | null
}

interface PhraseObject {
    "languageData": LanguageDataType[]
}

enum ButtonStates {
    Removed = 'removed',
    Submit = 'Submit',
    Cancel = 'Cancel',
    Startover = 'Start Over',
    CancelAndStartover = 'Cancel and Start Over'
}


export {
    LanguageDataType,
    PhraseObject,
    ButtonStates,
}