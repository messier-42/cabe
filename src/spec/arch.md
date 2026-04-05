
---
title: "CABE Architecture Specification"
draft: "CABE-ARCH"
status: "Active Draft"
date: "April 2026"
abstract: "This document specifies the CABE Architecture and provides the architectural framework into which the other CABE specifications fall."
---

# Introduction

Concise Attribute-Bound Encapsulation (CABE) defines an envelope format and key
management architecture for managing object-level encryption of information
using Attribute-Based Access Control (ABAC) principles. CABE works by assigning
a set of key-value metadata items known as attributes to messages, and
automatically manages the generation of keys for each unique attribute set used
within a CABE domain.  Access to keys is gated according to their associated
attribute sets and in relation to an ABAC policy. CABE therefore allows for
highly flexible access control policy to be expressed and enforced using data
encryption, facilitating multi-level data transfer, storage, and interchange in
otherwise untrusted operating environments.

CABE defines:

- An overall architecture specification (this document);

- The [**CABE Baseline Envelope Structure (CBES)**](../cbes/) defining how messages
  are encapsulated securely into opaque envelopes and subsequently decapsulated
  back into intelligible messages.

- The [**CABE Key Access Protocol (CKAP)**](../ckap/) defining communications
  between a CABE client and key server, and how keys are retrieved from key
  servers for use with the Baseline Envelope Structure.

- [Additional specifications](../../specification/) providing augmented functionality building on
  the base CABE architecture created by the synthesis of this document, CBES
  and CKAP.

<figure style="text-align: center;"><img src="/images/cabe-example.svg" alt="CABE Architecture Diagram" /></figure>

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in [BCP
14](https://www.rfc-editor.org/info/bcp14) when, and only when, they appear in
all capitals, as shown here.

The following terms are defined:

- **Payload**: The sequence of zero or more bytes constituting the plain-text
  body of a Message, which has application-specific meaning opaque to CABE.

- **Metadata**: Information characterising the Payload of a Message other than
  the Payload itself, to include at least an Attribute Set and, potentially,
  other application-specific data items opaque to CABE.

- **Message**: Refers to a Payload, associated Attribute Set and any other
  associated Metadata which may be used to construct an Envelope via
  Encapsulation, or which may be obtained from an Envelope via Decapsulation.

- **Envelope**: The result of Encapsulating a Message using CABE,
  rendering it cryptographically secure and opaque to examination or modification.

- **Attribute**: A key-value pair constituting an item of Metadata relating to
  some given Message, which may be used to qualify the circumstances in which
  access to a Message may be made.

- **Attribute Key**: The key of a key-value pair in an Attribute, which is a
  textual, human-readable string of non-zero length and which matches the
  grammar given in the section “Attribute Sets”.

- **Attribute Value**: A CBOR data item within the CBOR Basic Data Model as
  defined in [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html).

- **Attribute Set**: A unique set of Attributes in relation to a Message,
  Envelope, Key or Lease.

- **Message Set**: The set of Messages with a given Attribute Set.

- **Envelope Set**: The set of Envelopes with a given Attribute Set. (These
  last two definitions are largely conceptual, as the set of Messages or
  Envelopes with a given Attribute Set is infinite and not countable.)

- **Encapsulation**: The process of producing an Envelope from a Message.

- **Decapsulation**: The process of producing a Message from an Envelope.

- **Principal**: A logical identity characterising an Agent, and which
  possesses a set of Claims for the purposes of determining what
  Messages/Envelopes it is permitted to Encapsulate/Decapsulate, as
  determined by a Key Server's Policy.

- **Claims**: A set of known facts about a Principal.

- **CKAP**: The CABE Key Access Protocol (CKAP).

- **Agent**: A piece of software which implements CABE, which Encapsulates
  Messages and/or Decapsulates Envelopes, and incorporates a Client which
  authenticates to and communicates with a Key Server as a Principal.

- **Client**: The component of an Agent which implements CKAP, and which
  communicates with a Key Server.

- **Key Server**: A server which responds to requests by Clients to facilitate
  Encapsulation/Decapsulation, primarily by performing Key Resolution and
  tracking Leases, and which manages an arbitrarily large set of Keys to
  facilitate this.

- **CABE Domain**: A CABE deployment comprising a Key Server and one or more
  Clients.

- **Key**: A secret value used, directly or indirectly, to
  encapsulate/decapsulate Messages/Envelopes. Note that:

    - A Key is either Derived or Non-Derived;
    - A Key is either an Internal Key or an Access Key; and
      - Access Keys are further divided into
        - Captive (Access) Keys; and
        - Non-Captive (Access) Keys.

- **Key Mapping**: The process of mapping Attribute Sets to Set Keys, as
  managed by a Key Server.

- **Key Resolution**: The operation of resolving an Attribute Set to a Set Key
  as requested by a Client. Key Resolution refers either in the form of
  Prograde Resolution or Retrograde Resolution.

- **Prograde Resolution**: Key Resolution wherein a Client requests the Current
  Key for a given Attribute Set, for the purposes of performing Encapsulation
  of a new Message, and receives information about the Current Key in the form
  of a Lease.

- **Retrograde Resolution**: Key Resolution wherein a Client quotes a Lease
  Reference for the purposes of obtaining a previously used Lease Key's LKAI,
  for the purposes of performing Decapsulation of an existing Envelope.

- **Lease**: A temporary object with a specific expiration time managed and
  tracked by a Key Server in response to a Prograde Resolution request.

- **Internal Key**: A Key which is used internally by the Key Server to derive
  one or more Derived Keys but which is never disclosed to any Client.

- **Access Key**: A Key which is not an Internal Key and which is available for
  Clients to use, either by being provided by the Key's bit pattern (as in the
  case of a Non-Captive Key), or via Assisted Encapsulation/Decapsulation
  performed by the Key Server on behalf of a Client. In this version of the
  specification, the only defined kind of Access Key is a Lease Key.

