declare module "roslib" {
  export class Ros {
    constructor(options?: { url?: string });
    connect(url: string): void;
    close(): void;
    on(eventName: "connection" | "error" | "close", callback: (data?: any) => void): void;
  }

  export class Topic {
    constructor(options: {
      ros: Ros;
      name: string;
      messageType: string;
      queue_size?: number;
      latch?: boolean;
    });

    publish(message: Message): void;
    subscribe(callback: (message: Message) => void): void;
    unsubscribe(): void;
  }

  export class Message {
    constructor(values?: { [key: string]: any });
  }

  export interface Message {
    [key: string]: any;
  }

   export class Service {
    constructor(options: {
      ros: Ros;
      name: string;
      serviceType: string;
    });
    callService(
      request: ServiceRequest,
      callback: (response: any) => void
    ): void;
  }

  export class ServiceRequest {
    constructor(values: any);
  }
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

