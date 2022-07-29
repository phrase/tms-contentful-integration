import React from 'react';
import Sidebar from './Sidebar';
import { render } from '@testing-library/react';
import { mockCma, mockSdk } from '../../test/mocks';

jest.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

describe('Sidebar component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<Sidebar />);

    expect(getByText('Memsource')).toBeInTheDocument();
    expect(getByText('Please select into which languages this content needs to be localized.')).toBeInTheDocument();
    expect(getByText('Submit')).toBeInTheDocument();
  });
});
