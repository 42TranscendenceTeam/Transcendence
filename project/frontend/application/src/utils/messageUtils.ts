import type { Message } from '../types';

export interface MessageGroup {
  sender: Message['sender'];
  messages: Message[];
  isOwn: boolean;
}

export function groupConsecutiveMessages(
  messages: Message[],
  currentUserId: number | undefined
): MessageGroup[] {
  const groups: MessageGroup[] = [];

  if (!messages || messages.length === 0) {
    return groups;
  }

  messages.forEach((msg) => {
    const isOwn = Number(msg.sender.id) === Number(currentUserId);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.sender.id === msg.sender.id) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({
        sender: msg.sender,
        messages: [msg],
        isOwn,
      });
    }
  });

  return groups;
}