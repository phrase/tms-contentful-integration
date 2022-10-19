let mockSdk: any = {
    app: {
        onConfigure: jest.fn(),
        getParameters: jest.fn().mockReturnValueOnce({}),
        setReady: jest.fn(),
        getCurrentState: jest.fn(),
    },
    ids: {
        app: 'test-app'
    },
    entry: {
        fields: {
            phrase: {
                getValue: () => ({
                    languageData: []
                }),
                setValue: jest.fn(),
            }
        }
    },
    locales: {
        available: ['fr', 'de', 'it', 'cs'],
        default: 'en-US',
        names: {'fr': 'French', 'de': 'German', 'it': 'Italian', 'cs': 'Czech'},
    }
};

export {mockSdk};
