import React from 'react';
import ConfigScreen from './ConfigScreen';
import {render} from '@testing-library/react';
import {mockCma, mockSdk} from '../../test/mocks';
import {act} from "react-dom/test-utils";

jest.mock('@contentful/react-apps-toolkit', () => ({
    useSDK: () => mockSdk,
    useCMA: () => mockCma,
}));

describe('Config Screen component', () => {
    it('Component text exists', async () => {
        const {getByText} = render(<ConfigScreen/>);

        await act(async () => {
            await mockSdk.app.onConfigure.mock.calls[0][0]();
        })

        expect(getByText('Choose where you want your Phrase TMS app installed.')).toBeInTheDocument();

        expect(getByText('Content types')).toBeInTheDocument();

    });
});
