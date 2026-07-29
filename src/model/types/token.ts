// NUT #00: Tokens can be serialized to send them between users `Alice` and `Carol`. Serialized tokens have a Cashu token prefix, a versioning flag, and the token. Optionally, a URI prefix for making tokens clickable on the web.
// NUT #00: `cashu` is the Cashu token prefix. `[version]` is a single `base64_urlsafe` character to denote the token format version.

import { type Amount } from '../Amount';

import { type Proof } from './proof';

/**
 * A normalized Cashu token.
 *
 * @remarks
 * Used for decoded v3 and v4 token payloads in the public API.
 */
// NUT #00: `mint` is the mint URL. The mint URL must be stripped of any trailing slashes (`/`). `Proofs` is an array of `Proof` objects. The next two elements are only for displaying the receiving user appropriate information: `unit` is the currency unit of the token keysets (see [Keysets][01] for supported units), and `memo` is an optional text memo from the sender.
export type Token = {
  /**
   * The mints URL.
   */
  mint: string;
  /**
   * A list of proofs.
   */
  proofs: Proof[];
  /**
   * A message to send along with the token.
   */
  memo?: string;
  /**
   * The unit of the token.
   */
  unit?: string;
};

/**
 * A Cashu v3 token.
 */
// NUT #00: V3 tokens are base64-encoded JSON objects. The token format supports tokens from multiple mints. The JSON is serialized with a `base64_urlsafe` (base64 encoding with `/` replaced by `_` and `+` by `-`). `base64_urlsafe` strings may have padding characters (usually `=`) at the end which can be omitted. Clients need to be able to decode both cases.
export type DeprecatedToken = {
  /**
   * Token entries.
   */
  token: TokenEntry[];
  /**
   * A message to send along with the token.
   */
  memo?: string;
  /**
   * The unit of the token.
   */
  unit?: string;
};

/**
 * TokenEntry that stores proofs and mints for v3 token.
 */
export type TokenEntry = {
  /**
   * A list of proofs.
   */
  proofs: Proof[];
  /**
   * The mints URL.
   */
  mint: string;
};

/**
 * Metadata for a Cashu token.
 */
export type TokenMetadata = {
  /**
   * The unit of the token.
   */
  unit: string;
  /**
   * The memo of the token.
   */
  memo?: string;
  /**
   * The mint of the token.
   */
  mint: string;
  /**
   * The amount of the token.
   */
  amount: Amount;
  /**
   * The incomplete proofs of the token.
   */
  incompleteProofs: Array<Omit<Proof, 'id'>>;
};
