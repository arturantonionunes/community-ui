'use client';
import { useState } from 'react';
import { Button } from '../primitives/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../primitives/alert-dialog';

export function BlockButton({ blockedId }: { blockedId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    const res = await fetch('/api/community/dm/blocks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedId }),
    });
    setPending(false);
    if (res.ok) {
      // The block_applied event will hide the conversation; navigation handled in shell.
      window.history.back();
    } else {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="xs" className="text-destructive">
          Block
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this user?</AlertDialogTitle>
          <AlertDialogDescription>
            They will no longer be able to message you and existing conversations will be hidden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending ? 'Blocking…' : 'Block'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
