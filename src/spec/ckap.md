---
title: "CABE Key Access Protocol (CKAP)"
draft: "CKAP"
status: "Active Draft"
date: "April 2026"
abstract: "This document specifies the CABE Key Access Protocol (CKAP)."
---

# Introduction

# Architectural Overview

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in BCP 14 when, and only when, they
appear in all capitals, as show here.

The following terms are defined:

- **Domain**: A CABE deployment comprising a Key Server and one or more Clients.

- **Attribute**: A key-value pair defining circumstances in which access to
  protected information may be made, or an item of metadata relating to any
  given item of protected information.

- **Attribute Key**: The key of a key-value pair in an Attribute, which is a textual, human-readable string of non-zero length and matching the grammar given in Annex A.

- **Attribute Value**: A CBOR (RFC 8949) data item within the CBOR Basic Data Model.

- **Attribute Set**: A set of Attributes in relation to a Key, Message or Principal.

- **Message Set**: The set of Messages with a given Attribute Set. (This
  definition is conceptual, as the set of Messages with a given Attribute Set
  is infinite and not countable.)

- **Principal**: An entity which encapsulates, de-encapsulates, or both encapsulates and
  de-encapsulates Messages, which possesses an Attribute Set characterising the
  entity for the purposes of determining what Messages it is permitted to
  produce or consume.

- **Client**: The component of a Principal which implements CKAP, and which
  communicates with a Key Server.

- **Key Server**: A server which responds to requests by Clients to facilitate
  encryption or decryption of Messages, and which manages an arbitrarily large
  set of Keys.

- **Key**: A secret value used, directly or indirectly, to encrypt and decrypt
  Messages. A Key is either Captive or Non-Captive, and is either Derived or Non-Derived, and is either an Internal Key or an Access Key.

- **Captive Key**: An Access Key which a Key Server does not disclose to any
  Client, but provides managed encryption and/or decryption for.

- **Non-Captive Key**: An Access Key which a Key Server is willing to provide a
  copy of to a suitably authorized Client, so that it can decrypt corresponding
  Messages without further interaction with the Key Server.

- **Key Series**: A chronological series of Keys all possessing the same
  associated Attribute Set. The Keys in a Key Series are totally ordered and
  each Key in a Key Series corresponds to an integral number of consecutive Key
  Epochs.

- **Key Epoch**: A quantum of time used to manage the rollover of Keys in
  an arbitrarily large number of Key Series managed by a Key Server.

- **Key Mapping**: The process of mapping Attribute Sets to Keys, as managed by
  a Key Server.

- **Key Resolution**: The operation of resolving an Attribute Set to a Key upon
  request by a Client, in accordance with the Key Server's Key Mapping, and in
  the context of a suitably authorized Principal.

- **Key Access**: The process in which a Client obtains (for a Non-Captive
  Key), or indirectly makes use of (for a Captive Key) a Key, for the purposes
  of facilitating access to a Message Set.

- **Non-Derived Key**: A Key which is directly derived from an entropy source and therefore must be stored by a Key Server if it is to be subsequently recalled.

- **Derived Key**: A Key which is derived from another Key (which in turn may
  be a Non-Derived Key or a Derived Key), and which therefore does not need to
  be stored by a Key Server in order to be subsequently re-derived.

- **Internal Key**: A Key which is used internally by the Key Server to derive
  one or more Derived Keys but which is never disclosed to any Client.

- **Access Key**: A Key which is not an Internal Key and which is available for
  Clients to use.

- **Set Key**: An Access Key assigned to a given Message Set at a given point in time.

- **Policy**: An arbitrary rule or logic used by a Key Server to determine
  which Principals may access which Message Sets. The nature of a Policy is not
  defined in this specification, and is left as an implementation detail.

- **Access**: Generically, access to a Message Set or Key refers to the right
  to both produce Messages (i.e., encipher Messages using a Key) and consume
  Messages (i.e., decipher Messages previously encrypted using a Key).

- **Rollover**: The process by which a new Key Epoch is created for a Key
  Series, with a new assigned Set Key.

- **Synchronous Rollover**: Rollover which occurs predictably and on a
  chronological schedule.

- **Asynchronous Rollover**: Rollover which can occur unpredictably at any time
  in response to arbitrary system events, such as the addition of newly
  authorized Principals, the revocation of existing Principals, or at operator
  request.

# Key Schedule

## Objectives

A Key Server maintains a set of keys to support ABAC-driven data access control objectives. In particular, the following objectives are given primary importance:

