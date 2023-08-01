function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function assertNumber(n) {
  if (!Number.isSafeInteger(n)) throw new Error(`Wrong integer: ${n}`);
}
function chain(...args) {
  const wrap = (a, b) => c => a(b(c));
  const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
  const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
  return {
    encode,
    decode
  };
}
function alphabet(alphabet) {
  return {
    encode: digits => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('alphabet.encode input should be an array of numbers');
      return digits.map(i => {
        assertNumber(i);
        if (i < 0 || i >= alphabet.length) throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`);
        return alphabet[i];
      });
    },
    decode: input => {
      if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('alphabet.decode input should be array of strings');
      return input.map(letter => {
        if (typeof letter !== 'string') throw new Error(`alphabet.decode: not string element=${letter}`);
        const index = alphabet.indexOf(letter);
        if (index === -1) throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`);
        return index;
      });
    }
  };
}
function join(separator = '') {
  if (typeof separator !== 'string') throw new Error('join separator should be string');
  return {
    encode: from => {
      if (!Array.isArray(from) || from.length && typeof from[0] !== 'string') throw new Error('join.encode input should be array of strings');
      for (let i of from) if (typeof i !== 'string') throw new Error(`join.encode: non-string input=${i}`);
      return from.join(separator);
    },
    decode: to => {
      if (typeof to !== 'string') throw new Error('join.decode input should be string');
      return to.split(separator);
    }
  };
}
function padding(bits, chr = '=') {
  assertNumber(bits);
  if (typeof chr !== 'string') throw new Error('padding chr should be string');
  return {
    encode(data) {
      if (!Array.isArray(data) || data.length && typeof data[0] !== 'string') throw new Error('padding.encode input should be array of strings');
      for (let i of data) if (typeof i !== 'string') throw new Error(`padding.encode: non-string input=${i}`);
      while (data.length * bits % 8) data.push(chr);
      return data;
    },
    decode(input) {
      if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('padding.encode input should be array of strings');
      for (let i of input) if (typeof i !== 'string') throw new Error(`padding.decode: non-string input=${i}`);
      let end = input.length;
      if (end * bits % 8) throw new Error('Invalid padding: string should have whole number of bytes');
      for (; end > 0 && input[end - 1] === chr; end--) {
        if (!((end - 1) * bits % 8)) throw new Error('Invalid padding: string has too much padding');
      }
      return input.slice(0, end);
    }
  };
}
function normalize(fn) {
  if (typeof fn !== 'function') throw new Error('normalize fn should be function');
  return {
    encode: from => from,
    decode: to => fn(to)
  };
}
function convertRadix(data, from, to) {
  if (from < 2) throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
  if (to < 2) throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
  if (!Array.isArray(data)) throw new Error('convertRadix: data should be array');
  if (!data.length) return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data);
  digits.forEach(d => {
    assertNumber(d);
    if (d < 0 || d >= from) throw new Error(`Wrong integer: ${d}`);
  });
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < digits.length; i++) {
      const digit = digits[i];
      const digitBase = from * carry + digit;
      if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
        throw new Error('convertRadix: carry overflow');
      }
      carry = digitBase % to;
      digits[i] = Math.floor(digitBase / to);
      if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase) throw new Error('convertRadix: carry overflow');
      if (!done) continue;else if (!digits[i]) pos = i;else done = false;
    }
    res.push(carry);
    if (done) break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);
  return res.reverse();
}
const gcd = (a, b) => !b ? a : gcd(b, a % b);
const radix2carry = (from, to) => from + (to - gcd(from, to));
function convertRadix2(data, from, to, padding) {
  if (!Array.isArray(data)) throw new Error('convertRadix2: data should be array');
  if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`);
  if (radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const mask = 2 ** to - 1;
  const res = [];
  for (const n of data) {
    assertNumber(n);
    if (n >= 2 ** from) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (; pos >= to; pos -= to) res.push((carry >> pos - to & mask) >>> 0);
    carry &= 2 ** pos - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding && pos >= from) throw new Error('Excess padding');
  if (!padding && carry) throw new Error(`Non-zero padding: ${carry}`);
  if (padding && pos > 0) res.push(carry >>> 0);
  return res;
}
function radix(num) {
  assertNumber(num);
  return {
    encode: bytes => {
      if (!(bytes instanceof Uint8Array)) throw new Error('radix.encode input should be Uint8Array');
      return convertRadix(Array.from(bytes), 2 ** 8, num);
    },
    decode: digits => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix.decode input should be array of strings');
      return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
    }
  };
}
function radix2(bits, revPadding = false) {
  assertNumber(bits);
  if (bits <= 0 || bits > 32) throw new Error('radix2: bits should be in (0..32]');
  if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32) throw new Error('radix2: carry overflow');
  return {
    encode: bytes => {
      if (!(bytes instanceof Uint8Array)) throw new Error('radix2.encode input should be Uint8Array');
      return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
    },
    decode: digits => {
      if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix2.decode input should be array of strings');
      return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
    }
  };
}
function unsafeWrapper(fn) {
  if (typeof fn !== 'function') throw new Error('unsafeWrapper fn should be function');
  return function (...args) {
    try {
      return fn.apply(null, args);
    } catch (e) {}
  };
}
const base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''));
const base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''));
chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''));
chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize(s => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')));
const base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''));
const base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''));
const genBase58 = abc => chain(radix(58), alphabet(abc), join(''));
const base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');
genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');
const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
const base58xmr = {
  encode(data) {
    let res = '';
    for (let i = 0; i < data.length; i += 8) {
      const block = data.subarray(i, i + 8);
      res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1');
    }
    return res;
  },
  decode(str) {
    let res = [];
    for (let i = 0; i < str.length; i += 11) {
      const slice = str.slice(i, i + 11);
      const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
      const block = base58.decode(slice);
      for (let j = 0; j < block.length - blockLen; j++) {
        if (block[j] !== 0) throw new Error('base58xmr: wrong padding');
      }
      res = res.concat(Array.from(block.slice(block.length - blockLen)));
    }
    return Uint8Array.from(res);
  }
};
const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''));
const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
function bech32Polymod(pre) {
  const b = pre >> 25;
  let chk = (pre & 0x1ffffff) << 5;
  for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
    if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
  }
  return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
  const len = prefix.length;
  let chk = 1;
  for (let i = 0; i < len; i++) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
    chk = bech32Polymod(chk) ^ c >> 5;
  }
  chk = bech32Polymod(chk);
  for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 0x1f;
  for (let v of words) chk = bech32Polymod(chk) ^ v;
  for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);
  chk ^= encodingConst;
  return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
}
function genBech32(encoding) {
  const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
  const _words = radix2(5);
  const fromWords = _words.decode;
  const toWords = _words.encode;
  const fromWordsUnsafe = unsafeWrapper(fromWords);
  function encode(prefix, words, limit = 90) {
    if (typeof prefix !== 'string') throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
    if (!Array.isArray(words) || words.length && typeof words[0] !== 'number') throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
    const actualLength = prefix.length + 7 + words.length;
    if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
    prefix = prefix.toLowerCase();
    return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
  }
  function decode(str, limit = 90) {
    if (typeof str !== 'string') throw new Error(`bech32.decode input should be string, not ${typeof str}`);
    if (str.length < 8 || limit !== false && str.length > limit) throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
    const lowered = str.toLowerCase();
    if (str !== lowered && str !== str.toUpperCase()) throw new Error(`String must be lowercase or uppercase`);
    str = lowered;
    const sepIndex = str.lastIndexOf('1');
    if (sepIndex === 0 || sepIndex === -1) throw new Error(`Letter "1" must be present between prefix and data only`);
    const prefix = str.slice(0, sepIndex);
    const _words = str.slice(sepIndex + 1);
    if (_words.length < 6) throw new Error('Data must be at least 6 characters long');
    const words = BECH_ALPHABET.decode(_words).slice(0, -6);
    const sum = bechChecksum(prefix, words, ENCODING_CONST);
    if (!_words.endsWith(sum)) throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
    return {
      prefix,
      words
    };
  }
  const decodeUnsafe = unsafeWrapper(decode);
  function decodeToBytes(str) {
    const {
      prefix,
      words
    } = decode(str, false);
    return {
      prefix,
      words,
      bytes: fromWords(words)
    };
  }
  return {
    encode,
    decode,
    decodeToBytes,
    decodeUnsafe,
    fromWords,
    fromWordsUnsafe,
    toWords
  };
}
genBech32('bech32');
genBech32('bech32m');
const utf8 = {
  encode: data => new TextDecoder().decode(data),
  decode: str => new TextEncoder().encode(str)
};
const hex = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize(s => {
  if (typeof s !== 'string' || s.length % 2) throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
  return s.toLowerCase();
}));
const CODERS = {
  utf8,
  hex,
  base16,
  base32,
  base64,
  base64url,
  base58,
  base58xmr
};
`Invalid encoding type. Available types: ${Object.keys(CODERS).join(', ')}`;

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
function signerAccountId() {
  env.signer_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the current block timestamp.
 */
function blockTimestamp() {
  return env.block_timestamp();
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}
/**
 * Join an arbitrary array of NEAR promises.
 *
 * @param promiseIndexes - An arbitrary array of NEAR promise indexes to join.
 */
function promiseAnd(...promiseIndexes) {
  return env.promise_and(...promiseIndexes);
}
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
/**
 * Attach a callback NEAR promise to a batch of NEAR promise actions.
 *
 * @param promiseIndex - The NEAR promise index of the batch.
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchThen(promiseIndex, accountId) {
  return env.promise_batch_then(promiseIndex, accountId);
}
/**
 * Attach a create account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a create account action to.
 */
function promiseBatchActionCreateAccount(promiseIndex) {
  env.promise_batch_action_create_account(promiseIndex);
}
/**
 * Attach a deploy contract promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a deploy contract action to.
 * @param code - The WASM byte code of the contract to be deployed.
 */
function promiseBatchActionDeployContract(promiseIndex, code) {
  env.promise_batch_action_deploy_contract(promiseIndex, code);
}
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCallRaw(promiseIndex, methodName, args, amount, gas) {
  env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
  promiseBatchActionFunctionCallRaw(promiseIndex, methodName, encode(args), amount, gas);
}
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
function promiseBatchActionTransfer(promiseIndex, amount) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}
/**
 * Attach a stake promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a stake action to.
 * @param amount - The amount of NEAR to stake.
 * @param publicKey - The public key with which to stake.
 */
function promiseBatchActionStake(promiseIndex, amount, publicKey) {
  env.promise_batch_action_stake(promiseIndex, amount, publicKey);
}
/**
 * Attach a add full access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add full access key action to.
 * @param publicKey - The public key to add as a full access key.
 * @param nonce - The nonce to use.
 */
function promiseBatchActionAddKeyWithFullAccess(promiseIndex, publicKey, nonce) {
  env.promise_batch_action_add_key_with_full_access(promiseIndex, publicKey, nonce);
}
/**
 * Attach a add access key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a add access key action to.
 * @param publicKey - The public key to add.
 * @param nonce - The nonce to use.
 * @param allowance - The allowance of the access key.
 * @param receiverId - The account ID of the receiver.
 * @param methodNames - The names of the method to allow the key for.
 */
function promiseBatchActionAddKeyWithFunctionCall(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames) {
  env.promise_batch_action_add_key_with_function_call(promiseIndex, publicKey, nonce, allowance, receiverId, methodNames);
}
/**
 * Attach a delete key promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete key action to.
 * @param publicKey - The public key to delete.
 */
function promiseBatchActionDeleteKey(promiseIndex, publicKey) {
  env.promise_batch_action_delete_key(promiseIndex, publicKey);
}
/**
 * Attach a delete account promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a delete account action to.
 * @param beneficiaryId - The account ID of the beneficiary - the account that receives the remaining amount of NEAR.
 */
function promiseBatchActionDeleteAccount(promiseIndex, beneficiaryId) {
  env.promise_batch_action_delete_account(promiseIndex, beneficiaryId);
}
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
function promiseBatchActionFunctionCallWeightRaw(promiseIndex, methodName, args, amount, gas, weight) {
  env.promise_batch_action_function_call_weight(promiseIndex, methodName, args, amount, gas, weight);
}
/**
 * Attach a function call with weight promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call with weight action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 * @param weight - The weight of unused Gas to use.
 */
function promiseBatchActionFunctionCallWeight(promiseIndex, methodName, args, amount, gas, weight) {
  promiseBatchActionFunctionCallWeightRaw(promiseIndex, methodName, encode(args), amount, gas, weight);
}
/**
 * Executes the promise in the NEAR WASM virtual machine.
 *
 * @param promiseIndex - The index of the promise to execute.
 */
function promiseReturn(promiseIndex) {
  env.promise_return(promiseIndex);
}

/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

/**
 * A promise action which can be executed on the NEAR blockchain.
 */
class PromiseAction {}
/**
 * A create account promise action.
 *
 * @extends {PromiseAction}
 */
class CreateAccount extends PromiseAction {
  add(promiseIndex) {
    promiseBatchActionCreateAccount(promiseIndex);
  }
}
/**
 * A deploy contract promise action.
 *
 * @extends {PromiseAction}
 */
class DeployContract extends PromiseAction {
  /**
   * @param code - The code of the contract to be deployed.
   */
  constructor(code) {
    super();
    this.code = code;
  }
  add(promiseIndex) {
    promiseBatchActionDeployContract(promiseIndex, this.code);
  }
}
/**
 * A function call promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCall extends PromiseAction {
  /**
   * @param functionName - The name of the function to be called.
   * @param args - The utf-8 string arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   */
  constructor(functionName, args, amount, gas) {
    super();
    this.functionName = functionName;
    this.args = args;
    this.amount = amount;
    this.gas = gas;
  }
  add(promiseIndex) {
    promiseBatchActionFunctionCall(promiseIndex, this.functionName, this.args, this.amount, this.gas);
  }
}
/**
 * A function call raw promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallRaw extends PromiseAction {
  /**
   * @param functionName - The name of the function to be called.
   * @param args - The arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   */
  constructor(functionName, args, amount, gas) {
    super();
    this.functionName = functionName;
    this.args = args;
    this.amount = amount;
    this.gas = gas;
  }
  add(promiseIndex) {
    promiseBatchActionFunctionCallRaw(promiseIndex, this.functionName, this.args, this.amount, this.gas);
  }
}
/**
 * A function call weight promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallWeight extends PromiseAction {
  /**
   * @param functionName - The name of the function to be called.
   * @param args - The utf-8 string arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   * @param weight - The weight of unused Gas to use.
   */
  constructor(functionName, args, amount, gas, weight) {
    super();
    this.functionName = functionName;
    this.args = args;
    this.amount = amount;
    this.gas = gas;
    this.weight = weight;
  }
  add(promiseIndex) {
    promiseBatchActionFunctionCallWeight(promiseIndex, this.functionName, this.args, this.amount, this.gas, this.weight);
  }
}
/**
 * A function call weight raw promise action.
 *
 * @extends {PromiseAction}
 */
class FunctionCallWeightRaw extends PromiseAction {
  /**
   * @param functionName - The name of the function to be called.
   * @param args - The arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   * @param weight - The weight of unused Gas to use.
   */
  constructor(functionName, args, amount, gas, weight) {
    super();
    this.functionName = functionName;
    this.args = args;
    this.amount = amount;
    this.gas = gas;
    this.weight = weight;
  }
  add(promiseIndex) {
    promiseBatchActionFunctionCallWeightRaw(promiseIndex, this.functionName, this.args, this.amount, this.gas, this.weight);
  }
}
/**
 * A transfer promise action.
 *
 * @extends {PromiseAction}
 */
class Transfer extends PromiseAction {
  /**
   * @param amount - The amount of NEAR to tranfer.
   */
  constructor(amount) {
    super();
    this.amount = amount;
  }
  add(promiseIndex) {
    promiseBatchActionTransfer(promiseIndex, this.amount);
  }
}
/**
 * A stake promise action.
 *
 * @extends {PromiseAction}
 */
class Stake extends PromiseAction {
  /**
   * @param amount - The amount of NEAR to tranfer.
   * @param publicKey - The public key to use for staking.
   */
  constructor(amount, publicKey) {
    super();
    this.amount = amount;
    this.publicKey = publicKey;
  }
  add(promiseIndex) {
    promiseBatchActionStake(promiseIndex, this.amount, this.publicKey.data);
  }
}
/**
 * A add full access key promise action.
 *
 * @extends {PromiseAction}
 */
class AddFullAccessKey extends PromiseAction {
  /**
   * @param publicKey - The public key to add as a full access key.
   * @param nonce - The nonce to use.
   */
  constructor(publicKey, nonce) {
    super();
    this.publicKey = publicKey;
    this.nonce = nonce;
  }
  add(promiseIndex) {
    promiseBatchActionAddKeyWithFullAccess(promiseIndex, this.publicKey.data, this.nonce);
  }
}
/**
 * A add access key promise action.
 *
 * @extends {PromiseAction}
 */
class AddAccessKey extends PromiseAction {
  /**
   * @param publicKey - The public key to add as a access key.
   * @param allowance - The allowance for the key in yoctoNEAR.
   * @param receiverId - The account ID of the reciever.
   * @param functionNames - The names of funcitons to authorize.
   * @param nonce - The nonce to use.
   */
  constructor(publicKey, allowance, receiverId, functionNames, nonce) {
    super();
    this.publicKey = publicKey;
    this.allowance = allowance;
    this.receiverId = receiverId;
    this.functionNames = functionNames;
    this.nonce = nonce;
  }
  add(promiseIndex) {
    promiseBatchActionAddKeyWithFunctionCall(promiseIndex, this.publicKey.data, this.nonce, this.allowance, this.receiverId, this.functionNames);
  }
}
/**
 * A delete key promise action.
 *
 * @extends {PromiseAction}
 */
class DeleteKey extends PromiseAction {
  /**
   * @param publicKey - The public key to delete from the account.
   */
  constructor(publicKey) {
    super();
    this.publicKey = publicKey;
  }
  add(promiseIndex) {
    promiseBatchActionDeleteKey(promiseIndex, this.publicKey.data);
  }
}
/**
 * A delete account promise action.
 *
 * @extends {PromiseAction}
 */
class DeleteAccount extends PromiseAction {
  /**
   * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
   */
  constructor(beneficiaryId) {
    super();
    this.beneficiaryId = beneficiaryId;
  }
  add(promiseIndex) {
    promiseBatchActionDeleteAccount(promiseIndex, this.beneficiaryId);
  }
}
class PromiseSingle {
  constructor(accountId, actions, after, promiseIndex) {
    this.accountId = accountId;
    this.actions = actions;
    this.after = after;
    this.promiseIndex = promiseIndex;
  }
  constructRecursively() {
    if (this.promiseIndex !== null) {
      return this.promiseIndex;
    }
    const promiseIndex = this.after ? promiseBatchThen(this.after.constructRecursively(), this.accountId) : promiseBatchCreate(this.accountId);
    this.actions.forEach(action => action.add(promiseIndex));
    this.promiseIndex = promiseIndex;
    return promiseIndex;
  }
}
class PromiseJoint {
  constructor(promiseA, promiseB, promiseIndex) {
    this.promiseA = promiseA;
    this.promiseB = promiseB;
    this.promiseIndex = promiseIndex;
  }
  constructRecursively() {
    if (this.promiseIndex !== null) {
      return this.promiseIndex;
    }
    const result = promiseAnd(this.promiseA.constructRecursively(), this.promiseB.constructRecursively());
    this.promiseIndex = result;
    return result;
  }
}
/**
 * A high level class to construct and work with NEAR promises.
 */
class NearPromise {
  /**
   * @param subtype - The subtype of the promise.
   * @param shouldReturn - Whether the promise should return.
   */
  constructor(subtype, shouldReturn) {
    this.subtype = subtype;
    this.shouldReturn = shouldReturn;
  }
  /**
   * Creates a new promise to the provided account ID.
   *
   * @param accountId - The account ID on which to call the promise.
   */
  static new(accountId) {
    const subtype = new PromiseSingle(accountId, [], null, null);
    return new NearPromise(subtype, false);
  }
  addAction(action) {
    if (this.subtype instanceof PromiseJoint) {
      throw new Error("Cannot add action to a joint promise.");
    }
    this.subtype.actions.push(action);
    return this;
  }
  /**
   * Creates a create account promise action and adds it to the current promise.
   */
  createAccount() {
    return this.addAction(new CreateAccount());
  }
  /**
   * Creates a deploy contract promise action and adds it to the current promise.
   *
   * @param code - The code of the contract to be deployed.
   */
  deployContract(code) {
    return this.addAction(new DeployContract(code));
  }
  /**
   * Creates a function call promise action and adds it to the current promise.
   *
   * @param functionName - The name of the function to be called.
   * @param args - The utf-8 string arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   */
  functionCall(functionName, args, amount, gas) {
    return this.addAction(new FunctionCall(functionName, args, amount, gas));
  }
  /**
   * Creates a function call raw promise action and adds it to the current promise.
   *
   * @param functionName - The name of the function to be called.
   * @param args - The arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   */
  functionCallRaw(functionName, args, amount, gas) {
    return this.addAction(new FunctionCallRaw(functionName, args, amount, gas));
  }
  /**
   * Creates a function call weight promise action and adds it to the current promise.
   *
   * @param functionName - The name of the function to be called.
   * @param args - The utf-8 string arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   * @param weight - The weight of unused Gas to use.
   */
  functionCallWeight(functionName, args, amount, gas, weight) {
    return this.addAction(new FunctionCallWeight(functionName, args, amount, gas, weight));
  }
  /**
   * Creates a function call weight raw promise action and adds it to the current promise.
   *
   * @param functionName - The name of the function to be called.
   * @param args - The arguments to be passed to the function.
   * @param amount - The amount of NEAR to attach to the call.
   * @param gas - The amount of Gas to attach to the call.
   * @param weight - The weight of unused Gas to use.
   */
  functionCallWeightRaw(functionName, args, amount, gas, weight) {
    return this.addAction(new FunctionCallWeightRaw(functionName, args, amount, gas, weight));
  }
  /**
   * Creates a transfer promise action and adds it to the current promise.
   *
   * @param amount - The amount of NEAR to tranfer.
   */
  transfer(amount) {
    return this.addAction(new Transfer(amount));
  }
  /**
   * Creates a stake promise action and adds it to the current promise.
   *
   * @param amount - The amount of NEAR to tranfer.
   * @param publicKey - The public key to use for staking.
   */
  stake(amount, publicKey) {
    return this.addAction(new Stake(amount, publicKey));
  }
  /**
   * Creates a add full access key promise action and adds it to the current promise.
   * Uses 0n as the nonce.
   *
   * @param publicKey - The public key to add as a full access key.
   */
  addFullAccessKey(publicKey) {
    return this.addFullAccessKeyWithNonce(publicKey, 0n);
  }
  /**
   * Creates a add full access key promise action and adds it to the current promise.
   * Allows you to specify the nonce.
   *
   * @param publicKey - The public key to add as a full access key.
   * @param nonce - The nonce to use.
   */
  addFullAccessKeyWithNonce(publicKey, nonce) {
    return this.addAction(new AddFullAccessKey(publicKey, nonce));
  }
  /**
   * Creates a add access key promise action and adds it to the current promise.
   * Uses 0n as the nonce.
   *
   * @param publicKey - The public key to add as a access key.
   * @param allowance - The allowance for the key in yoctoNEAR.
   * @param receiverId - The account ID of the reciever.
   * @param functionNames - The names of funcitons to authorize.
   */
  addAccessKey(publicKey, allowance, receiverId, functionNames) {
    return this.addAccessKeyWithNonce(publicKey, allowance, receiverId, functionNames, 0n);
  }
  /**
   * Creates a add access key promise action and adds it to the current promise.
   * Allows you to specify the nonce.
   *
   * @param publicKey - The public key to add as a access key.
   * @param allowance - The allowance for the key in yoctoNEAR.
   * @param receiverId - The account ID of the reciever.
   * @param functionNames - The names of funcitons to authorize.
   * @param nonce - The nonce to use.
   */
  addAccessKeyWithNonce(publicKey, allowance, receiverId, functionNames, nonce) {
    return this.addAction(new AddAccessKey(publicKey, allowance, receiverId, functionNames, nonce));
  }
  /**
   * Creates a delete key promise action and adds it to the current promise.
   *
   * @param publicKey - The public key to delete from the account.
   */
  deleteKey(publicKey) {
    return this.addAction(new DeleteKey(publicKey));
  }
  /**
   * Creates a delete account promise action and adds it to the current promise.
   *
   * @param beneficiaryId - The beneficiary of the account deletion - the account to recieve all of the remaining funds of the deleted account.
   */
  deleteAccount(beneficiaryId) {
    return this.addAction(new DeleteAccount(beneficiaryId));
  }
  /**
   * Joins the provided promise with the current promise, making the current promise a joint promise subtype.
   *
   * @param other - The promise to join with the current promise.
   */
  and(other) {
    const subtype = new PromiseJoint(this, other, null);
    return new NearPromise(subtype, false);
  }
  /**
   * Adds a callback to the current promise.
   *
   * @param other - The promise to be executed as the promise.
   */
  then(other) {
    assert(other.subtype instanceof PromiseSingle, "Cannot callback joint promise.");
    assert(other.subtype.after === null, "Cannot callback promise which is already scheduled after another");
    other.subtype.after = this;
    return other;
  }
  /**
   * Sets the shouldReturn field to true.
   */
  asReturn() {
    this.shouldReturn = true;
    return this;
  }
  /**
   * Recursively goes through the current promise to get the promise index.
   */
  constructRecursively() {
    const result = this.subtype.constructRecursively();
    if (this.shouldReturn) {
      promiseReturn(result);
    }
    return result;
  }
  /**
   * Called by NearBindgen, when return object is a NearPromise instance.
   */
  onReturn() {
    this.asReturn().constructRecursively();
  }
}

function executeWithReset(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args) {
    this.resetProperty();
    return originalMethod.apply(this, args);
  };
  return descriptor;
}
function responseData(data) {
  return JSON.stringify({
    status: true,
    data: data
  });
}
function responseMessage(status, message) {
  return JSON.stringify({
    status: status,
    message: message
  });
}
function updateObject(originalObject, newObject) {
  for (const key in newObject) {
    if (newObject.hasOwnProperty(key)) {
      originalObject[key] = newObject[key];
    }
  }
}
function now() {
  return new Date(Number(blockTimestamp()) / 1000000);
}

var JobStatus = /*#__PURE__*/function (JobStatus) {
  JobStatus[JobStatus["WAITING"] = 0] = "WAITING";
  JobStatus[JobStatus["PROCESSING"] = 1] = "PROCESSING";
  JobStatus[JobStatus["PENDING"] = 2] = "PENDING";
  JobStatus[JobStatus["STOPPED"] = 3] = "STOPPED";
  JobStatus[JobStatus["PAID"] = 4] = "PAID";
  JobStatus[JobStatus["OVERDUE"] = 5] = "OVERDUE";
  return JobStatus;
}(JobStatus || {});

function allStatusFailExcept(status, exceptStatus) {
  if (Array.isArray(exceptStatus)) {
    if (exceptStatus.includes(status)) {
      return true;
    }
    return 'This job is not finish';
  }
  if (status === exceptStatus) {
    return true;
  }
  switch (status) {
    case JobStatus.WAITING:
      return 'This job is still waiting';
    case JobStatus.PROCESSING:
      return 'This job is still processing';
    case JobStatus.PENDING:
      return 'This job is pending for the recruiter send money';
    case JobStatus.STOPPED:
      return 'This job is stopped already';
    case JobStatus.PAID:
      return 'This job is paid already';
    case JobStatus.OVERDUE:
      return 'This job is overdue already';
  }
}

function checkStarRating(rating) {
  return /^([0-5](\.\d)?)$/.test(rating.toString());
}

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2;
let Main = (_dec = NearBindgen({}), _dec2 = view(), _dec3 = view(), _dec4 = call({}), _dec5 = call({}), _dec6 = call({}), _dec7 = call({}), _dec8 = view(), _dec9 = view(), _dec10 = call({}), _dec11 = call({}), _dec12 = call({}), _dec13 = call({
  payableFunction: true
}), _dec14 = call({}), _dec15 = call({}), _dec16 = call({}), _dec17 = call({}), _dec18 = view(), _dec(_class = (_class2 = class Main {
  jobs = [];
  users = [];
  jobUsers = [];
  evaluateUsers = [];
  GetJob({
    id,
    title,
    category,
    status,
    creatorId
  }) {
    if (id != null) {
      const jobIndex = this.jobs.findIndex(e => e.id === id);
      if (jobIndex === -1) {
        return responseMessage(false, 'Not find job.');
      }
      return responseData(this.includeReputationToJob(this.jobs[jobIndex]));
    }
    return responseData(this.jobs.filter(e => {
      let matchTitle = true;
      let matchCategory = true;
      let matchStatus = true;
      let matchCreator = true;
      if (title != null) {
        matchTitle = e.title.includes(title);
      }
      if (category != null) {
        matchCategory = e.categories.includes(category);
      }
      if (status != null) {
        matchStatus = e.status === status;
      }
      if (creatorId != null) {
        matchCreator = e.creator.id === creatorId;
      }
      return matchTitle && matchCategory && matchStatus && matchCreator;
    }).map(job => this.includeReputationToJob(job)));
  }
  includeReputationToJob(job) {
    const evaluates = this.evaluateUsers.filter(e => e.job.id === job.id && e.evaluatorUser.id !== job.creator.id);
    const star = evaluates.reduce((acc, evaluateUser) => acc + evaluateUser.star, 0) / evaluates.length;
    return {
      ...job,
      star
    };
  }
  GetUser({
    id,
    name,
    accountId
  }) {
    if (id != null) {
      const jobIndex = this.users.findIndex(e => e.id === id);
      if (jobIndex === -1) {
        return responseMessage(false, 'Not find user.');
      }
      return responseData(this.users[jobIndex]);
    }
    if (accountId != null) {
      const jobIndex = this.users.findIndex(e => e.accountId === accountId);
      if (jobIndex === -1) {
        return responseMessage(false, 'Not find user.');
      }
      return responseData(this.users[jobIndex]);
    }
    return responseData(this.users.filter(e => {
      let matchName = true;
      if (name != null) {
        matchName = e.name.includes(name);
      }
      return matchName;
    }));
  }
  CreateJob({
    title,
    description,
    categories,
    money
  }) {
    this.jobs.push({
      id: this.jobs.length + 1,
      title: title,
      description: description,
      categories: categories,
      money: money,
      status: JobStatus.WAITING,
      creator: this.authed(),
      createdAt: now(),
      startedAt: undefined,
      finishedAts: undefined,
      freelancer: undefined,
      deadline: undefined
    });
    return responseMessage(true, 'Create Job successfully');
  }
  UpdateJob({
    id,
    title,
    description,
    categories,
    money
  }) {
    const jobIndex = this.findJobIndexOrFail(id, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    updateObject(this.jobs[jobIndex], {
      title,
      description,
      categories,
      money
    });
    return responseMessage(true, 'Update Job successfully');
  }
  DeleteJob({
    id
  }) {
    const jobIndex = this.findJobIndexOrFail(id, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    this.jobs.splice(jobIndex, 1);
    return responseMessage(true, 'Delete Job successfully');
  }
  RegisterJob({
    id,
    message
  }) {
    const jobIndex = this.findJobIndexOrFail(id);
    if (typeof jobIndex !== 'number') return jobIndex;
    const user = this.authed();
    if (!this.jobUsers.find(e => e.job.id === id && e.user.id === user.id)) {
      this.jobUsers.push({
        job: this.jobs[jobIndex],
        user: user,
        message: message,
        createdAt: now()
      });
      return responseMessage(true, 'Register successfully');
    }
    return responseMessage(false, 'You have registered this job before');
  }
  GetJobRegister({
    id
  }) {
    return responseData(this.jobUsers.filter(e => e.job.id === id).map(({
      user,
      message,
      createdAt
    }) => ({
      user,
      message,
      createdAt
    })));
  }
  GetJobRegisteredByUser({
    id
  }) {
    return responseData(this.jobUsers.filter(e => e.user.id === id).map(({
      job,
      message,
      createdAt
    }) => ({
      job,
      message,
      createdAt
    })));
  }
  ChooseFreelancer({
    userId,
    jobId
  }) {
    const jobIndex = this.findJobIndexOrFail(jobId, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    const jobUser = this.jobUsers.find(e => e.user.id === userId && e.job.id === jobId);
    if (jobUser == null) {
      return responseMessage(false, 'This user not register this job');
    }
    let freelancer = this.jobs[jobIndex].freelancer;
    if (freelancer != null) return responseMessage(false, `You have chose ${freelancer.accountId} for doing this job.`);
    this.jobs[jobIndex].freelancer = jobUser.user;
    return responseMessage(true, 'Choose freelancer successfully');
  }
  SetJobDeadline({
    jobId,
    deadline
  }) {
    const jobIndex = this.findJobIndexOrFail(jobId, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    const job = this.jobs[jobIndex];
    if (job.freelancer == null) {
      return responseMessage(false, 'There is no freelancer, please choose one then set deadline');
    }
    job.status = JobStatus.PROCESSING;
    job.startedAt = job.startedAt || now();
    job.deadline = new Date(deadline);
    return responseMessage(true, 'Set deadline successfully');
  }
  SendPaymentRequest({
    id
  }) {
    const jobIndex = this.findJobIndexOrFail(id, false, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    const job = this.jobs[jobIndex];
    const checkJobStatus = allStatusFailExcept(job.status, JobStatus.PROCESSING);
    if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);
    job.status = JobStatus.PENDING;
    job.finishedAts = job.finishedAts || [];
    job.finishedAts.push(now());
    return responseMessage(true, 'Send payment request successfully');
  }
  VerifyPaymentRequest({
    id
  }) {
    const jobIndex = this.findJobIndexOrFail(id, true);
    if (typeof jobIndex !== 'number') return jobIndex;
    const job = this.jobs[jobIndex];
    const checkJobStatus = allStatusFailExcept(job.status, JobStatus.PENDING);
    if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);
    job.status = JobStatus.PAID;
    return NearPromise.new(job.freelancer.accountId).transfer(BigInt(job.money * 1000000000000000000000000));
  }
  Evaluate({
    userId,
    jobId,
    star,
    message
  }) {
    if (!checkStarRating(star)) return responseMessage(false, 'Invalid star rating, star should be 0~5, only 1 decimal.');
    const evaluator = this.authed();
    const jobIndex = this.findJobIndexOrFail(jobId);
    if (typeof jobIndex !== 'number') return jobIndex;
    const job = this.jobs[jobIndex];
    if (job.freelancer.id !== userId && job.freelancer.id !== evaluator.id || job.creator.id !== userId && job.creator.id !== evaluator.id) {
      return responseMessage(false, 'You do not do this job and you are not the creator of this job.');
    }
    const checkJobStatus = allStatusFailExcept(job.status, [JobStatus.PAID, JobStatus.STOPPED, JobStatus.OVERDUE]);
    if (checkJobStatus !== true) return responseMessage(false, checkJobStatus);
    const evaluate = this.evaluateUsers.find(e => e.job.id === jobId && e.evaluatorUser.id === evaluator.id && e.evaluatedUser.id === userId);
    if (evaluate != null) {
      return responseMessage(false, 'You have evaluated this already');
    }
    this.evaluateUsers.push({
      evaluatorUser: evaluator,
      evaluatedUser: this.users.find(e => e.id === userId),
      job: job,
      star: star,
      message: message,
      createdAt: now()
    });
    return responseMessage(true, 'Evaluate successfully');
  }
  Register() {
    this.authed();
    return responseMessage(true, 'Register successfully');
  }
  authed() {
    const accountId = signerAccountId();
    let user = this.users.find(e => e.accountId === accountId);
    if (user == null) {
      const countUser = this.users.push({
        id: this.users.length + 1,
        name: undefined,
        rate: 0,
        accountId: accountId,
        createdAt: now()
      });
      user = this.users[countUser - 1];
    }
    return user;
  }
  ResetData() {
    this.jobs = [];
    this.users = [];
    this.jobUsers = [];
    this.evaluateUsers = [];
  }
  GetData() {
    return responseData({
      jobs: this.jobs,
      users: this.users,
      jobUsers: this.jobUsers,
      evaluateUsers: this.evaluateUsers
    });
  }
  resetProperty() {
    this.jobs = this.jobs == null ? [] : this.jobs;
    this.users = this.users == null ? [] : this.users;
    this.jobUsers = this.jobUsers == null ? [] : this.jobUsers;
    this.evaluateUsers = this.evaluateUsers == null ? [] : this.evaluateUsers;
  }
  findJobIndexOrFail(id, isCheckOwner = false, isCheckFreelancer = false) {
    const jobIndex = this.jobs.findIndex(e => e.id === id);
    if (jobIndex === -1) {
      return responseMessage(false, 'Not find job.');
    }
    if (isCheckOwner && this.jobs[jobIndex].creator.id !== this.authed().id) {
      return responseMessage(false, 'This job is not yours.');
    }
    if (isCheckFreelancer && this.jobs[jobIndex]?.freelancer?.id !== this.authed().id) {
      return responseMessage(false, 'You are not doing this job');
    }
    return jobIndex;
  }
  constructor() {
    this.jobs = this.jobs == null ? [] : this.jobs;
    this.users = this.users == null ? [] : this.users;
    this.jobUsers = this.jobUsers == null ? [] : this.jobUsers;
    this.evaluateUsers = this.evaluateUsers == null ? [] : this.evaluateUsers;
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "GetJob", [_dec2, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "GetJob"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "GetUser", [_dec3, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "GetUser"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "CreateJob", [_dec4, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "CreateJob"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "UpdateJob", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "UpdateJob"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "DeleteJob", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "DeleteJob"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "RegisterJob", [_dec7, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "RegisterJob"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "GetJobRegister", [_dec8, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "GetJobRegister"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "GetJobRegisteredByUser", [_dec9, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "GetJobRegisteredByUser"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ChooseFreelancer", [_dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "ChooseFreelancer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "SetJobDeadline", [_dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "SetJobDeadline"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "SendPaymentRequest", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "SendPaymentRequest"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "VerifyPaymentRequest", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "VerifyPaymentRequest"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "Evaluate", [_dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "Evaluate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "Register", [_dec15, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "Register"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "authed", [_dec16, executeWithReset], Object.getOwnPropertyDescriptor(_class2.prototype, "authed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ResetData", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "ResetData"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "GetData", [_dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "GetData"), _class2.prototype)), _class2)) || _class);
function GetData() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.GetData(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function ResetData() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.ResetData(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function authed() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.authed(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function Register() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.Register(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function Evaluate() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.Evaluate(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function VerifyPaymentRequest() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.VerifyPaymentRequest(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function SendPaymentRequest() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.SendPaymentRequest(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function SetJobDeadline() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.SetJobDeadline(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function ChooseFreelancer() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.ChooseFreelancer(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function GetJobRegisteredByUser() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.GetJobRegisteredByUser(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function GetJobRegister() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.GetJobRegister(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function RegisterJob() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.RegisterJob(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function DeleteJob() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.DeleteJob(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function UpdateJob() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.UpdateJob(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function CreateJob() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.CreateJob(_args);
  Main._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function GetUser() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.GetUser(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}
function GetJob() {
  const _state = Main._getState();
  if (!_state && Main._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Main._create();
  if (_state) {
    Main._reconstruct(_contract, _state);
  }
  const _args = Main._getArgs();
  const _result = _contract.GetJob(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Main._serialize(_result, true));
}

export { ChooseFreelancer, CreateJob, DeleteJob, Evaluate, GetData, GetJob, GetJobRegister, GetJobRegisteredByUser, GetUser, Register, RegisterJob, ResetData, SendPaymentRequest, SetJobDeadline, UpdateJob, VerifyPaymentRequest, authed };
//# sourceMappingURL=hello_near.js.map
