import {ButtonStates, LanguageDataType} from "../types/types";
import React from "react";
import {
    allCompleted,
    anyCancelled, anyCompleted,
    anyProcessing,
    anySubmitted, noUnsubmitted,
} from "./states";

function evaluateButtonState(languageData: LanguageDataType[], setButtonState: React.Dispatch<React.SetStateAction<ButtonStates>>, selectedLanguages: string[]) {


    /**
     * SUBMIT + CANCEL has to be first as it is the base state
     */

    // -------------------------- SUBMIT + CANCEL --------------------------
    /**
     * If any language is submitted and processing hasn't started, the button is changed to "cancel"
     * if unsubmitted language is added to previously submitted languages we change button back to "Submit"
     *
     * languageData Test #1
     */
    if (anySubmitted(languageData) && selectedLanguages.length > languageData.filter(language => language.submitted).length) {
        setButtonState(ButtonStates.Submit)
    } else if (anySubmitted(languageData)) {
        setButtonState(ButtonStates.Cancel)
    }

    // -------------------------- SUBMIT --------------------------
    /**
     * All languages are sent to phrase
     * some are processing
     * some are completed
     * some are cancelled
     *
     * languageData Test #4
     */
    if ( noUnsubmitted(languageData) && anyCompleted(languageData) && anyProcessing(languageData) && anyCancelled(languageData)) {
        setButtonState(ButtonStates.Submit)
    }

    /**
     * Some language are unsubmitted
     * some are processing
     * some are completed
     * none are cancelled
     *
     * languageData Test #5
     */
    if (!noUnsubmitted(languageData) && anyProcessing(languageData) && anyCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Submit)
    }

    /**
     * Some language are unsubmitted
     * some are processing
     * none are completed
     * none are cancelled
     *
     * languageData Test #6
     */
    if (!noUnsubmitted(languageData) && anyProcessing(languageData) && !anyCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Submit)
    }

    // -------------------------- START OVER --------------------------

    /**
     * All languages are sent to phrase
     * none is processing
     * some are completed
     * some are cancelled
     *
     * languageData Test #7
     */
    if ( noUnsubmitted(languageData) && anyCompleted(languageData) && !anyProcessing(languageData) && anyCancelled(languageData)) {
        setButtonState(ButtonStates.Startover)
    }

    /**
     * Some language are unsubmitted
     * none are processing
     * some are completed
     * none are cancelled
     *
     * languageData Test #8
     */
    if (!noUnsubmitted(languageData) && !anyProcessing(languageData) && anyCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Startover)
    }

    /**
     * Some language are unsubmitted
     * none are processing
     * some are completed
     * some are cancelled
     *
     * languageData Test #9
     */
    if (!noUnsubmitted(languageData) && anyCompleted(languageData) && !anyProcessing(languageData) && anyCancelled(languageData)) {
        setButtonState(ButtonStates.Startover)
    }

    /**
     * All languages are unsubmitted
     * none are processing
     * all are completed
     * none are cancelled
     *
     * languageData Test #10
     */
    if (noUnsubmitted(languageData) && !anyProcessing(languageData) && allCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Startover)
    }

    // -------------------------- CANCEL AND START OVER --------------------------
    /**
     * All languages are sent to phrase
     * none is processing
     * some are completed
     * none are cancelled
     * and not all completed
     *
     * languageData Test #11
     */
    if ( (noUnsubmitted(languageData) && anyCompleted(languageData) && !anyProcessing(languageData) && !anyCancelled(languageData)) && !allCompleted(languageData)) {
        setButtonState(ButtonStates.CancelAndStartover)
    }

    /**
     * Some language are unsubmitted
     * some are submitted
     * none are processing
     * some are completed
     * none are cancelled
     *
     * languageData Test #12
     */
    if (!noUnsubmitted(languageData) && anySubmitted(languageData) && !anyProcessing(languageData) && anyCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.CancelAndStartover)
    }

    // -------------------------- REMOVED --------------------------
    /**
     * All languages are sent to phrase
     * some are processing
     * none are completed
     * none are cancelled
     *
     * languageData Test #13
     */
    if (noUnsubmitted(languageData) && anyProcessing(languageData) && !anyCompleted(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Removed)
    }

    /**
     * All languages are sent to phrase
     * some are processing
     * some are completed
     * none are cancelled
     *
     * languageData Test #14
     */
    if ( noUnsubmitted(languageData) && anyCompleted(languageData) && anyProcessing(languageData) && !anyCancelled(languageData)) {
        setButtonState(ButtonStates.Removed)
    }




}

function isButtonRemoved(buttonState: ButtonStates): boolean {
    return buttonState === ButtonStates.Removed;

}

export {
    evaluateButtonState,
    isButtonRemoved
};