- A Principal is only able to access Message Sets which it is authorized to access, as determined by an unspecified (implementation-specific) policy logic which takes as input (at a minimum) the Attribute Sets of the Principal and the Message Set.

- A Principal newly authorized to access a given Message Set is not able to access Messages in the Message set prior to the point in time at which they were authorized, unless such retroactive access is explicitly desired at the time of authorization.

- A Principal whose authorization to access a given Message Set is revoked is not able to access Messages in a Message Set created after the time of the revocation.

- The number of Attribute Sets used by the system is unbounded and is not guaranteed to be small.

## Overview

To support these objectives, a Key Server maintains multiple Key Series and
multiple Key Epochs. A Key Series represents the temporal and contiguous
sequence of Keys maintained for a given Attribute Set. A Key Epoch represents
one contiguous unit of time for which a given Key Series uses a given Key as its current Key.

A Key Series rolls over into a new Key Epoch, causing rotation of the current Key in that Key Series, for one or more of the following reasons:

- Periodically, as part of routine key rotation.

- When a new Principal is authorized to access the Message Set associated with
  a Key Series. This ensures that when the new Key is disclosed to the newly
  authorized Principal, it does not enable the Principal to access Messages
  created before it was so authorized.

- When a presently authorized Principal is revoked from having access to the
  Message Set associated with a Key Series. This ensures that the revoked
  Principal does not have access to Messages created after revocation.

- At operator discretion.

## Derivation Tree

This specification intentionally does not constrain or define the internal
storage architecture of a Key Server, which is left unspecified. A Key Server
may adopt whatever internal Key storage mechanisms it desires so long as it
correctly implements this specification. Nonetheless, this section discusses a
suggested key storage architecture likely to be suitable for many
implementations.

A Key Server can ensure it is able to reproduce a specific Key either by
storing it or, in the case of a Derived Key, by re-deriving it as needed from
another Key. Several strategies are available:

### Single Root Key (SRK)

A Key Server can, if desired, be implemented with only a single Non-Derived Key
which never changes, and use it to derive all other Keys. This has the
advantage that the storage requirements of the Key Server are O(1) with respect
to the number of Message Sets in play; however, it also carries the associated
disadvantage that new entropy is never injected into the system, and there is
therefore no temporal recovery from the compromise of the single Non-Derived
Key, compromise of which catastrophically and permanently compromises the
entire Domain. Therefore, implementations SHOULD NOT use this approach.

### Single Temporal Root Key (STRK)

In this approach, a Key Server maintains a single Root Key Series of Internal,
Non-Derived Keys. All Keys are derived, directly or indirectly, from the
current (or a previous) temporal Internal Key. Periodically, either on a
schedule or on demand as deemed warranted by an operator, a Key Server chooses
to roll the Root Key, creating a new Root Key Epoch with a new Root Key in the
Root Key Series. Each Root Key is a Non-Derived Key which incorporates new
entropy, and must be securely stored by the Key Server.

This approach has the advantage that the storage requirements of the Key Server
are O(N) with respect to the amount of time the Key Server has been operating,
but do not scale with regards to the number of Message Sets in play.

This approach allows a Key Server to recover from a point-in-time compromise of
its key storage by causing subsequent Key Epochs to be derived from new entropy
post compromise.

### Captive v. Non-Captive Keys

For Access Keys used by a Client, Keys can either be kept Non-Captive and their
full image can be distributed to a Client securely, or be kept Captive, in
which a Key Server does not disclose the Key but performs operations using it
on behalf of a Client ("glovebox operation").

Similar tradeoffs can be made by a Key Server's own internal Key Schedule. For
example, an implementation could use a purely software, in-process
implementation of STRK Root Key storage (Non-Captive Keys), or could choose to
store Root Keys in an external cryptographic device such as a TPM or HSM from
which exportation of the key material is restricted. Where a captive key
storage device exhibits significant performance restrictions, careful design of
a key derivation schedule can ameliorate this, at the cost of in-memory
duplication of temporal keys with the associated risks.

### Captive 2-Level Root Key (C2LRK)

This is an example of a hybrid approach which uses Captive Keys and temporal
injection of new entropy but which places a load on a key storage device which
is fixed and does not scale with the load placed on the Key Server by Clients
or number of Message Sets in play.

A key storage device maintains a single Root Key Series, each Key of which is a
non-derived Key. Because each new Key in the Root Key Series must be
permanently stored, the Root Key Epoch has a relatively long duration, such as
a few days, or even longer.

