import { create } from "zustand";

export interface ChatMessage {
  _id: string;
  content: string;
  taskGroup?: string;
  sender: { _id: string; name: string; email: string; avatar?: string };
  attachments: { name: string; url: string; type: string; size: number }[];
  reactions: { emoji: string; users: string[] }[];
  readBy: { user: string; readAt: string }[];
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  typingUsers: string[];
  activeGroupId: string | null;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (message: ChatMessage) => void;
  setTypingUsers: (users: string[]) => void;
  addTypingUser: (user: string) => void;
  removeTypingUser: (user: string) => void;
  setActiveGroupId: (id: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  typingUsers: [],
  activeGroupId: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m._id === message._id)) return state;
      return { messages: [...state.messages, message] };
    }),
  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === message._id ? message : m
      ),
    })),
  setTypingUsers: (users) => set({ typingUsers: users }),
  addTypingUser: (user) =>
    set((state) => ({
      typingUsers: state.typingUsers.includes(user)
        ? state.typingUsers
        : [...state.typingUsers, user],
    })),
  removeTypingUser: (user) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u !== user),
    })),
  setActiveGroupId: (id) => set({ activeGroupId: id }),
  clearChat: () => set({ messages: [], typingUsers: [] }),
}));
