import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the React documentation link', () => {
  render(<App />);
  const linkElement = screen.getByRole('link', { name: /yo/i });
  expect(linkElement).toHaveAttribute('href', 'https://reactjs.org');
});