The current Root Key is then used to derive a Sub-Root Key which can be stored
in-memory and used as needed. Because the Sub-Root Key is a Derived Key, the
Sub-Root Key Epoch can be much narrower, on the order of minutes or hours. A
Key Server can re-derive a Sub-Root Key as needed by communicating with the key
storage device, and maintain an in-memory cache of Sub-Root Keys which can be
evicted as needed without consequence.

## Rollover Handling

When a Key Series is rolled over, causing creation of a new Key Epoch for that
Key Series, a new derived or non-derived, captive or non-captive Set Key is
created for that Key Series-Key Epoch intersection, and the Key Server begins
using that Set Key for all future key resolution requests for the relevant
Message Set.

Clients do not necessarily transition to use of the new Set Key for a given
Message Set instantaneously, for several reasons.

Firstly, because encapsulating a large number of Messages within a given
Message Set would cause excess load on a Key Server if every such encapsulation
operation required a separate Key Resolution request to be made to the Key
Server, the caching of Key Mapping decisions for a given Client is a practical
necessity.

Some events causing key rollover (such as periodic scheduled rollover) are predictable, and the invalidation of cache entries can be handled by placing an expiry timestamp in key resolution results indicating when the resolution decision is expected to no longer be current for a given Message Set.

However, this is not entirely effective as clocks may not be synchronized
between client and server. Further, Key Series rollover may happen not just on
a schedule ("synchronous rollover") but also unpredictably and without warning,
for example if requested by an operator, or if an authorized principal is added
or removed ("asynchronous rollover").

Therefore, the possibility of a Client encapsulating a message using a
non-current Set Key cannot be eliminated. For this reason, the correct Set Key
to de-encapsulate a previously encapsulated Message cannot be determined solely
from the Message's timestamp. Therefore, CABE-BASE incorporates header
information adequate both to determine the applicable Message Set but also the
Key Epoch and Set Key within the relevant Key Series, independently of any
timestamp information the Message may contain.

The period in which Clients are liable to encapsulate messages with non-current
Set Keys is referred to as the Rollover Period. It is desirable to minimise the
duration of this period, as system invariants (such as newly authorized
Principals not being able to access old Messages) are not fully enforced during
it.

This is accomplished via the following means:

- Key Resolution results contain an expiry. This can be set to the time at
  which routine Key Series rollover is anticipated; however, it can also be set
  to a shorter time (such as a few seconds) to minimise the duration of any
  Rollover Period in the event of an asynchronous rollover.

- Explicit cache invalidation is provided by an asynchronous, publish-subscribe
  event notification mechanism which clients SHOULD implement.

# Key Resolution

Fundamentally, a Key Server exists to perform Key Resolution operations as
requested by Clients. Key Resolution is the operation by which a Client
requests a Key to use for a given Message (whether to encapsulate or
de-encapsulate said Message) and is assigned a corresponding Key as determined
by the Key Server's Key Mapping.

The process is as follows:

1. A Client determines that it wishes to encapsulate a Message, or
de-encapsulate a Message, and that it does not presently have knowledge of a
Key which is mapped to the Message Set in question.

2. A Client sends a Key Resolution (ResolveKey) request to the Key Server.

3. The Key Server considers the credentials of the Client and determines the
relevant Principal of the Client (authentication).

4. The Key Server determines the relevant Key for the requested Message Set in accordance with its internal Key Mapping.

5. The Key Server makes an authorization decision in accordance with its configured policy, using (at a minimum) the Attribute Set of the Message Set, and the Attribute Set of the Principal, as inputs. The result of this decision is Allow or Deny.

6. If the result of the authorization decision was Allow, the Key Server
determines whether to provide Captive or Non-Captive access to the relevant
Key:

   a. If the key is a Non-Captive Key, the Key Server provides the image
      of the Key to the Client.

   b. If the key is a Captive Key, the Key Server provides an opaque,
      time-limited reference which the Client can quote to the Key Server in
      Encapsulate or Decapsulate operations to have it perform the
      Encapsulation or Decapsulation without revealing the Key's memory image.

# Abstract Service Interface

This section defines the *abstract* interface between a Client and a Key Server. This provides a conceptual understanding of the operations available to a Client and the domain of discourse independent of the specific transport and protocol in use.

