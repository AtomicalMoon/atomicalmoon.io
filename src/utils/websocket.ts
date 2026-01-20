// TypeScript WebSocket Client
type MessageHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: number | null = null;
  private messageQueue: Array<{ type: string; data: any }> = [];
  private handlers: Map<string, MessageHandler[]> = new Map();

  constructor(url: string = 'ws://localhost:3001/ws') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          // flush queued messages
          while (this.messageQueue.length && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = this.messageQueue.shift()!;
            this.ws.send(JSON.stringify(msg));
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const base = 1000;
    const delay = Math.min(base * Math.pow(2, this.reconnectAttempts), 30000);
    const jitter = Math.floor(Math.random() * 300);
    const total = delay + jitter;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, total);
  }

  send(type: string, data: any): void {
    const payload = { type, data };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      // Buffer messages until connected
      this.messageQueue.push(payload);
      console.warn('WebSocket is not connected — message queued');
      // Ensure we attempt reconnect if not already
      if (!this.ws) this.connect().catch(() => {});
    }
  }

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleMessage(data: any): void {
    const handlers = this.handlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }

    // Also call 'message' handlers for all messages
    const messageHandlers = this.handlers.get('message');
    if (messageHandlers) {
      messageHandlers.forEach(handler => handler(data));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketClient();
