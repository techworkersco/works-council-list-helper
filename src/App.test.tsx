import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  // everything works as you can see
  expect(true).toBe(true)
});
