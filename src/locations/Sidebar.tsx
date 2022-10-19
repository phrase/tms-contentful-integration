import React, {useEffect, useState} from 'react'
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    Heading,
    Paragraph,
    Text,
    TextLink
} from '@contentful/f36-components'
import {SidebarExtensionSDK} from '@contentful/app-sdk'
import {useSDK} from '@contentful/react-apps-toolkit'
import {LanguageDataType, PhraseObject, ButtonStates} from '../types/types'
import {
    anyCancelled,
    anyCompleted,
    anyProcessing,
    anySubmitted,
    isACPEngaged,
    isDisabled,
    isLanguageAtAPC, isSelected
} from "../helpers/states";
import {evaluateButtonState, isButtonRemoved} from "../helpers/buttons";
import {lastUpdatedAt} from "../helpers/functions";
import isEqual from "lodash-es/isEqual"

const Sidebar = () => {
    let originalLanguagesCount = 0

    const availableLanguages: { languageCode: string; languageName: string }[] = []

    const sdk = useSDK<SidebarExtensionSDK>()
    const [languageData, setLanguageData] = useState(loadLanguageData())
    const [selectedLanguages, setSelectedLanguages] = useState(loadSelectedLanguages())
    const [buttonState, setButtonState] = useState(ButtonStates.Submit)
    const [isSubmitBtnDisabled, setIsSubmitBtnDisabled] = useState(true)
    const [changeNotification, setChangeNotification] = useState(false)

    useEffect(() => {
        if (buttonState === ButtonStates.Startover || buttonState === ButtonStates.Cancel || selectedLanguages.length > originalLanguagesCount) {
            setIsSubmitBtnDisabled(false)
        }
    }, [buttonState, selectedLanguages, originalLanguagesCount])

    useEffect(() => {
        sdk.window?.startAutoResizer()
    })

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isEqual(loadLanguageData(), languageData)) {
                setChangeNotification(true)
            }

        }, 1000)

        return () => clearInterval(interval)
    })

    useEffect(() => {
        evaluateButtonState(languageData, setButtonState, selectedLanguages)
    }, [languageData, selectedLanguages])


    function loadSelectedLanguages() {
        const languages: string[] = []

        languageData.forEach(language => {
            if (isLanguageAtAPC(language)) {
                languages.push(language.languageCode)
            }
        })

        originalLanguagesCount = languages.length

        return languages
    }

    function loadLanguageData(): LanguageDataType[] {

        if (availableLanguages.length === 0) {
            loadTargetLanguages()
        }

        if (sdk.entry.fields.phrase.getValue()) {
            const phraseObject: PhraseObject = sdk.entry.fields.phrase.getValue()
            if (phraseObject.languageData) {
                return phraseObject.languageData
            }
        }

        return prepareLanguageDataObject()
    }

    function loadTargetLanguages() {
        // load all available locales except the default one
        // this will be changed in the future
        Object.keys(sdk.locales.names).forEach(key => {
            if (key !== sdk.locales.default) {
                availableLanguages.push({
                    "languageCode": key,
                    "languageName": sdk.locales.names[key]
                })
            }
        })
    }

    function prepareLanguageDataObject(): LanguageDataType[] {
        const languageData: LanguageDataType[] = []

        availableLanguages.forEach(language => {
            languageData.push({
                "languageCode": language.languageCode,
                "languageName": language.languageName,
                "submitted": null,
                "processing": null,
                "completed": null,
                "cancelled": null
            })
        })

        return languageData
    }

    function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const languageCode = event.target.value
        const checked = event.target.checked
        if (checked) {
            setSelectedLanguages([...selectedLanguages, languageCode])
        } else {
            setSelectedLanguages(selectedLanguages.filter(language => language !== languageCode))
        }
    }

    function handleSubmit(): void {
        if (buttonState === ButtonStates.Submit) {
            submitSelected()
        } else if (buttonState === ButtonStates.Cancel) {
            cancelSelected()
        } else if (buttonState === ButtonStates.Startover) {
            startOver()
        } else if (buttonState === ButtonStates.CancelAndStartover) {
            cancelSelected()
            startOver()
        }
    }

    function submitSelected(): void {
        const newLanguageData = languageData.map(language => {
            if (selectedLanguages.includes(language.languageCode) && !isLanguageAtAPC(language)) {

                return {
                    ...language,
                    submitted: Math.floor(Date.now() / 1000),
                    cancelled: null
                }
            }

            return language
        })


        setLanguageData(newLanguageData)

        const phraseObject: PhraseObject = {
            "languageData": newLanguageData
        }

        sdk.entry.fields.phrase.setValue(phraseObject).catch(err => console.log('Error setting phrase object', err))
    }

    function cancelSelected(): void {

        setSelectedLanguages([])

        const newLanguageData = languageData.map(language => {
            return {
                ...language,
                submitted: null
            }
        })

        setLanguageData(newLanguageData)

        setButtonState(ButtonStates.Submit)

        const phraseObject: PhraseObject = {
            "languageData": newLanguageData
        }

        setIsSubmitBtnDisabled(true)

        sdk.entry.fields.phrase.setValue(phraseObject).catch(err => console.log('Error setting phrase object', err))
    }

    function startOver(): void {

        setSelectedLanguages([])

        const newTranslationData = languageData.map(language => {
            return {
                ...language,
                submitted: null,
                processing: null,
                completed: null,
                cancelled: null
            }
        })

        setLanguageData(newTranslationData)

        setButtonState(ButtonStates.Submit)

        sdk.entry.fields.phrase.setValue(newTranslationData).catch(console.error)
    }

    function handleSelectAll(): void {
        setSelectedLanguages(availableLanguages.map(language => language.languageCode))
    }

    const handleSelectNone = (): void => {
        setSelectedLanguages([])
    }

    function badgeStates(language: LanguageDataType): JSX.Element | null {
        if (language.completed) {
            return <Badge variant="positive">Completed</Badge>
        } else if (language.processing) {
            return <Badge variant="featured">In Progress</Badge>
        } else if (language.submitted) {
            return <Badge variant="secondary">Submitted</Badge>
        } else if (language.cancelled) {
            return <Badge variant="warning">Cancelled</Badge>
        } else {
            return null
        }
    }

    function userInfoStates(): JSX.Element | null {

        if (!anySubmitted(languageData) && !anyProcessing(languageData) && !anyCompleted(languageData) && !anyCancelled(languageData)) {
            return <Paragraph>
                <Text fontSize="fontSizeL">Please select the target languages to localize this content
                    into:</Text>
            </Paragraph>
        }

        if (anySubmitted(languageData) && !anyProcessing(languageData) && !anyCompleted(languageData)) {
            return <Paragraph>
                <Text fontSize="fontSizeL">The content has been submitted for localization, and you can follow
                    the progress below.</Text>
            </Paragraph>
        }

        if (anyProcessing(languageData) || (anySubmitted(languageData) && anyCompleted(languageData))) {
            return <Paragraph>
                <Text fontSize="fontSizeL">The content is currently being localized, and you can follow the
                    progress below.</Text>
            </Paragraph>
        }


        if (anyCompleted(languageData)) {
            return <div>
                <Paragraph>
                    <Text fontSize="fontSizeL">Localization completed. You can now view the localized content
                        here in Contentful.</Text>
                </Paragraph>
                <Paragraph>
                    <Text fontSize="fontSizeL">Not satisfied with the results? Start Over.</Text>
                </Paragraph>
            </div>
        }

        return null

    }

    function reloadWindow() {
        window.location.reload()
    }

    return (
        <>
            <FormControl>
                <FormControl.Label marginBottom="none">
                    <Heading>Localize content</Heading>
                </FormControl.Label>

                {userInfoStates()}

                {!isACPEngaged(languageData) &&
					<Box paddingBottom="spacing2Xs">
                        {selectedLanguages.length > 0
                            ? <TextLink onClick={handleSelectNone}>Select none</TextLink>
                            : <TextLink onClick={handleSelectAll}>Select all</TextLink>}
					</Box>
                }

                {languageData.map((language, index) => {
                    return (
                        <Box paddingTop="spacingXs"
                             key={index}>
                            <Flex justifyContent="space-between">
                                <Checkbox
                                    isDisabled={isDisabled(language)}
                                    value={language.languageCode}
                                    id={language.languageCode}
                                    isChecked={isSelected(selectedLanguages, language.languageCode)}
                                    onChange={handleCheckboxChange}
                                    data-test-id={language.languageCode + '-checkbox'}
                                >
                                    <Text
                                        fontWeight="fontWeightMedium"
                                        fontColor={isLanguageAtAPC(language) ? 'gray400' : 'gray800'}
                                    >
                                        {language.languageName}
                                    </Text>
                                </Checkbox>
                                <Flex flexDirection="column" alignItems="end">
                                    <div>
                                        {badgeStates(language)}
                                    </div>
                                    {lastUpdatedAt(language) &&
										<Text fontSize="fontSizeS" fontColor="gray500">
                                            {lastUpdatedAt(language)}
										</Text>
                                    }
                                </Flex>
                            </Flex>
                        </Box>
                    )
                })}

                {!isACPEngaged(languageData) &&
					<Box paddingTop="spacingXl">
						<Paragraph>Note: Once a Phrase TMS translation project has been created with the submitted
							languages, they cannot be cancelled within the app.</Paragraph>
					</Box>
                }

                {changeNotification &&
					<Box paddingTop="spacingXl">
                        <Paragraph>The status of the submitted content has been updated. <TextLink onClick={reloadWindow}>Please refresh the page</TextLink> to see up-to-date information.</Paragraph>
					</Box>
                }

                <Flex justifyContent="flex-end"
                      paddingTop={isACPEngaged(languageData) ? "spacingXl" : "spacingM"}
                      gap="spacingM">

                    {!isButtonRemoved(buttonState) &&
						<Button
							onClick={handleSubmit}
							variant={buttonState === ButtonStates.Cancel || buttonState === ButtonStates.CancelAndStartover ? 'negative' : 'primary'}
							isDisabled={isSubmitBtnDisabled}
						>
                            {buttonState}
						</Button>
                    }
                </Flex>

            </FormControl>
        </>
    )
}

export default Sidebar
