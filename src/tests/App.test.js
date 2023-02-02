import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../components/Main/App';

test('Renders correctly', () => {
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
})

