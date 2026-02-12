declare module '@mono.co/connect.js' {
  interface ConnectConfig {
    key: string;
    onSuccess: (response: { code: string }) => void;
    onClose?: () => void;
    onLoad?: () => void;
    scope?: string;
    data?: {
      customer?: {
        id?: string;
        name?: string;
        email?: string;
        identity?: {
          type: string;
          number: string;
        };
      };
    };
  }

  class Connect {
    constructor(config: ConnectConfig);
    setup(): void;
    open(): void;
    close(): void;
  }

  export default Connect;
}
