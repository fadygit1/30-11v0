import { createHash } from 'crypto';
import * as secp256k1 from 'secp256k1';
import { Buffer } from 'buffer';

export class CryptoUtils {
  private static readonly BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  static generatePrivateKey(): Buffer {
    let privKey: Buffer;
    do {
      privKey = Buffer.from(Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)));
    } while (!secp256k1.privateKeyVerify(privKey));
    return privKey;
  }

  static privateKeyToPublicKey(privateKey: Buffer, compressed: boolean = true): Buffer {
    const pubKey = secp256k1.publicKeyCreate(privateKey, compressed);
    return Buffer.from(pubKey);
  }

  static publicKeyToAddress(publicKey: Buffer): string {
    // SHA256
    const sha256Hash = createHash('sha256').update(publicKey).digest();
    
    // RIPEMD160
    const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();
    
    // Add version byte (0x00 for mainnet)
    const versionedHash = Buffer.concat([Buffer.from([0x00]), ripemd160Hash]);
    
    // Double SHA256 for checksum
    const checksum = createHash('sha256')
      .update(
        createHash('sha256').update(versionedHash).digest()
      )
      .digest()
      .slice(0, 4);
    
    // Combine versioned hash and checksum
    const binaryAddress = Buffer.concat([versionedHash, checksum]);
    
    // Convert to base58
    return CryptoUtils.base58Encode(binaryAddress);
  }

  static base58Encode(buffer: Buffer): string {
    const digits = [0];
    
    for (let i = 0; i < buffer.length; i++) {
      let carry = buffer[i];
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry > 0) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }

    let result = '';
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      result += '1';
    }
    for (let i = digits.length - 1; i >= 0; i--) {
      result += this.BASE58_CHARS[digits[i]];
    }

    return result;
  }

  static isValidPrivateKey(key: string): boolean {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      return keyBuffer.length === 32 && secp256k1.privateKeyVerify(keyBuffer);
    } catch {
      return false;
    }
  }

  static isValidAddress(address: string): boolean {
    try {
      if (address.length < 26 || address.length > 35) return false;
      
      const decoded = this.base58Decode(address);
      if (decoded.length !== 25) return false;
      
      const versionedHash = decoded.slice(0, 21);
      const checksum = decoded.slice(21);
      
      const calculatedChecksum = createHash('sha256')
        .update(
          createHash('sha256').update(versionedHash).digest()
        )
        .digest()
        .slice(0, 4);
      
      return Buffer.compare(checksum, calculatedChecksum) === 0;
    } catch {
      return false;
    }
  }

  private static base58Decode(str: string): Buffer {
    const bytes = str.split('').map(char => {
      const index = this.BASE58_CHARS.indexOf(char);
      if (index === -1) throw new Error('Invalid base58 character');
      return index;
    });

    const result = new Uint8Array(str.length * 2);
    let length = 0;

    for (const byte of bytes) {
      let carry = byte;
      for (let j = 0; j < length; j++) {
        carry += result[j] * 58;
        result[j] = carry & 0xff;
        carry >>= 8;
      }
      while (carry > 0) {
        result[length++] = carry & 0xff;
        carry >>= 8;
      }
    }

    // Count leading zeros in input string
    const leadingZeros = str.match(/^1*/)?.[0].length || 0;
    const finalResult = new Uint8Array(leadingZeros + length);
    finalResult.set(result.slice(0, length).reverse(), leadingZeros);
    
    return Buffer.from(finalResult);
  }
}

