export interface ISigner {
  /**
   * Signs the provided message and returns a hex-encoded signature.
   */
  sign(message: string): Promise<string>;
}
