'use client';
import { MessageList, type ChatMessage } from './message-list';
import { MessageComposer } from './message-composer';

export interface RoomViewProps {
  roomName: string;
  canPost: boolean;
  postRestrictionReason?: string;
  messages: ChatMessage[];
  error: string | null;
  onSend: (body: string, attachmentIds: string[]) => Promise<boolean>;
}

export function RoomView({ roomName, canPost, postRestrictionReason, messages, error, onSend }: RoomViewProps) {
  return (
    <>
      <div className="border-b px-4 py-2 font-bold">{roomName}</div>
      <MessageList messages={messages} />
      {error && <div className="px-4 py-1 text-xs text-destructive">{error}</div>}
      <MessageComposer canPost={canPost} reason={postRestrictionReason} onSend={onSend} />
    </>
  );
}
