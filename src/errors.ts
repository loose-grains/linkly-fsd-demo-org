/**
 * An error that carries an HTTP status code. Handlers throw these; the router's
 * top-level catch turns them into JSON error responses.
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const badRequest = (message: string): HttpError =>
  new HttpError(400, message);

export const notFound = (message: string): HttpError =>
  new HttpError(404, message);

export const conflict = (message: string): HttpError =>
  new HttpError(409, message);
