import React from 'react';
import Sidebar from './Sidebar';
import { render, screen} from '@testing-library/react';
import * as appsToolkit from '@contentful/react-apps-toolkit';
import {mockSdk} from "../../test/mocks";

jest.mock('@contentful/react-apps-toolkit', () => ({
    __esModule: true,
    useSDK: null,
}));


describe('Sidebar component', () => {

    it('loads the initial screen with all available language', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Localize content')).toBeInTheDocument();
        expect(screen.getByText('Please select the target languages to localize this content into:')).toBeInTheDocument();
        expect(screen.getByText('Note: Once a Phrase TMS translation project has been created with the submitted languages, they cannot be cancelled within the app.')).toBeInTheDocument();
        expect(screen.getByText('French')).toBeInTheDocument();
        expect(screen.getByText('German')).toBeInTheDocument();
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Czech')).toBeInTheDocument();
    });

    it('changes the text info when some languages are submitted and not all completed', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.queryByText('Please select the target languages to localize this content into:')).not.toBeInTheDocument();
        expect(screen.queryByText('The content has been submitted for localization, and you can follow the progress below.')).toBeInTheDocument();
        expect(screen.queryByText('Note: Once a Phrase TMS translation project has been created with the submitted languages, they cannot be cancelled within the app.')).not.toBeInTheDocument();
    })

    it('changes the text info when all languages are completed', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.queryByText('Please select the target languages to localize this content into:')).not.toBeInTheDocument();
        expect(screen.queryByText('The content has been submitted for localization, and you can follow the progress below.')).not.toBeInTheDocument();
        expect(screen.queryByText('Note: Once a Phrase TMS translation project has been created with the submitted languages, they cannot be cancelled within the app.')).not.toBeInTheDocument();
        expect(screen.queryByText('Localization completed. You can now view the localized content here in Contentful.')).toBeInTheDocument();
        expect(screen.queryByText('Not satisfied with the results? Start Over.')).toBeInTheDocument();
    })

    it('languageData Test #1 - changes Cancel button to Submit when some languages are sent to Phrase TMS and user clicks on unsubmitted language', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Cancel')).toBeInTheDocument();

        screen.queryByTestId('de-checkbox')?.click();

        expect(screen.getByText('Submit')).toBeInTheDocument();
    })

    it('languageData Test #2 - displays cancel button when some languages are sent to Phrase TMS and only submitted', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('languageData Test #3 - displays cancel button when all languages are sent to Phrase TMS and all are submitted', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('languageData Test #4 - displays submit button when all languages are sent to Phrase TMS, some are processing, some completed and some cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": 1660625747,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": 1660625747,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('languageData Test #5 - displays submit button when some languages are sent to Phrase TMS, some are processing, some completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": 1660625747,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('languageData Test #6 - displays submit button when some languages are sent to Phrase TMS, some are processing, none completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": 1660625747,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('languageData Test #7 - displays start over button when all languages are sent to Phrase TMS, none are processing, some completed, some cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": 1660625747,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Start Over')).toBeInTheDocument();
    })

    it('languageData Test #8 - displays start over button when some languages are sent to Phrase TMS, none are processing, some completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Start Over')).toBeInTheDocument();
    })

    it('languageData Test #9 - displays start over button when some languages are sent to Phrase TMS, none are processing, some completed, some cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": 1660625747,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Start Over')).toBeInTheDocument();
    })

    it('languageData Test #10 - displays start over button when some languages are sent to Phrase TMS, none are processing, all completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Start Over')).toBeInTheDocument();
    })

    it('languageData Test #11 - displays Cancel and Start Over button when all languages are sent to Phrase TMS, none are processing, some completed, none cancelled and not all completed', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Cancel and Start Over')).toBeInTheDocument();
    })

    it('languageData Test #12 - displays Cancel and Start Over button when some languages are sent to Phrase TMS, some are submitted, none processing, some completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": 1660625747,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByText('Cancel and Start Over')).toBeInTheDocument();
    })

    it('languageData Test #13 - does not display any button when all languages are sent to Phrase TMS, some are processing, none completed, none cancelled', () => {

        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": 1660625747,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": 1660625747,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.queryByTestId('cf-ui-button')).not.toBeInTheDocument()
    })

    it('languageData Test #14 - does not display any button when all languages are sent to Phrase TMS, some are processing, some completed, none cancelled', () => {

            mockSdk.entry.fields.phrase.getValue = () => ({
                languageData: [
                    {
                        "languageCode": "fr",
                        "languageName": "French",
                        "submitted": null,
                        "processing": 1660625747,
                        "completed": null,
                        "cancelled": null,
                    },
                    {
                        "languageCode": "de",
                        "languageName": "German",
                        "submitted": null,
                        "processing": null,
                        "completed": 1660625747,
                        "cancelled": null,
                    },
                    {
                        "languageCode": "it",
                        "languageName": "Italian",
                        "submitted": 1660625747,
                        "processing": null,
                        "completed": null,
                        "cancelled": null,
                    },
                    {
                        "languageCode": "cs",
                        "languageName": "Czech",
                        "submitted": 1660625747,
                        "processing": null,
                        "completed": null,
                        "cancelled": null,
                    }
                ]

            });

            // @ts-ignore
            appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

            render(<Sidebar/>);

            expect(screen.queryByTestId('cf-ui-button')).not.toBeInTheDocument()
        })

    it('enables the submit button after on language is selected when nothing is selected or at APC', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByTestId('cf-ui-button')).toBeDisabled();

        screen.queryByTestId('cs-checkbox')?.click()

        expect(screen.getByTestId('cf-ui-button')).toBeEnabled();
    })

    it('enables the submit button after on language is selected when some submitted and some unsubmitted', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByTestId('cf-ui-button')).toHaveTextContent('Cancel');

        screen.queryByTestId('cs-checkbox')?.click()

        expect(screen.getByTestId('cf-ui-button')).toHaveTextContent('Submit');
        expect(screen.getByTestId('cf-ui-button')).toBeEnabled();
    })

    it('changes to submit button after on language is selected when some cancelled', () => {
        mockSdk.entry.fields.phrase.getValue = () => ({
            languageData: [
                {
                    "languageCode": "fr",
                    "languageName": "French",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "de",
                    "languageName": "German",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "it",
                    "languageName": "Italian",
                    "submitted": 1660625747,
                    "processing": null,
                    "completed": null,
                    "cancelled": null,
                },
                {
                    "languageCode": "cs",
                    "languageName": "Czech",
                    "submitted": null,
                    "processing": null,
                    "completed": null,
                    "cancelled": 1660625747,
                }
            ]

        });

        // @ts-ignore
        appsToolkit.useSDK = jest.fn().mockReturnValue(mockSdk);

        render(<Sidebar/>);

        expect(screen.getByTestId('cf-ui-button')).toHaveTextContent('Cancel');

        screen.queryByTestId('cs-checkbox')?.click()

        expect(screen.getByTestId('cf-ui-button')).toHaveTextContent('Submit');
    })
});
