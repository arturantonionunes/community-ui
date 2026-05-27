import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PitchCard } from './pitch-card';
import type { PitchSummary } from '../types';

describe('PitchCard', () => {
  it('renders title, summary, owner handle, and a tag chip', () => {
    const pitch: PitchSummary = {
      id: 'p1',
      title: 'Climate beat: 2026 fires',
      summary: 'Investigation into the season opening.',
      status: 'open',
      ownerId: 'u1',
      ownerHandle: 'sara-l',
      ownerDisplayName: 'Sara L.',
      ownerIsVerified: true,
      tags: [{ slug: 'climate', label: 'Climate' }],
      claimCount: 2,
      createdAt: new Date().toISOString(),
      deadlineAt: null,
      publishedUrl: null,
    } as unknown as PitchSummary;
    render(<PitchCard pitch={pitch} />);
    expect(screen.getByText(/Climate beat/)).toBeInTheDocument();
    expect(screen.getByText(/Investigation into/)).toBeInTheDocument();
    expect(screen.getByText(/@sara-l/)).toBeInTheDocument();
  });
});
