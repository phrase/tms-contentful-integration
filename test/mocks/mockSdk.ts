const mockSdk: any = {
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
            getValue: jest.fn(),
        }
    },
    locales: {
        available: ['en-US'],
        default: 'en-US',
        names: {'en-US': 'English (United States)'},
    },
};

export {mockSdk};
