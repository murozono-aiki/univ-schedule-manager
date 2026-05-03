import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '../pages/Home';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

expect.extend(toHaveNoViolations);

// Mock getEvents since we are testing accessibility of the rendered page
vi.mock('../services/calendarApi', () => ({
  getOrCreateCalendar: vi.fn().mockResolvedValue('fake-cal-id'),
  getEvents: vi.fn().mockResolvedValue([]),
  createClassEvent: vi.fn(),
}));

describe('Accessibility - Home Page', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <GoogleOAuthProvider clientId="fake-client-id">
        <MemoryRouter>
          <AuthProvider>
            <Home />
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
