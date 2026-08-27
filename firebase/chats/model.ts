export interface ChatModel {
    _id: string;
    userId: string;
    roomId: string;
    timestamp: number;
    messages: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: number;
    };
}