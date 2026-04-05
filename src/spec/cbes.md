
---
title: "CABE Baseline Envelope Structure"
draft: "CBES"
status: "Active Draft"
date: "April 2026"
abstract: "This document specifies the CABE Baseline Envelope Structure."
---

# Introduction

This document specifies the Concise Attribute-Bound Encapsulation (CABE) Base
Envelope Structure (CBES). It comprises one of the core specifications of the
CABE Architecture, as defined in the [CABE Architecture Specification](./arch).

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in [BCP
14](https://www.rfc-editor.org/info/bcp14) when, and only when, they appear in
all capitals, as shown here.

All definitions given in the [CABE Architecture Specification](./arch) are
reused for the purposes of this document.

# Envelope Format

## Overview

CABE Envelopes are COSE structures, as defined in [RFC
9052](https://www.rfc-editor.org/rfc/rfc9052.html). Specifically, COSE
Envelopes use the `COSE_Encrypt0` structure to minimise overhead. A CABE
implementation MUST serialize a CABE Envelope as a `COSE_Encrypt0` structure
and MUST NOT generate or accept a `COSE_Encrypt` structure, or any other
top-level structure defined in RFC 9052.

### Use of tagged COSE structures

An implementation MAY generate the `COSE_Encrypt0_Tagged` structure and
implementations MUST be able to consume CABE Envelopes whether or not they are
so tagged. Whether the use of tagging is desirable or useful depends on the
context in which CABE is used; as such, this is left as an implementation
choice.

### Construction

A CABE Envelope is defined as a `COSE_Encrypt0` (or `COSE_Encrypt0_Tagged`)
structure which is organized as follows:

- It makes use of direct encryption using a COSE Content Encryption Key (CEK)
  using a symmetric AEAD.
- The COSE Header contains fields as specified in the 'Header fields' section
  of this document.
- The CEK is derived by the implementation according to the 'Key schedule'
  section of this document.

CABE Key Derivation for the purposes of envelope encryption does not use the
key derivation functionality defined in RFC 9052 and RFC 9053; as such, the
Envelope Key generated as specified in this document becomes the CEK and, along
with the payload itself, is the primary input to a standard COSE encryption or
decryption process as defined in RFC 9052. This is chosen as the key derivation
functionality defined in RFC 9052 requires the use of `COSE_Recipient`, adding
overhead, and is contextually not needed in the context of CABE.

## Operations

### Encapsulation

A Message is Encapsulated to create an Envelope as follows:

1. The Client obtains a Lease and Set Key pertaining to the Message's Attribute
Set. It may already have a relevant cached non-expired Lease; otherwise, it
obtains one by performing Prograde Key Resolution via interaction with a Key
Server.

2. The Client derives the Lease Key as specified in this document.

3. The Client chooses a partial IV to be combined with the Lease Key.

4. The Client performs COSE encryption using a symmetric AEAD of its choice,
generating a `COSE_Encrypt0` structure with headers including the partial IV
and Message's Attribute Set, and other Lease-related headers as specified in
'Header fields'.

### Decapsulation

An Envelope is Decapsulated to recover a Message as follows:

1. The Client obtains the Attribute Set, Key Reference and Lease Discriminator
   from the Envelope's headers.

2. The Client performs Retrograde Key Resolution using the Key Reference
   via interaction with a Key Server, and obtains the Set Key.

3. The Client derives the Lease Key using the Set Key and the Lease
   Discriminator.

4. The Client performs COSE authenticated decryption of the `COSE_Encrypt0`
   structure using the Lease Key.

## Header fields

A CABE Envelope's `COSE_Encrypt0` structure has one or more of the the
following header fields:

- `content type`: This field is specified by COSE and SHOULD be set to the
  content type of the plaintext Message. This field is not used to determine
  that CABE is in use, which can instead be determined by the presence of one
  or more of the CABE-specific header fields below in the Envelope headers.

- `kid`: This field is specified by COSE. Its use in CABE is OPTIONAL. CABE
  deliberately avoids normative use of this field as its semantics are
  unspecified and may vary from circumstance to circumstance. In the context of
  CABE, this field is reserved for diagnostic use; for example, a CABE
  implementation may assign Keys and Messages `kid` values to assist debugging,
  or forego use of this field entirely. An implementation MUST NOT make use of
  this field for Key Resolution, or any other CABE operation.

- `CABE_AttributeSet`: This field MUST be set to a byte string containing the
  deterministic serialization of the Attribute Set (as defined in
  [CABE-ARCH](./arch)) of the Message used to create the Envelope.  A CABE
  implementation MUST NOT accept an Envelope without this field.

- `CABE_KeyRef`: This field MUST be set to a byte string provided by a Key
  Server in the Lease which was used to create a given Envelope.  This value is
  used by Clients to de-encapsulate Envelope by quoting the same Key Reference
  back to a Key Server as part of Retrograde Key Resolution. A Key Server can
  use the Key Reference to find the correct Key unambiguously.

- `CABE_LeaseDiscriminator`: This field MUST be set to the Lease Discriminator
  byte string provided by the Key Server in the Lease used to create the
  Envelope. This field is used to perform key derivation over a Set Key to
  obtain a unique Lease Key. Implementations MUST reject Envelopes which lack
  this field.

- `Partial IV`: This field is specified by COSE. This field MUST be set to a
  value which is unique within the scope of a given Lease. One way of
  satisfying this requirement is to use a simple counter which starts at 0 and
  increments by one for each Message encrypted under a lease. However, because
  a `Partial IV` only needs to be unique within the context of a Lease,
  the choice of allocation method is left to an implementation.

## Key schedule

Encapsulating a Message to create an Envelope involves examining the Attribute
Set for the Message to be Encapsulated and obtaining a current Set Key and
Lease for that Attribute Set. A Set Key is obtained by making a Prograde Key
Resolution Request to a Key Server; if authorized, the Key Server creates a
Lease and returns a Key Resolution Response including information about the
Lease and information about the Set Key associated with it.

Each Lease has

- A globally unique identifier (the lease ID);

- An expiration time indicating the point in time at which the Key Resolution
  Response and its selection of a specific Set Key is no longer valid.

The Client then generates a Lease Nonce for this Lease, such that the
combination of the Set Key and the Lease Nonce, when passed into a suitable key
derivation function, creates a unique key which can be safely allocated with a
sequentially allocated Partial IV.

An Envelope Key is derived using HKDF with SHA-512 as a PRF as follows:

```
  EnvelopeKey, EnvelopeBaseIV = HKDF-SHA-512(
    secret=SetKey, salt='', context,
    length=n+m
  )
```

In other words, the Envelope Key is the first `n` bits produced by the
`HKDF` operation, and the Envelope Base IV is the subsequent `m` bits
produced by that operation, where `n` and `m` are the respective key length and
IV lengths required by the symmetric encryption algorithm in use.

The `context` input to HKDF is the `COSE_KDF_Context` structure as defined in
Section 11.2 of [RFC 8152](https://www.rfc-editor.org/rfc/rfc8152.html).
Because the `context` must be deterministically re-derived on the receiving end
to derive the same key, the context MUST be constructed exactly as described below
and deterministically serialized:

- `AlgorithmID` MUST be set to the algorithm identifier in use, which MUST be
  the integer code point assigned for the algorithm `direct+HKDF-SHA-512`.
- `PartyUInfo` MUST be an CBOR Array containing a single CBOR Map, which shall have `identity` and `other` set to nil, and `nonce` set to the Lease Nonce;
- `PartyVInfo` MUST be set to an empty CBOR Array;
- `SuppPubInfo` MUST Be set to a map with `keyDataLength` set to `n+m` and `protected` set to a zero-length byte string.

be set to an arraymap as follows:
```
COSE_KDF_Context = [
  AlgorithmID,
  PartyUInfo = [
    (
      identity = nil,
      nonce = leaseNonce,
      other = nil
    )
  ],
  PartyVInfo = [],
  SuppPubInfo = [
    keyDataLength,
    protected = {}
  ]
]
```

The Message Base IV is of a length determined by the symmetric encryption
algorithm in use, and is combined with the partial IV as defined in COSE.



```


    direct   - implicit CEK = HKDF(...) custom
    SymKEK   - recipient:E[KEK](CEK)


```




```

func main() {
  e := &cose.EncryptMessage[[]byte] {
    Payload: []byte("foo"),
  }

  e.Encrypt(encryptor, nil)
  e.AddRecipient()
  XXXXX;wq
}

```


# Security Considerations

# References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [CABE-ARCH](./arch): *CABE Architecture Specification*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CBOR)*
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html): *CBOR Object Signing and Encryption (COSE): Structures and Process*
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html): *CBOR Object Signing and Encryption (COSE): Initial Algorithms*

