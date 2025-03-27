/**
 * Base62 encoding utility for URL shortening
 * Uses characters [0-9a-zA-Z] (62 characters) to create short, unique slugs
 */
export class Base62Util {
  private static readonly CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly BASE = Base62Util.CHARACTERS.length;

  /**
   * Encodes a number to a Base62 string
   * @param num - The number to encode
   * @returns The Base62 encoded string
   */
  public static encode(num: number): string {
    if (num === 0) {
      return Base62Util.CHARACTERS[0];
    }

    let encoded = '';
    let n = Math.abs(num);

    while (n > 0) {
      encoded = Base62Util.CHARACTERS[n % Base62Util.BASE] + encoded;
      n = Math.floor(n / Base62Util.BASE);
    }

    return encoded;
  }

  /**
   * Decodes a Base62 string to a number
   * @param str - The Base62 string to decode
   * @returns The decoded number
   */
  public static decode(str: string): number {
    let decoded = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = Base62Util.CHARACTERS.indexOf(char);
      
      if (index === -1) {
        throw new Error(`Invalid Base62 character: ${char}`);
      }
      
      decoded = decoded * Base62Util.BASE + index;
    }

    return decoded;
  }

  /**
   * Generates a random Base62 string of the specified length
   * @param length - The length of the string to generate
   * @returns A random Base62 string
   */
  public static generateRandom(length: number): string {
    let result = '';
    const charactersLength = Base62Util.CHARACTERS.length;
    
    for (let i = 0; i < length; i++) {
      result += Base62Util.CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }
}
