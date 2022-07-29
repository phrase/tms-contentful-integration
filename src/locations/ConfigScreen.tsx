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
        backgroundColor: tokens.colorPrimary,
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
                        if (ctProps.fields.find(field => field.id === 'memsource')) {
                            return [...ctProps.fields]
                        }
                        return [...ctProps.fields, {
                            id: 'memsource',
                            name: 'Memsource',
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
                                if (field.id === 'memsource') {
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
                                        ...ctPublished.fields.filter((field) => field.id !== 'memsource'),
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
            const selectedCTs = contentTypes.filter(ct => ct.fields.some(field => field.id === 'memsource'));
            setSelectedCTs(selectedCTs.map(ct => ct.sys.id));
        }
    }, [contentTypes]);


    return (
        <>
            <div className={styles.background}/>
            <div className={styles.body}>
                <Flex justifyContent="center"
                      paddingTop="spacingXl">
                    <svg width="312"
                         height="46"
                         xmlns="http://www.w3.org/2000/svg">
                        <g fill="none">
                            <path fill="#6E7D8D"
                                  d="M74.689 32.24 79.397 1H89v44h-6.528V13.446L77.702 45h-6.529l-5.147-31.115V45H60V1h9.603zM102.967 19.543h9.564v6.286h-9.564v12.885H115V45H96V1h19v6.286h-12.033zM136.688 32.24 141.397 1H151v44h-6.528V13.446L139.702 45h-6.529l-5.147-31.115V45H122V1h9.604zM167.564.5c6.85 0 10.373 4.022 10.373 11.062v1.382h-6.659v-1.823c0-3.142-1.28-4.335-3.522-4.335-2.24 0-3.52 1.193-3.52 4.335 0 9.051 13.764 10.748 13.764 23.317 0 7.04-3.586 11.062-10.5 11.062S157 41.478 157 34.438v-2.702h6.658v3.143c0 3.142 1.41 4.273 3.65 4.273 2.242 0 3.65-1.13 3.65-4.273 0-9.05-13.766-10.748-13.766-23.317 0-7.04 3.522-11.062 10.372-11.062M191 34.221c0 3.1 1.352 4.279 3.5 4.279 2.149 0 3.5-1.178 3.5-4.279V10.779c0-3.1-1.351-4.279-3.5-4.279-2.148 0-3.5 1.178-3.5 4.279v23.442Zm-7-22.66C184 4.524 187.71.5 194.5.5c6.791 0 10.5 4.023 10.5 11.062v22.876c0 7.04-3.709 11.062-10.5 11.062-6.79 0-10.5-4.022-10.5-11.062V11.562ZM218.042 1v33.892c0 3.138 1.408 4.269 3.65 4.269 2.24 0 3.65-1.13 3.65-4.27V1H232v33.453c0 7.03-3.585 11.047-10.5 11.047-6.914 0-10.5-4.017-10.5-11.047V1h7.042ZM246 7v14h2.762c2.632 0 4.238-1.172 4.238-4.82v-4.492C253 8.432 251.908 7 249.403 7H246Zm7.796 38c-.386-1.131-.643-1.822-.643-5.405V32.68c0-4.085-1.416-5.594-4.633-5.594h-2.444V45H239V1h10.678c7.333 0 10.485 3.332 10.485 10.12v3.457c0 4.527-1.48 7.481-4.63 8.927 3.538 1.445 4.695 4.776 4.695 9.365v6.788c0 2.138.064 3.71.772 5.343h-7.204ZM287 28.594v5.844c0 7.04-3.586 11.062-10.501 11.062-6.915 0-10.499-4.022-10.499-11.062V11.561C266 4.523 269.584.5 276.499.5 283.414.5 287 4.523 287 11.561v4.274h-6.658v-4.713c0-3.143-1.41-4.337-3.65-4.337-2.241 0-3.65 1.194-3.65 4.337v23.756c0 3.143 1.409 4.274 3.65 4.274 2.24 0 3.65-1.131 3.65-4.274v-6.284H287ZM299.968 19.543h9.562v6.286h-9.562v12.885H312V45h-19V1h19v6.286h-12.032z"/>
                            <path fill="#FFF"
                                  d="M0 1h44v44H0z"/>
                            <path d="M39.398 1H44v44H0V1h19.105l-6.27 12.31c1.277 2.255 3.756 4.54 6.993 6.189 3.237 1.649 6.544 2.31 9.12 2.017L39.398 1ZM10.756 20.556l.806 15.644 12.882-8.533c-2.189.253-4.997-.32-7.747-1.75-2.75-1.429-4.855-3.405-5.941-5.361Z"
                                  fill="#17B7FF"/>
                        </g>
                    </svg>
                </Flex>
                <Flex flexDirection="column"
                      className={styles.contentTypesContainer}>
                    <Form>
                        <Heading>Choose where you want your Memsource app installed.</Heading>
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
                    The plugin will create a JSON object called "Memsource" for each of the selected content types.
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
