import React, {useCallback, useState, useEffect} from 'react';
import {AppExtensionSDK} from '@contentful/app-sdk';
import {Heading, Form, Accordion, Flex, Checkbox, Paragraph, Box} from '@contentful/f36-components';
import {css} from 'emotion';
import {useCMA, useSDK} from '@contentful/react-apps-toolkit';
import {ContentTypeProps} from 'contentful-management';
import tokens from '@contentful/f36-tokens';

const merge = require('lodash.merge');

export interface AppInstallationParameters {
}

const styles = {
    body: css({
        height: 'auto',
        minHeight: '65vh',
        margin: '0 auto',
        marginTop: tokens.spacingXl,
        padding: `${tokens.spacingXl} ${tokens.spacing2Xl}`,
        maxWidth: tokens.contentWidthText,
        backgroundColor: tokens.colorWhite,
        zIndex: 2,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '2px',
    }),
    background: css({
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        top: 0,
        width: '100%',
        height: '300px',
        backgroundColor: '#03EAB3',
    }),
    contentTypesContainer: css({
        margin: '80px',
        maxWidth: '800px'
    }),
    tinyTextContainer: css({
        maxWidth: tokens.contentWidthText,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
    }),
    tinyText: css({
        fontSize: '12px',
        fontStyle: 'italic',
        textAlign: 'center',
    })

};

const buildSidebarTargetState = (selectedSidebarCTs: string[]) => {
    return selectedSidebarCTs.reduce(
        (acc, ct) => ({
            ...acc,
            [ct]: {
                sidebar: {position: 0},
            },
        }),
        {}
    );
};

