
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

A CABE Envelope is a COSE structure, as defined in [RFC
9052](https://www.rfc-editor.org/rfc/rfc9052.html). Specifically, a CABE
Envelope uses the `COSE_Encrypt0` or `COSE_Encrypt` structure.

A CABE implementation SHOULD serialize a CABE Envelope as a `COSE_Encrypt0`
structure when it is possible to do so in order to minimise overhead.

### Use of tagged COSE structures

An implementation MAY generate the `COSE_Encrypt0_Tagged` or
`COSE_Encrypt_Tagged` structure and implementations MUST be able to consume
CABE Envelopes whether or not they are so tagged. Whether the use of tagging is
desirable or useful depends on the context in which CABE is used; as such, this
is left as an implementation choice.

### Construction

A CABE Envelope is defined as a `COSE_Encrypt0` or `COSE_Encrypt` (or
`COSE_Encrypt0_Tagged` or `COSE_Encrypt_Tagged`) structure which is organized
as follows:

- It makes use of direct encryption using a COSE Content Encryption Key (CEK)
  using a symmetric AEAD.
- The COSE Header contains fields as specified in the 'Header fields' section
  of this document.
- The CEK is obtained by the implementation according to the 'Key schedule'
  section of this document.

## Operations

### Encapsulation

A Message is Encapsulated to create an Envelope as follows:

1. The Client obtains a Lease and Lease Key pertaining to the Message's
Attribute Set. It may already have a relevant cached non-expired Lease;
otherwise, it obtains one by performing Prograde Key Resolution via interaction
with a Key Server.

2. The Client chooses a partial IV to be combined with the Lease Key.

3. The Client performs COSE encryption using a symmetric AEAD of its choice,
generating a `COSE_Encrypt0` or `COSE_Encrypt` structure with headers including
the partial IV and Message's Attribute Set, and other Lease-related headers as
specified in 'Header fields'.

### Decapsulation

An Envelope is Decapsulated to recover a Message as follows:

1. The Client obtains the Attribute Set and Lease Reference from the Envelope's
headers.

2. The Client performs Retrograde Key Resolution using the Lease Reference via
interaction with a Key Server, and obtains the Lease Key.

3. The Client performs COSE authenticated decryption of the `COSE_Encrypt0` or
`COSE_Encrypt` structure using the Lease Key.

## Header fields

A CABE Envelope's `COSE_Encrypt0` or `COSE_Encrypt` structure has one or more
of the the following header fields:

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

- `CABE_LeaseRef`: This field MUST be set to a byte string which is the Lease Reference
  which was produced by the Key Server when returning a Lease. This value is used
  by the Key Server in Retrograde Key Resolution to locate the Set Key which was
  used to derive the Lease Key and re-derive that Lease Key. In other words,
  for a Client and suitably authorized Principal, the Attribute Set and Lease
  Reference is necessary and sufficient to re-obtain the corresponding Lease
  Key from the Key Server.

- `Partial IV`: This field is specified by COSE. This field MUST be set to a
  value which is unique within the scope of a given Lease Key. One way of
  satisfying this requirement is to use a simple counter which starts at 0 and
  increments by one for each Message encrypted under a Lease. However, because
  a `Partial IV` only needs to be unique within the context of a Lease, the
  choice of allocation method is left to an implementation.

## Key schedule

Encapsulating a Message to create an Envelope involves examining the Attribute
Set for the Message to be Encapsulated and obtaining a Lease (and Lease Key)
for that Attribute Set. A Lease is obtained by making a Prograde Key Resolution
Request to a Key Server; if authorized, the Key Server creates a Lease and
returns a Key Resolution Response including information about the Lease,
including the Lease Key Access Information (LKAI).

Each Lease has an expiration time indicating the point in time at which the Key
Resolution Response and its selection of a specific Set Key and derived Lease
Key is no longer valid.

The Lease Key is derived deterministically from the Set Key but is unique to
the created Lease; thus, the Lease Key is unique to the Prograde Key Resolution
request which was made by the Client, and there is no risk of collision with
other requests made by other Clients which resolve to the same Set Key.

Upon receiving the Lease:

- In the case of a Non-Captive Key, the Client notionally constructs a
  `COSE_Key` structure which holds the key's bit pattern and relevant details.
  The `Base IV` parameter is also provided by the Key Server copied from the
  LKAI. This Key, including the Base IV, is combined with the Client's choice of
  Partial IV for each Envelope it creates.

  An implementation does not need to actually use the `COSE_Key` structure
  so long as its behavior is functionally equivalent.

  The Client creates Envelopes using the Lease Key directly and MUST NOT use
  COSE Key Wrap. As such, it is able to use the `COSE_Encrypt0` structure for
  more efficient serialization.

- In the case of a Captive Key, the Client makes a request to the Key Server
  for Assisted Encapsulation or Assisted Decapsulation using and creates
  Envelopes using COSE Key Wrap; as a result, the use of the `COSE_Encrypt`
  structure is necessary.

# References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [CABE-ARCH](./arch): *CABE Architecture Specification*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CBOR)*
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html): *CBOR Object Signing and Encryption (COSE): Structures and Process*
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html): *CBOR Object Signing and Encryption (COSE): Initial Algorithms*

# Colophon

**Author**<br/>
[Hugo Landau](mailto:hl@messier42.com)