- **Set Key**: An Internal Key assigned to a given Envelope Set at a given point
  in time, which is used to derive Lease Keys.

- **Non-Derived Key**: A Key which is directly derived from an entropy source
  and therefore must be stored by a Key Server if it is to be subsequently
  recalled.

- **Derived Key**: A Key which is derived from another Key (which in turn may
  be a Non-Derived Key or a Derived Key), and which therefore does not need to
  be stored by a Key Server in order to be subsequently re-derived.

- **Non-Captive Key**: An Access Key which a Key Server is willing to provide a
  copy of to a suitably authorized Client, so that it can
  encapsulate/decapsulate corresponding Messages/Envelopes without further
  interaction with the Key Server.

- **Captive Key**: An Access Key which a Key Server does not disclose to any
  Client, but is willing to perform operations using on behalf of a Client to
  allow it to accomplish encapsulation/decapsulation of corresponding
  Messages/Envelopes.

- **Key Series**: A chronological series of Keys all possessing the same
  associated Attribute Set. The Keys in a Key Series are totally ordered and
  each Key in a Key Series corresponds exactly to a single Key Epoch.

- **Key Epoch**: A contiguous period of time used to manage the rollover of
  Keys for an arbitrarily large number of Key Series managed by a Key Server.
  Key Epochs succeed one another consecutively and no time passes between a Key
  Epoch and its successor.

- **Current Key**: The Current Key for a given Key Series.

- **Retired Key**: A Key within a given Key Series which is not a Current Key.

- **Lease Key**: A Derived Key generated from the Current Key for a Key Series
  and which is associated with, and unique to, a Lease.

- **Lease Key Access Information (LKAI)**: Information needed to make use of a
  Lease Key, whether it is a Captive Key (in which case it comprises the Lease
  Key Access Token (LKAT)) or Non-Captive Key (in which case it comprises the
  bit pattern of the Lease Key).

- **Lease Key Access Token (LKAT)**: An opaque byte string quoted to the Key
  Server to perform Assisted Encapsulation or Decapsulation using a Lease Key
  which is a Captive Key.

- **Key Access**: The process in which a Client obtains (for a Non-Captive
  Key), or indirectly makes use of (for a Captive Key) a Lease Key, for the
  purposes of facilitating access to some contiguous temporal subset of an
  Envelope Set. Key Access is distinct from, and occurs subsequently to, Key
  Resolution.

- **Lease Reference**: An opaque byte string produced by a Key Server which it
  can use to subsequently recover a given Lease Key and corresponding LKAI.
  Lease References MUST be globally and permanently unique.