const ConfigScreen = () => {
    const [parameters, setParameters] = useState<AppInstallationParameters>({});
    const [contentTypes, setContentTypes] = useState<ContentTypeProps[]>([]);
    const [selectedCTs, setSelectedCTs] = useState<string[]>([]);
    const sdk = useSDK<AppExtensionSDK>();
    const cma = useCMA();


    const onConfigure = useCallback(async () => {

        const currentState = await sdk.app.getCurrentState();

        contentTypes.forEach(ct => {

            if (selectedCTs.includes(ct.sys.id)) {
                cma.contentType.get({
                    contentTypeId: ct.sys.id,
                }).then((ctProps) => {

                    const fields = () => {
                        if (ctProps.fields.find(field => field.id === 'phrase')) {
                            return [...ctProps.fields]
                        }
                        return [...ctProps.fields, {
                            id: 'phrase',
                            name: 'Phrase TMS',
                            type: 'Object',
                            localized: false,
                            required: false,
                            disabled: true,
                            omitted: false,
                        }]
                    }

                    cma.contentType.update({
                        contentTypeId: ctProps.sys.id,
                    }, {
                        description: ctProps.description,
                        sys: ctProps.sys,
                        name: ctProps.name,
                        displayField: ctProps.displayField,
                        fields: fields(),
                    }).then(ctUpdated => {
                        cma.contentType.publish({contentTypeId: ctUpdated.sys.id}, ctUpdated)
                    })
                }).catch(err => {
                    console.log(err)
                })

            } else {
                cma.contentType.get({
                    contentTypeId: ct.sys.id,
                }).then((ctProps) => {
                    cma.contentType.update({
                        contentTypeId: ctProps.sys.id,
                    }, {
                        description: ctProps.description,
                        sys: ctProps.sys,
                        name: ctProps.name,
                        displayField: ctProps.displayField,
                        fields: [
                            ...ctProps.fields.map((field) => {
                                if (field.id === 'phrase') {
                                    return {
                                        ...field,
                                        omitted: true,
                                    }
                                }
                                return field;
                            })
                        ]
                    }).then(ctUpdated => {
                        cma.contentType.publish({contentTypeId: ctUpdated.sys.id}, ctUpdated)
                            .then((ctPublished) => {
                                cma.contentType.update({
                                    contentTypeId: ctPublished.sys.id,
                                }, {
                                    description: ctPublished.description,
                                    sys: ctPublished.sys,
                                    name: ctPublished.name,
                                    displayField: ctPublished.displayField,
                                    fields: [
                                        ...ctPublished.fields.filter((field) => field.id !== 'phrase'),
                                    ]
                                }).then(ctUpdated => {
                                    cma.contentType.publish({contentTypeId: ctUpdated.sys.id}, ctUpdated)
                                })
                            })
                    })
                }).catch(err => {
                    console.log(err)
                })
            }
        })


        return {
            parameters,
            targetState: {
                EditorInterface: {
                    ...currentState?.EditorInterface,
                    ...merge(
                        buildSidebarTargetState(selectedCTs),
                    )
                },
            },
        };
    }, [cma.contentType, contentTypes, parameters, sdk.app, selectedCTs]);


    const handleContentTypeSelection = useCallback((ct: string) => {
        if (!selectedCTs.includes(ct)) {
            setSelectedCTs([...selectedCTs, ct]);
        } else {
            setSelectedCTs(selectedCTs.filter(selectedCT => selectedCT !== ct));
        }
    }, [selectedCTs, setSelectedCTs]);

    useEffect(() => {
        sdk.app.onConfigure(() => onConfigure());
    }, [sdk, onConfigure]);

    useEffect(() => {
        (async () => {
            const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

            if (currentParameters) {
                setParameters(currentParameters);
            }
            await sdk.app.setReady();
        })();
    }, [sdk]);

    useEffect(() => {
        (async () => {
            const cts = await cma.contentType.getMany({
                spaceId: sdk.ids.space,
                environmentId: sdk.ids.environment,
            });
            setContentTypes(cts.items || []);
        })();
    }, [cma, sdk]);

    useEffect(() => {
        if (contentTypes.length > 0) {
            const selectedCTs = contentTypes.filter(ct => ct.fields.some(field => field.id === 'phrase'));
            setSelectedCTs(selectedCTs.map(ct => ct.sys.id));
        }
    }, [contentTypes]);


    return (
        <>
            <div className={styles.background}/>
            <div className={styles.body}>
                <Flex justifyContent="center"
                      paddingTop="spacingXl">
                    <svg width="380" height="100" viewBox="0 0 380 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M141.879 36.2419C141.879 40.9576 138.043 44.7938 133.327 44.7938H112.538V20.1212H133.327C138.043 20.1212 141.879 23.9578 141.879 28.6732V36.2419ZM133.327 10.2318H103.672C102.918 10.2318 102.307 10.8426 102.307 11.5959V77.414C102.307 78.1673 102.918 78.7781 103.672 78.7781H111.174C111.928 78.7781 112.538 78.1673 112.538 77.414V54.6832H133.327C143.512 54.6832 151.769 46.4266 151.769 36.2419V28.6732C151.769 18.4884 143.512 10.2318 133.327 10.2318Z" fill="#101010"/>
                        <path d="M217.429 78.7771H210.268C209.515 78.7771 208.904 78.1663 208.904 77.413V49.9856C208.904 38.7648 218 29.6686 229.221 29.6686H231.153C231.906 29.6686 232.517 30.2794 232.517 31.0327V38.1943C232.517 38.9476 231.906 39.5584 231.153 39.5584H229.221C223.462 39.5584 218.794 44.227 218.794 49.9859V77.413C218.794 78.1663 218.183 78.7771 217.429 78.7771Z" fill="#101010"/>
                        <path d="M283.424 78.7771H276.263C275.509 78.7771 274.898 78.1663 274.898 77.413V32.0732C274.898 31.3199 275.509 30.7091 276.263 30.7091H283.424C284.177 30.7091 284.788 31.3199 284.788 32.0732V77.413C284.788 78.1663 284.177 78.7771 283.424 78.7771Z" fill="#101010"/>
                        <path d="M183.505 29.6655C177.126 29.6655 171.454 31.6097 168.377 35.8661V11.5959C168.377 10.8426 167.766 10.2318 167.013 10.2318H159.851C159.098 10.2318 158.487 10.8426 158.487 11.5959V77.414C158.487 78.1673 159.098 78.7781 159.851 78.7781H167.013C167.766 78.7781 168.377 78.1673 168.377 77.414V53.4146C168.377 44.9196 173.817 39.2886 181.08 39.2886C187.605 39.2886 192.601 43.297 192.601 51.2818V77.414C192.601 78.1673 193.212 78.7781 193.965 78.7781H201.127C201.88 78.7781 202.491 78.1673 202.491 77.414V50.2717C202.491 41.1179 197.546 29.6655 183.505 29.6655Z" fill="#101010"/>
                        <path d="M356.13 38.8976C363.533 38.8976 367.847 43.5506 369.398 50.1655H342.192C343.805 43.5503 349.049 38.8976 356.13 38.8976ZM356.664 29.665C342.814 29.665 331.754 40.4442 331.754 54.7438C331.754 69.0433 342.982 79.8222 356.833 79.8222C364.772 79.8222 371.689 76.7918 376.431 71.8797C376.948 71.3446 376.929 70.489 376.399 69.9665L371.753 65.3811C371.243 64.878 370.423 64.8433 369.892 65.3238C366.439 68.4469 361.65 70.2529 357.126 70.2529C349.796 70.2529 343.713 65.2699 342.094 58.2969H378.24C378.959 58.2969 379.551 57.739 379.602 57.0222C379.656 56.2712 379.679 55.5107 379.723 54.7438C380.514 40.9018 370.515 29.665 356.664 29.665Z" fill="#101010"/>
                        <path d="M259.708 69.9324C251.319 69.9324 244.519 63.132 244.519 54.7438C244.519 46.3552 251.319 39.5548 259.708 39.5548C268.097 39.5548 274.897 46.3552 274.897 54.7438C274.897 63.132 268.097 69.9324 259.708 69.9324ZM259.708 29.665C245.858 29.665 234.63 40.893 234.63 54.7438C234.63 68.5942 245.858 79.8222 259.708 79.8222C272.649 79.8222 283.422 68.5942 283.422 54.7438C283.422 40.893 272.649 29.665 259.708 29.665Z" fill="#101010"/>
                        <path d="M320.922 41.8448L325.55 37.198C326.114 36.6322 326.077 35.7029 325.463 35.192C323.267 33.3621 317.774 29.6654 309.243 29.6654C297.908 29.6654 291.952 37.0063 291.952 43.9291C291.952 60.5224 317.466 57.0024 317.466 64.8051C317.466 69.3199 312.954 70.8712 308.964 70.8712C303.662 70.8712 299.273 67.1336 297.425 65.2832C296.887 64.745 296.017 64.7444 295.483 65.2866L290.866 69.9798C290.358 70.4968 290.339 71.3238 290.832 71.8568C292.982 74.1833 299.202 79.8222 308.973 79.8222C321.285 79.8222 327.53 72.2885 327.53 64.5452C327.53 48.0112 301.979 51.6278 301.979 43.8221C301.979 41.146 304.612 38.7193 309.499 38.7193C314.292 38.7193 317.626 40.7937 319.126 41.9652C319.666 42.3867 320.438 42.3301 320.922 41.8448Z" fill="#101010"/>
                        <path d="M48.7672 0H5.65125C2.6376 0 0.194824 2.44277 0.194824 5.45642V73.3207C0.194824 76.3343 2.6376 78.7771 5.65125 78.7771H34.1031V68.5463H10.4256V10.2308H48.7672C53.8526 10.2308 57.9749 14.3531 57.9749 19.4385V59.3386C57.9749 64.424 53.8526 68.5463 48.7672 68.5463H40.5826C39.8292 68.5463 39.2185 69.1571 39.2185 69.9104V77.413C39.2185 78.1667 39.8292 78.7771 40.5826 78.7771H48.7672C59.5027 78.7771 68.2057 70.0744 68.2057 59.3386V19.4385C68.2057 8.703 59.5027 0 48.7672 0Z" fill="#101010"/>
                        <path d="M25.3246 98.8624L4.26965 82.7063C1.57793 80.641 0 77.4412 0 74.0487V5.46722C0 0.943161 5.18905 -1.61589 8.77801 1.13824L29.8333 17.2944C32.5247 19.3596 34.1026 22.5595 34.1026 25.952V94.5334C34.1026 99.0575 28.9139 101.617 25.3246 98.8624Z" fill="#00F0B3"/>
                    </svg>

                </Flex>
                <Flex flexDirection="column"
                      className={styles.contentTypesContainer}>
                    <Form>
                        <Heading>Choose where you want your Phrase TMS app installed.</Heading>
                        <Box paddingTop="spacingXs"><Accordion>
                            <Accordion.Item title="Content types">
                                {contentTypes.map((ct) => (
                                    <Checkbox
                                        isChecked={selectedCTs.includes(ct.sys.id)}
                                        onChange={() => {
                                            handleContentTypeSelection(ct.sys.id);
                                        }}
                                        key={ct.sys.id}
                                        className={css({
                                            margin: tokens.spacingM,
                                        })}
                                    >
                                        {ct.name}
                                    </Checkbox>
                                ))}
                            </Accordion.Item>
                        </Accordion></Box>
                    </Form>
                </Flex>
            </div>
            <div className={styles.tinyTextContainer}>
                <Paragraph marginTop={"spacingM"}
                           className={styles.tinyText}>
                    The plugin will create a JSON object called "Phrase TMS" for each of the selected content types.
                    Object is used to store selected target
                    languages as well as translation process. Please <strong>DO NOT DELETE</strong> this object as
                    plugin will not
                    work
                    without it.
                </Paragraph>
            </div>
        </>
    );
};

export default ConfigScreen;
