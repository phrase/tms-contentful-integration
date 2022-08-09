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

const Sidebar = () => {
    type LanguageData = {
        "languageCode": string,
        "languageName": string,
        "submitted": number | null,
        "processing": number | null
        "completed": number | null
    }

    interface MemsourceObject {
        "languageData": LanguageData[]
    }

    const availableLanguages: { languageCode: string; languageName: string }[] = []

    const sdk = useSDK<SidebarExtensionSDK>()
    const [languageData, setLanguageData] = useState(loadLanguageData())
    const [selectedLanguages, setSelectedLanguages] = useState(loadSelectedLanguages())

    useEffect(() => {
        sdk.window?.startAutoResizer()
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setLanguageData(loadLanguageData())
        }, 1000)

        return () => clearInterval(interval)
    })

    function loadSelectedLanguages() {
        const languages: string[] = []

        languageData.forEach(language => {
            if (isLanguageAtAPC(language)) {
                languages.push(language.languageCode)
            }
        })

        return languages
    }

    function isLanguageAtAPC(language: LanguageData) {
        return language.submitted || language.processing || language.completed
    }

    function isACPEngaged() {
        return anySubmitted() || anyProcessing() || anyCompleted()
    }

    function loadLanguageData(): LanguageData[] {

        if (availableLanguages.length === 0) {
            loadTargetLanguages()
        }

        if (sdk.entry.fields.memsource.getValue()) {
            const memsourceObject: MemsourceObject = sdk.entry.fields.memsource.getValue()
            if (memsourceObject.languageData) {
                return memsourceObject.languageData
            }
        }

        return prepareLanguageDataObject()
    }

    function loadTargetLanguages() {
        // load all available locales except the default one
        // this will be changes in the future
        Object.keys(sdk.locales.names).forEach(key => {
            if (key !== sdk.locales.default) {
                availableLanguages.push({
                    "languageCode": key,
                    "languageName": sdk.locales.names[key]
                })
            }
        })
    }

    function prepareLanguageDataObject(): LanguageData[] {
        const languageData: LanguageData[] = []

        availableLanguages.forEach(language => {
            languageData.push({
                "languageCode": language.languageCode,
                "languageName": language.languageName,
                "submitted": null,
                "processing": null,
                "completed": null
            })
        })

        return languageData
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const languageCode = event.target.value
        const checked = event.target.checked

        if (checked) {
            setSelectedLanguages([...selectedLanguages, languageCode])
        } else {
            setSelectedLanguages(selectedLanguages.filter(language => language !== languageCode))
        }
    };

    const handleSubmit = (): void => {
        const newLanguageData = languageData.map(language => {
            if (selectedLanguages.includes(language.languageCode)) {
                return {
                    ...language,
                    submitted: Math.floor(Date.now() / 1000)
                }
            }

            return language
        })


        setLanguageData(newLanguageData)

        const memsourceObject: MemsourceObject = {
            "languageData": newLanguageData
        }

        sdk.entry.fields.memsource.setValue(memsourceObject).catch(err => console.log('Error setting memsource object', err))
    };

    const handleCancel = (): void => {

        setSelectedLanguages([])

        const newLanguageData = languageData.map(language => {
            return {
                ...language,
                submitted: null
            }
        })

        setLanguageData(newLanguageData)

        const memsourceObject: MemsourceObject = {
            "languageData": newLanguageData
        }

        sdk.entry.fields.memsource.setValue(memsourceObject).catch(err => console.log('Error setting memsource object', err))
    };

    const handleReset = (): void => {

        setSelectedLanguages([])

        const newTranslationData = languageData.map(language => {
            return {
                ...language,
                completed: null
            }
        })

        setLanguageData(newTranslationData)

        sdk.entry.fields.memsource.setValue(newTranslationData).catch(console.error)
    };

    const handleSelectAll = (): void => {
        setSelectedLanguages(availableLanguages.map(language => language.languageCode))
    };

    const handleSelectNone = (): void => {
        setSelectedLanguages([])
    }

    const anySubmitted = (): boolean => languageData.some(language => language.submitted);

    const anyProcessing = (): boolean => languageData.some(language => language.processing);

    const anyCompleted = (): boolean => languageData.some(language => language.completed);

    const badgeStates = (language: LanguageData): JSX.Element | null => {
        if (language.completed) {
            return <Badge variant="positive">Completed</Badge>
        } else if (language.processing) {
            return <Badge variant="warning">In Progress</Badge>
        } else if (language.submitted) {
            return <Badge variant="secondary">Submitted</Badge>
        } else {
            return null
        }
    };

    const buttonStates = (): JSX.Element | null => {

        if (!anySubmitted() && !anyProcessing() && !anyCompleted()) {
            return <Button
                onClick={handleSubmit}
                variant="primary"
                isDisabled={selectedLanguages.length === 0}
            >
                Submit
            </Button>
        }

        if (anySubmitted() && !anyCompleted() && !anyProcessing()) {
            return <Button
                onClick={handleCancel}
                variant="negative"
            >
                Cancel
            </Button>
        }

        if (anyCompleted() && !anyProcessing() && !anySubmitted()) {
            return <Button
                onClick={handleReset}
                variant="primary"
            >
                Star over
            </Button>
        }

        return null

    };


    const userInfoStates = (): JSX.Element | null => {

        if (!anySubmitted() && !anyProcessing() && !anyCompleted()) {
            return <Paragraph>
                <Text fontSize="fontSizeL">Please select the target languages to localize this content
                    into:</Text>
            </Paragraph>
        }

        if (anySubmitted() && !anyProcessing() && !anyCompleted()) {
            return <Paragraph>
                <Text fontSize="fontSizeL">The content has been submitted for localization, and you can follow
                    the progress below.</Text>
            </Paragraph>
        }

        if (anyProcessing()) {
            return <Paragraph>
                <Text fontSize="fontSizeL">The content is currently being localized, and you can follow the
                    progress below.</Text>
            </Paragraph>
        }

        if (anySubmitted() && anyCompleted()) {
            return <Paragraph>
                <Text fontSize="fontSizeL">The content is currently being localized, and you can follow the
                    progress below.</Text>
            </Paragraph>
        }

        if (anyCompleted()) {
            return <div>
                <Paragraph>
                    <Text fontSize="fontSizeL">Localization completed. You can now view the localized content
                        here in Contentful.</Text>
                </Paragraph>
                <Paragraph>
                    <Text fontSize="fontSizeL">Not satisfied with the results? Start over.</Text>
                </Paragraph>
            </div>
        }

        return null

    }

    const isSelected = (languageCode: string): boolean => selectedLanguages.includes(languageCode);

    return (
        <>
            <FormControl>
                <FormControl.Label marginBottom="none">
                    <Heading>Localize content</Heading>
                </FormControl.Label>

                {userInfoStates()}

                {!anySubmitted() && !anyProcessing() && !anyCompleted() &&
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
                                    isDisabled={anyProcessing() || anyCompleted() || anySubmitted()}
                                    value={language.languageCode}
                                    id={language.languageCode}
                                    isChecked={isSelected(language.languageCode)}
                                    onChange={handleCheckboxChange}
                                >
                                    <Text
                                        fontWeight="fontWeightMedium"
                                        fontColor={isACPEngaged() ? isLanguageAtAPC(language) ? "gray800" : "gray400" : "gray800"}
                                    >
                                        {language.languageName}
                                    </Text>
                                </Checkbox>
                                {badgeStates(language)}
                            </Flex>
                        </Box>
                    )
                })}

                {!isACPEngaged() &&
					<Box paddingTop="spacingXl">
						<Paragraph>Note: Once a Memsource translation project has been created with the submitted languages, they cannot be cancelled within the app.</Paragraph>
					</Box>
                }

                <Flex justifyContent="flex-end"
                      paddingTop={isACPEngaged() ? "spacingXl" : "spacingM"}
                      gap="spacingM">
                    {buttonStates()}
                </Flex>

            </FormControl>
        </>
    )
}

export default Sidebar