- **Policy**: An arbitrary rule or logic used by a Key Server to determine
  which Principals may access which Envelope Sets, and which Key Epochs within
  a given Envelope Set, based on its Claims. The nature of a Policy is not
  defined in this specification, and is left as an implementation detail. A
  Policy is a deterministic, pure function over a Principal's Claims, an
  Attribute Set, and a requested operation, returning either ALLOW or DENY.

- **Access**: Generically, Access to an Envelope Set or Key refers to the
  authorization to perform Key Resolution for a given Envelope Set, and thereby
  perform encapsulation and decapsulation for it.

- **Rollover**: The process by which a new Key Epoch is created for a Key
  Series, with a new assigned Set Key, which then becomes the Current Key for
  that Key Series.

- **Rollover Period**: The (approximate) period for which Clients are liable to
  encapsulate Messages using Lease Keys derived from non-Current Set Keys for a
  given Key Series.

- **Synchronous Rollover**: Rollover which occurs predictably and on a
  chronological schedule.

- **Asynchronous Rollover**: Rollover which can occur unpredictably at any time
  in response to arbitrary system events, such as the addition of newly
  authorized Principals, the revocation of existing Principals, or at operator
  request.

- **CSPRNG**: A cryptographically secure pseudo-random number generator.

# Attribute Sets

## Definition

An Attribute Set is a unique unordered set of Attributes. Each Attribute is a
key-value metadata item which characterises a Message, Envelope, Key or Lease.

The key of an Attribute is a textual string meeting the following requirements:

