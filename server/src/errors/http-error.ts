/** An error that maps to a specific HTTP response. Anything else thrown becomes a 500. */
export class HttpError extends Error {
  readonly status: number
  readonly details?: string[]

  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.details = details
  }
}
