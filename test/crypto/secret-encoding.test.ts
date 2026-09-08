import { describe, test, expect } from 'vitest';

import {
  blindMessage,
  blindMessageFromSecret,
  createRandomRawBlindedMessage,
  hashToCurve,
  verifyOutputConsistency,
} from '../../src';

/**
 * NUT-00 secret-encoding conformance.
 *
 * The Proof secret is a string; hash_to_curve consumes the UTF-8 bytes of that string. The vectors
 * below are cross-implementation canonical values (cdk `crates/cashu/src/dhke.rs`, nutshell
 * `tests/test_crypto.py`, nucula `main/crypto_test.c`, cashu-core-lite `tests/cross_vectors.rs`).
 */
describe('NUT-00 secret encoding', () => {
  test('hash_to_curve primitive vectors (byte inputs, aligned with cdk/nutshell/nucula unit tests)', () => {
    const vectors: Array<[string, string]> = [
      [
        '0000000000000000000000000000000000000000000000000000000000000000',
        '024cce997d3b518f739663b757deaec95bcd9473c30a14ac2fd04023a739d1a725',
      ],
      [
        '0000000000000000000000000000000000000000000000000000000000000001',
        '022e7158e11c9506f1aa4248bf531298daa7febd6194f003edcd9b93ade6253acf',
      ],
      [
        // exercises counter > 0 (documented in cdk's unit test)
        '0000000000000000000000000000000000000000000000000000000000000002',
        '026cdbe15362df59cd1dd3c9c11de8aedac2106eca69236ecd9fbe117af897be4f',
      ],
    ];
    for (const [inputHex, expectedY] of vectors) {
      expect(hashToCurve(hexToBytes(inputHex)).toHex(true)).toBe(expectedY);
    }
  });

  test('secret-string vectors: hash_to_curve consumes utf8(string), not hex-decoded bytes', () => {
    const vectors: Array<[string, string]> = [
      ['test-secret-01', '0279110ffdbbaccf1f96e0641dd8794fb206e8f95eb52c0fa001487b070cb5f7b1'],
      ['a', '029794c59a5d9b910a18e50e10623c864b77c7edf4552f8652b0c85d30ac0498f0'],
      [
        'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        '0244d4bdec44e84725e2b6d9d7a2896df8bc27b482e84e0cb2144272d318375bc3',
      ],
    ];
    for (const [secret, expectedY] of vectors) {
      expect(hashToCurve(new TextEncoder().encode(secret)).toHex(true)).toBe(expectedY);
    }
  });

  test('NEGATIVE trap vector: hashing the hex-decoded entropy produces a different (wrong) point', () => {
    const secret = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const correct = hashToCurve(new TextEncoder().encode(secret)).toHex(true);
    const trap = hashToCurve(hexToBytes(secret)).toHex(true);
    // canonical values for both derivations
    expect(correct).toBe('0244d4bdec44e84725e2b6d9d7a2896df8bc27b482e84e0cb2144272d318375bc3');
    expect(trap).toBe('02a265a770fac13ca9467f4b53e2429dbf37a22d9e6bf0c550682dc49952805640');
    expect(trap).not.toBe(correct);
  });

  test('blindMessageFromSecret equals blindMessage over the utf8 encoding of the string', () => {
    const secret = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const r = 1234567890123456789012345678901234567890123456789012345678901234n;
    const fromString = blindMessageFromSecret(secret, r);
    const fromBytes = blindMessage(new TextEncoder().encode(secret), r);
    expect(fromString.B_.toHex(true)).toBe(fromBytes.B_.toHex(true));
    expect(Buffer.from(fromString.secret).toString('utf8')).toBe(secret);
  });

  test('verifyOutputConsistency accepts the string-first path and rejects the entropy-bytes trap', () => {
    const secret = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const entropy = hexToBytes(secret);
    const good = blindMessageFromSecret(secret);
    const bad = blindMessage(entropy); // the trap: blinded the raw entropy
    expect(verifyOutputConsistency(good.B_, good.r, secret)).toBe(true);
    expect(verifyOutputConsistency(bad.B_, bad.r, secret)).toBe(false);
  });

  test('createRandomRawBlindedMessage outputs are consistent with their published secret', () => {
    // the sanctioned random path must always pass the guard
    for (let i = 0; i < 5; i++) {
      const out = createRandomRawBlindedMessage();
      const secret = Buffer.from(out.secret).toString('utf8');
      expect(verifyOutputConsistency(out.B_, out.r, secret)).toBe(true);
    }
  });
});

function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}