- It comprises at least one character ("" is not a valid key);
- The UTF-8 representation of the string does not exceed 255 bytes; and
- It satisfies the [ABNF (RFC 5234)](https://www.rfc-editor.org/rfc/rfc5234)
  grammar shown below.

```ABNF
ALNUM         = ALPHA / DIGIT
ATTRIBUTE_KEY = ALPHA *ALNUM *('-' 1*ALNUM)
```

The value of an Attribute is a data item within the CBOR Basic Data Model as
defined in [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html).

Duplicate keys MUST NOT be present in an Attribute Set. An implementation which
encounters an Attribute Set with duplicate keys MUST refuse to process it.

## Serialization

The serialization of an Attribute Set MUST be the serialization of a CBOR Map
data item using Deterministically Encoded CBOR as defined in [RFC
8949](https://www.rfc-editor.org/rfc/rfc8949.html). The CBOR encoding MUST
satisfy the core deterministic encoding requirements as defined in section 4.2.1
of [RFC
8949](https://www.rfc-editor.org/rfc/rfc8949.html#name-core-deterministic-encoding).

## Equality

Two Attribute Sets are the same if their serializations are the same byte string.

# Architectural Overview

CABE defines a means of Encapsulating messages into envelopes, attaching
attribute-based metadata and encrypting them in the process, and subsequently
Decapsulating envelopes into messages, decrypting them, obtaining their
contents and associated attribute-based metadata in the process. CABE Agents
are responsible for Encapsulation and Decapsulation and perform these
operations in coordination with a Key Server, which they communicate with using
the CKAP protocol.

<figure style="text-align: center;"><img src="/images/cabe-arch-overview.svg" alt="CABE Architectural Overview"/></figure>

## Overall Process

CABE is based around symmetric cryptography and avoids direct reliance on
asymmetric primitives.

The key aspects of CABE are:

- **Characterisation.** An Encapsulating Agent characterises the Message to
  be secured by assigning it a set of Attributes which characterise it for the
  purposes of access control policy. For example, a Message might be
  characterised by sensitivity level (confidential, secret, top secret, etc.),
  country, compartment or codename, or along any other axis. CABE is agnostic
  to the specific system of classification and metadata used.

- **Key mapping.** The Attribute Set for a Message is mapped to a (symmetric)
  Key. This function is performed by the Key Server, which is responsible for
  maintaining a repository of Keys corresponding to each unique Attribute Set
  used within the CABE Domain.

- **Key resolution.** The CABE Key Server automatically maintains the Key Mapping
  needed according to the Attribute Sets used within the scope of the CABE
  Domain. When a CABE Client needs to Encapsulate a Message to create an
  encrypted CABE Envelope, it asks the Key Server to perform Key Resolution, in
  which the Key Server examines the Attribute Set in use and determines the
  correct Key to use within its existing, automatically maintained Key Mapping.
  Having determined the correct Key, a CABE Agent proceeds to Key Access.

- **Key access.** CABE Clients request access to the Keys managed by a Key
  Server so that they can encapsulate Messages into Envelopes and vice versa.
  Whereas key mapping is the process of *choosing* the correct Key for a
  Message, key access is the process of *using* the chosen Key to encapsulate a
  Message, or decapsulate an Envelope.

  "Use of" a Key does not necessarily imply its bit pattern is provided to the
  CABE Client. Both "in-memory" (non-captive) and "out-of-memory" (captive,
  i.e., RPC-based) use of Keys "at a distance" is envisaged. The need to
  transmit large messages to a Key Server is avoided as only an ephemeral
  Content Encryption Key (CEK) is provided to the Key Server (in the
  out-of-memory case) for encapsulation/decapsulation.

  Key Access represents the key policy enforcement point of CABE, as the Key
  Server can control access according to Attribute-Based Access Control (ABAC)
  principles based on the identity of the Client and the metadata of an
  Envelope to be decapsulated.


## Key Mapping

The Key Server maintains a Key Mapping for every needed Key Series. A Key
Series corresponds exactly to a unique Attribute Set and represents the
succession of Keys used to secure Envelopes which possess that Attribute Set. A
Key Server maintains a Key Series for every Attribute Set in use.

A Key Series is essentially a temporal sequence of Keys which are used to
encrypt Messages and decrypt Envelopes for a given Attribute Set. At any given
point in time, a Key Series has a Current Key which is used to encapsulate any
new Messages. Previous keys in a Key Series are retained indefinitely so that
older Envelopes can be decapsulated. Periodically, the Current Key in a Key Series
is replaced with a new Key, which thereby becomes the Current Key.

The Rollover of a Key Series serves several functions. A Key Series maps
uniquely and exactly to a unique Attribute Set. The set of Principals permitted
to Decapsulate Envelopes for a unique Attribute Set may expand and contract
over time, as policy or the authorization granted to a specific Principal
changes. Therefore, Rollover of a Key Series is frequently necessary to
facilitate the following invariants:

- **No access after revocation.** A revoked Principal cannot decapsulate
  Envelopes created after the time of revocation.

- **No access before authorization.** A newly authorized Principal cannot
  decapsulate Envelopes created prior to the time of authorization (where such
  a restriction is desired).

For keys which are allowed to be exported from the Key Server for in-memory use
(Non-Captive Keys), any contraction *or* expansion in the set of authorized
Principals must cause the rollover of a Key Series to enforce the above
invariants. For Captive Keys, which never leave the Key Server and are held
captive by it, this is optional, as the Key Server can enforce the updated
policy. Non-Captive Keys therefore avoid the need for a Client to continually
query the Key Server and is therefore more performant, at the cost of being
less secure.

A Key Server thus conceptually manages the set of all Key Series (essentially,
the set of all possible Attribute Sets), each of which represents a temporal
succession of actual Keys:

<figure style="text-align: center;"><img src="/images/cabe-key-series.svg" alt="CABE Key Series"/></figure>

Each time period for a given Key in a Key Series is called a Key Epoch.

A Key may exist but this does not necessarily mean it needs to be stored
persistently. Derived Keys are Keys which are derived deterministically from
other Keys in a hierarchy. On the other hand, actual generation of new Keys
based on new entropy, which are not derived from other Keys (Non-Derived Keys),
is often desirable to facilitate recovery from any leakage of any key material.
These considerations can be balanced to achieve a reasonable balance between
key storage requirements and security. Further discussion of possible key
derivation architectures can be found in the [CKAP](../ckap/) specification.

Both temporal and spatial partitioning of access are desirable properties.
Temporal partitioning refers to enlargement or contraction of the authorized
Principals over time for a given Attribute Set as shown above. Spatial
partitioning is better achieved by simply using a suitably designed metadata
scheme to construct suitable Attribute Sets.

## Key Resolution

The Key Server automatically maintains the Key Mapping as needed. A Client then,
as needed, requests a Key from the Key Server. This process is known as Key
Resolution.

There are two circumstances in which Key Resolution occurs:

- **Prograde resolution.** When a Client wants to Encapsulate a Message, and
  desires the Current Key for the relevant Key Series given the Message's
  Attribute Set;

- **Retrograde resolution.** When a Client wants to Decapsulate an Envelope,
  and desires the Key which was used to create the Envelope (which may not be
  the Current Key).

### Prograde Resolution

In Prograde Resolution, the Client sends the relevant Attribute Set to the Key
Server and requests a Lease Key to use for the purposes of constructing an
encrypted Envelope. The Key Server determines whether the Principal should be
allowed to access the given Key Series according to its configured Policy, and
if allowed, creates a Lease and returns information about it.

A Lease provides the following information:

- Lease Key Access Information (LKAI), which is information needed for Key Access to the Lease Key, namely:

    - In the case of a Non-Captive Key, this is the memory image of the Lease Key itself;

    - In the case of a Captive Key, this is an opaque reference token (the
      Lease Key Access Token (LKAT)) which can be used to make subsequent calls
      to the Key Server to perform assisted Encapsulation or Decapsulation
      using the Lease Key.

- A Lease Reference, which is an opaque byte string which a Client can quote to
  a Key Server to facilitate subsequent Key Access to the same Lease Key, by
  performing Retrograde Key Resolution.

- The point in time at which the Lease expires.

**Caching.** The purpose of this design is to facilitate caching. Once Prograde
Resolution has been performed, a given Client does not need to perform it again
for every single Message it wishes to Encapsulate for the same Attribute Set,
up until the expiry time of the Lease.

**Temporal imprecision of key selection.** However, this mechanism is not
exact, nor is it intended to be. The lease expiry time can only account for
Synchronous Rollover of a Key Series. Factors such as clock skew, or events
which cause Asynchronous Rollover, can cause the Current Key for a Key Series
to change suddenly, in which case a Client might continue to encapsulate
Messages with an out of date Lease Key (which is derived from the Current Key)
for some period of time (the Rollover Period).  Further discussion of the
issues around this can be found in the [CKAP specification](../ckap/).

### Retrograde Resolution

Retrograde Resolution is performed when decapsulating Envelopes into Messages.
Unlike Prograde Resolution, a Key was already chosen when the Envelope was
created, which is specifically requested by the Client, as it is the only Key
which can be used to decapsulate the Envelope.

Each Envelope's header contains a Lease Reference which is an opaque byte
string uniquely identifying a previously issued Lease Key to a Key Server. The
Client quotes this Lease Reference to the Key Server, which verifies the
Principal's access according to its Policy before providing the result of the
resolution process. The Client can then proceed to Key Access in the same way
as for Prograde Resolution.

Due to the temporal imprecision noted in the previous section, the Key chosen
to derive a Lease Key used to create a given Envelope may not have been the
Current Key at the time the Envelope was created. Thus, Lease Keys are
identified by a unique Lease Reference rather than being inferred from an
Envelope timestamp.

## Key Access

In the case of a Non-Captive Key, Key Access is straightforward as it is
provided directly in the Key Server's response. The means by which the Lease Key
is used to create Envelopes is discussed in detail in the [CBES](../cbes/)
specification.

In the case of a Captive Key, direct access to the Lease Key's bit pattern is
not available. Instead, a Client makes Assisted Encapsulation/Decapsulation
calls to the Key Server.

Since these merely perform cryptographic operations on temporal keys used to
encrypt a specific Message, the bandwidth consumed by these calls is a function
of the number of Messages encrypted, not the size of the Messages encrypted.

An advantage of the use of Captive Keys is that there is no Rollover Period in
which an updated Policy is not yet fully effective, as a new Policy can begin
being enforced immediately by the Key Server.

On the other hand, the need for interaction with the Key Server for each
encapsulation or decapsulation operation means that performance is bounded by
the round-trip time between the Client and the Key Server, though this can be
ameliorated by pipelining.

## Architectural Invariants

The following invariants are worth noting explicitly:

- There is a 1:1 mapping between a given unique Attribute Set and a Key Series.

- A Key Series is an ordered sequence of non-overlapping Key Epochs.

- Each Key Epoch has exactly one Set Key.

- A given Envelope is bound to exactly one Lease Key and Lease Reference.

- A Lease Reference identifies exactly one Lease Key within a Domain.

- A Lease Key is derived from a specific Set Key in a specific Key Epoch.

# References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [RFC 5234](https://www.rfc-editor.org/rfc/rfc5234#section-6.1): *Augmented BNF for Syntax Specification: ABNF*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CBOR)*

# Colophon

**Author**<br/>
[Hugo Landau](mailto:hl@messier42.com)

