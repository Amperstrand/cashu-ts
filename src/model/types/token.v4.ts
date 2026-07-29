// NUT #00: V4 tokens are a space-efficient way of serializing tokens using the CBOR binary format. All keys are single characters and hex strings are encoded in binary. V4 tokens can only hold proofs from a single mint.
// NUT #00: Optional fields MAY be omitted if not present. Receivers MUST ignore unknown fields to preserve forward compatibility.
// NUT #00: Unless otherwise stated, fields of type `bytes` represent byte strings in the CBOR encoding. In the original JSON representation of `Proof` objects, these values are encoded as hexadecimal strings. Implementations MUST convert between hex strings and raw byte arrays when translating between JSON and CBOR representations.

export type V4DLEQTemplate = {
  /**
   * Challenge.
   */
  e: Uint8Array;
  /**
   * Response.
   */
  s: Uint8Array;
  /**
   * Blinding factor.
   */
  r: Uint8Array;
};

/**
 * Template for a Proof inside a V4 Token.
 */
// NUT #00: Within the `t` (token) array, `i` denotes the keyset ID associated with the proofs contained in `p` which are grouped by `i`. `p` is an array of `Proof` objects with the original keyset ID field `id` omitted. All proofs in the corresponding `p` array MUST belong to the same keyset ID.
export type V4ProofTemplate = {
  /**
   * Amount.
   */
  a: number | bigint;
  /**
   * Secret.
   */
  s: string;
  /**
   * Signature.
   */
  c: Uint8Array;
  /**
   * DLEQ.
   */
  d?: V4DLEQTemplate;
  /**
   * P2BK E.
   */
  pe?: Uint8Array;
  /**
   * Witness.
   */
  w?: string;
};

/**
 * TokenEntry in a V4 Token.
 */
export type V4InnerToken = {
  /**
   * ID.
   */
  i: Uint8Array;
  /**
   * Proofs.
   */
  p: V4ProofTemplate[];
};

/**
 * Template for a V4 Token.
 */
// NUT #00: `m` is the mint URL. The mint URL **MUST** be normalized by stripping any trailing slashes (`/`). `u` is the currency unit of the token keysets. Supported units are defined in [Keysets][01]. `d` is an optional, human-readable memo provided by the sender.
// NUT #00: To reduce the size of the `i` field and the overall Token encoding, wallets **MAY** use the short keyset ID representation (`s_id`).
// NUT #00: The short keyset ID is defined as the first 8 bytes of the full 33-byte keyset ID:
// NUT #00: Wallets receiving a Token **MUST** support both short and full keyset ID representations. When a short keyset ID is encountered, the wallet **MUST** resolve it to the corresponding full keyset ID before processing the contained `Proof` objects.
export type TokenV4Template = {
  /**
   * TokenEntries.
   */
  t: V4InnerToken[];
  /**
   * Memo.
   */
  d: string;
  /**
   * Mint Url.
   */
  m: string;
  /**
   * Unit.
   */
  u: string;
};