```typescript
interface CKAP {
  GetSelf(GetSelfRequest): GetSelfResponse
  ResolveKey(ResolveKeyRequest): ResolveKeyResponse | Error
  AssistedEncapsulate(AssistedEncapsulateRequest): AssistedEncapsulateResponse | Error
  AssistedDeencapsulate(AssistedDeencapsulateRequest): AssistedDeencapsulateResponse | Error
}

message GetSelfRequest {}

message GetSelfResponse {
  // An arbitrary URI uniquely identifying the Principal which made the GetSelf()
  // call.
  PrincipalURI: string

  // The Attribute Set associated with the Principal.
  PrincipalAttributeSet: AttributeSet
}

message ResolveKeyRequest {
  ObjectAttributeSet: AttributeSet
  KeyReference?: bytes
  NotificationToken?: string
}

message ResolveKeyResponse {
  // Opaque string
  DecisionID: string
  ResolvedKey: CaptiveResolvedKey | NonCaptiveResolvedKey
}

message NonCaptiveResolvedKey {
  UniqueID: string
  KeyReference: bytes

  Key: COSEKey
}

message CaptiveResolvedKey {
  // Unique key identifier.
  UniqueID: string
  KeyReference: bytes

  PermittedActions: {
    Encrypt: bool
    Decrypt: bool
  }

  // Opaque capability token granting access to this captive key.
  Token: bytes

  // Time at which this capability token expires.
  TokenExpireTime: Time
}

message Error {
  // A standard error code.
  Code: int32

  // A short, one-line error description.
  Summary: string
}
```

# Protocol Fundamentals

CKAP is an HTTP-based protocol. It is independent of any specific HTTP protocol
but can use any transport compliant with HTTP semantics.

Due to the sensitive nature of CKAP operations, and since CKAP is used to transport key material, Transport Layer Security (TLS) MUST be used.

A CKAP server has a base URL which is used to access it, such as `https://example.com/ckap/`. Except where otherwise specified, operations in the abstract service interface defined in the previous section are uniformly converted to HTTP POST requests by appending a '/' (if not already present) to the base URL and the name of the operation. The request message is serialized as CBOR, as is the response.
The `Content-Type` and `Accept` headers MUST be specified.

```
POST /ckap/ResolveKey HTTP/1.1
Authorization: ...
Accept: application/ckap+cbor
Content-Type: application/ckap+cbor

...CBOR-encoded request message...

HTTP/1.1 200 OK
Content-Type: application/ckap+cbor

...CBOR-encoded response message...
```

In the event of an error, an HTTP error status code is returned. The response
body is a CBOR-serialized Error message.

The serialization of Request and Response messages has a field "Kind" inserted
to ensure that all valid byte strings under the `application/ckap+cbor` content
type are unambiguous. This field MUST be set to the name of the message type
(e.g. `GetSelfRequest`, `Error`).

# Protocol Operations

## Key Resolution

## Asynchronous Resolution Invalidation Notification

A Client SHOULD implement Asynchronous Resolution Invalidation Invalidation
Notification (ARIN). This is an HTTP Server-Sent Events (SSE) mechanism by
which a Client can be notified that a previously communicated key resolution
response is no longer valid.

A Client implements ARIN by retrieving an HTTP SSE resource:

```
GET /ckap/ARIN HTTP/1.1
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream
```

Each event returned by the event stream is one of the following event types. The event type name correpsonds to the `event:` field of SSE.

A Client always receives a `token` event as the first event when connecting to
an SSE stream. Subsequent `token` events MAY be sent by the server to roll the
token to a new value. Clients MUST use the most recently received `token`
value. If a connection is lost, the Client resumes an existing stream by
specifying the `token` query string parameter in the URL with the most recently
received token value.

Every event MUST have an `id:` field as per the SSE specification. A Client
MUST use the `Last-Event-ID` mechanism when reconnecting and a Key Server MUST
implement this to replay lost events. A Key Server MAY drop events when
reconnection does not occur for an extended period. This interval SHOULD be
chosen according to the expiration times issued in Key Resolution responses to
avoid the possibility of missed invalidations.

The event types are:

### `token`

This specifies an opaque token the Key Server generates which the Client can
use as a reference to assign Key Resolution decisions to a given ARIN
notification stream. The `data:` field contains the opaque textual token
string.

If the Client reconnected to the SSE endpoint by passing a token in the query
string, this event is still emitted, with the same or a different token. The
Client must switch to using the token most recently provided in a `token` event
for all future interactions.

### `invalidate`

This specifies the invalidation of a prior Key Resolution response. The `data:`
field is simply the unique ID (`decisionID`) of the Key Resolution response.

# Security Considerations

# Annex A: Attribute Key Grammar

The following ABNF determines the valid Attribute keys:

```ABNF
ATTRIBUTE_KEY   = 1*ALNUM *('-' 1*ALNUM)
```

Attribute keys may not exceed 255 characters.

Attribute keys are case sensitive.
