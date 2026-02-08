//types and interfaces

export interface SocketData {
  userId: string;
}

export interface IReturnMessage {
  message?: string;
}

export type ReturnDataType<T> = {
  message?: string;
  data: T;
  total?: number;
};
