export class MultiMessageTemplate {
    messages: MessageContent[];
    name: string;
    key:string;
}
export class MessageContent {
    messageContent: string;
    next: string;
    key:string;
}