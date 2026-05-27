'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';
import { NewMessageDialog } from './new-message-dialog';

interface ProfileSendMessageButtonProps {
  peerId: string;
  peerHandle: string;
  peerDisplayName: string;
  peerIsVerified: boolean;
  peerByline?: string | null;
}

export function ProfileSendMessageButton({ peerId, peerHandle: _peerHandle, peerDisplayName, peerIsVerified, peerByline }: ProfileSendMessageButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Send message
      </Button>
      {open && (
        <NewMessageDialog
          initialPeer={{ id: peerId, displayName: peerDisplayName, isVerified: peerIsVerified, byline: peerByline ?? null }}
          onClose={() => setOpen(false)}
          onSent={(conversationId) => {
            setOpen(false);
            window.location.href = `/community?dm=${encodeURIComponent(conversationId)}`;
          }}
        />
      )}
    </>
  );
}
