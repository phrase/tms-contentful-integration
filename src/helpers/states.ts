import {LanguageDataType} from "../types/types";

function noUnsubmitted(languageData: LanguageDataType[]): boolean {
    return languageData.every(language => language.submitted || language.processing || language.completed || language.cancelled)
}

function anySubmitted(languageData: LanguageDataType[]): boolean {
    return languageData.some(language => language.submitted)
}

function anyProcessing(languageData: LanguageDataType[]): boolean {
    return languageData.some(language => language.processing)
}

function anyCompleted(languageData: LanguageDataType[]): boolean {
    return languageData.some(language => language.completed)
}

function allCompleted(languageData: LanguageDataType[]): boolean {
    return languageData.every(language => language.completed)
}

function anyCancelled(languageData: LanguageDataType[]): boolean {
    return languageData.some(language => language.cancelled)
}

function isLanguageAtAPC(language: LanguageDataType) {
    return language.submitted || language.processing || language.completed
}

function isACPEngaged(languageData: LanguageDataType[]): boolean {
    return anySubmitted(languageData) || anyProcessing(languageData) || anyCompleted(languageData)
}

function isSelected(selectedLanguages: string[], languageCode: string): boolean {
    return selectedLanguages.includes(languageCode)
}

function isDisabled(language: LanguageDataType) {

    if (language.submitted || language.processing || language.completed) {
        return true
    }

    if (language.cancelled) {
        return false
    }
}

export {
    noUnsubmitted,
    anySubmitted,
    anyProcessing,
    anyCompleted,
    allCompleted,
    anyCancelled,
    isLanguageAtAPC,
    isACPEngaged,
    isSelected,
    isDisabled,
}