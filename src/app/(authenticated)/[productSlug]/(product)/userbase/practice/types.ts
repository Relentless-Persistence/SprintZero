export enum ChatRole {
    System = `system`,
    User = `user`,
    Assistant = `assistant`
}

export interface Message {
    role: ChatRole;
    content: string;
}

export type ChatConversation = Message[];