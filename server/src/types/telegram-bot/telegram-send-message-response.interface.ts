export interface ITelegramSendMessageResponse {
  ok: boolean;
  result: {
    message_id: number;
    sender_chat: {
      id: number;
      title: string;
      type: string;
    };
    chat: {
      id: number;
      title: string;
      type: string;
    };
    date: number;
    text: string;
  };
}
