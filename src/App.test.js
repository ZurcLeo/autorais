// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
}));

test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
