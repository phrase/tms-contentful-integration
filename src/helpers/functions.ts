import {LanguageDataType} from "../types/types";
import moment from "moment";

function lastUpdatedAt(language: LanguageDataType): string | null {

    let lastUpdatedAt: string | null = null;

    if (language.submitted) {
        lastUpdatedAt = moment.unix(language.submitted).fromNow()
    } else if (language.processing) {
        lastUpdatedAt = moment.unix(language.processing).fromNow()
    } else if (language.completed) {
        lastUpdatedAt = moment.unix(language.completed).fromNow()
    } else if (language.cancelled) {
        lastUpdatedAt = moment.unix(language.cancelled).fromNow()
    }

    if (lastUpdatedAt) {
        return 'Updated ' + lastUpdatedAt
    }

    return null
}

export {
    lastUpdatedAt,
}