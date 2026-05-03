import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScheduleGrid from './ScheduleGrid';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token', isAuthenticated: true }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

describe('ScheduleGrid', () => {
  it('renders the grid with days', () => {
    render(
      <MemoryRouter>
        <ScheduleGrid />
      </MemoryRouter>
    );
    expect(screen.getByText(/Add Class/i)).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });
});
