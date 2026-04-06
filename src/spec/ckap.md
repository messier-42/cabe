---
title: "CABE Key Access Protocol (CKAP)"
draft: "CKAP"
status: "Active Draft"
date: "April 2026"
abstract: "This document specifies the CABE Key Access Protocol (CKAP)."
---

# Introduction

This document specifies the Concise Attribute-Bound Encapsulation (CABE) Key
Access Protocol (CKAP). It comprises one of the core specifications of the CABE
Architecture, as defined in the [CABE Architecture Specification](../arch/).

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in [BCP
14](https://www.rfc-editor.org/info/bcp14) when, and only when, they appear in
all capitals, as shown here.

All definitions given in the [CABE Architecture Specification](../arch/) are
reused for the purposes of this document.

# Key Schedule

## Overview

To support the objectives given in [CABE-ARCH](../arch/), a Key Server
maintains multiple Key Series and multiple Key Epochs. Key Series represents
the temporal and contiguous sequence of Keys maintained for a given Attribute
Set. A Key Epoch represents one contiguous unit of time for which a given Key
Series uses a given Key as its current Key.

A Key Series rolls over into a new Key Epoch, causing rotation of the current Key in that Key Series, for one or more of the following reasons:

- Periodically, as part of routine key rotation.

- When a new Principal is authorized to access the Envelope Set associated with
  a Key Series. This ensures that when the new Key is disclosed to the newly
  authorized Principal, it does not enable the Principal to access Envelopes
  created before it was so authorized.

- When a presently authorized Principal is revoked from having access to the
  Envelope Set associated with a Key Series. This ensures that the revoked
  Principal does not have access to Envelopes created after revocation.

- At operator discretion.

## Derivation Tree

This specification intentionally does not constrain or define the internal
storage architecture of a Key Server, which is left unspecified. A Key Server
may adopt whatever internal Key storage mechanisms it desires so long as it
correctly implements this specification. Nonetheless, this section discusses
suggested key storage architectures likely to be suitable for many
implementations.

A Key Server can ensure it is able to reproduce a specific Key either by
storing it or, in the case of a Derived Key, by re-deriving it as needed from
another Key.

There are always at least two levels in the derivation tree: Set Keys and Lease
Keys, which necessarily are derived from Set Keys. The number of levels in the
derivation tree above Key Series and their associated Set Keys is
implementation-specific.

As regards the design of the key derivation tree, several strategies are
available:

### Single Root Key (SRK)

A Key Server can, if desired, be implemented with only a single Non-Derived Key
which never changes, and use it to derive all other Keys. This has the
advantage that the storage requirements of the Key Server are O(1) with respect
to the number of Envelope Sets in play; however, it also carries the associated
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
but do not scale with regards to the number of Envelope Sets in play.

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
Key Series, a new Derived or Non-Derived, Captive or Non-Captive Set Key is
created for that Key Series-Key Epoch intersection, and the Key Server begins
using that Set Key for all future Prograde Key Resolution requests for the
relevant Envelope Set.

Clients do not necessarily transition to use of the new Set Key (or more
specifically a new derived Lease Key) for a given Envelope Set instantaneously,
for several reasons.

Firstly, because encapsulating a large number of Messages within a given
Message Set would cause excess load on a Key Server if every such encapsulation
operation required a separate Prograde Key Resolution request to be made to the
Key Server, the caching of Key Mapping decisions for a given Client is a
practical necessity. Thus, each Prograde Key Resolution request results In
creation of a cacheable Lease object.

Some events causing key rollover (such as periodic scheduled rollover) are
predictable, and the invalidation of cache entries can be handled by placing an
expiry timestamp in key resolution results indicating when the resolution
decision is expected to no longer be current for a given Envelope Set.

However, this is not entirely effective as clocks may not be synchronized
between client and server. Further, Key Series rollover may happen not just on
a schedule ("Synchronous Rollover") but also unpredictably and without warning,
for example if requested by an operator, or if an authorized principal is added
or removed ("Asynchronous Rollover").

Therefore, the possibility of a Client encapsulating a message using a
non-current Lease Key (that is, a Lease Key derived from a non-current Set Key)
cannot be eliminated. For this reason, the correct Set Key to de-encapsulate a
previously encapsulated Envelope cannot be determined solely from the Envelope's
timestamp.  Therefore, [CBES](../cbes/) incorporates header information
adequate both to determine the applicable Envelope Set but also the specific Lease Key
which was used to create it, independently of any timestamp information the
Envelope may contain.

The period in which Clients are liable to encapsulate messages using non-current
Lease Keys is referred to as the Rollover Period. It is desirable to minimise the
duration of this period, as system invariants (such as newly authorized
Principals not being able to access old Messages) are not fully enforced during
it.

This is accomplished via the following means:

- Lease objects returned from Prograde Key  Resolution results contain an
  expiry time. This can be set to the time at which routine Key Series rollover is
  anticipated; however, it can also be set to a shorter time (such as a few
  seconds) to minimise the duration of any Rollover Period in the event of an
  asynchronous rollover, while still facilitating some level of caching.

- Explicit cache invalidation is provided by an asynchronous, publish-subscribe
  event notification mechanism which clients SHOULD implement, defined below.

# Abstract Service Interface

This section defines the *abstract* interface between a Client and a Key
Server, which is independent of the specific transport used to realise a CKAP
service. Abstractly, a CKAP service provides five core operations:

- **GetSelf**, which allows a Client to obtain information about its own
  identity as the Key Server perceives it (similar to shell commands such as `id`
  or `whoami`);
- **Prograde**, which implements Prograde Key Resolution and creates a Lease; 
- **Retrograde**, which implements Retrograde Key Resolution;
- **AssistedEncapsulate**, which facilitates Key Access to a Captive Key by
  wrapping a CEK;
- **AssistedDecapsulate**, which facilitates Key Access to a Captive Key by
  unwrapping a CEK.

Each operation is defined in terms of a Request structure named `xRequest` and
a Response structure `xResponse` for some operation named `x`. Each operation
can result in an `xResponse` structure or in the `Error` structure. All
structures are CBOR data items defined in terms of CDDL ([RFC
8610](https://www.rfc-editor.org/rfc/rfc8610.html)).

## Common Structures

This section defines CBOR structures common to several operations.

```cddl
AttributeSet = {
  / MUST conform to the restrictions on Attribute Sets
    as defined in CABE-ARCH /
  * text => any
}
```

## Error

The Error structure may be returned instead of any `xResponse` structure.

The following fields are required:

- `errorCode`, an integral error code as defined in Annex A.

- `summary`, a brief one-line textual error string describing the error.

More details about an error can be included by including the optional `details`
field. This field must be a CBOR map, but its specific usage is unspecified.

```cddl
Error = {
  errorCode: int,
  summary: text,
  ? details: { * text => any }
}
```

## GetSelf

The GetSelf operation takes no arguments and allows a Client to determine
information about the Principal it acts as in the perspective of the Key
Server.

The information returned includes:

- A URI which uniquely identifies the Principal, which MUST be reported by the
  Key Server;

- The Claims attached to the Principal, which the Key Server MAY choose to
  report.

```cddl
Claims = {
  * text => any
}

GetSelfRequest = {
  kind: "GetSelfRequest"
}

GetSelfResponse = {
  kind: "GetSelfResponse",

  / Information about the Principal. /
  principal: {
    uri: tstr,
    ? claims: Claims
  },
  / Unspecified server information. /
  serverInfo: {
    * text => any
  }
}
```

## Prograde

The Prograde operation implements Prograde Key Resolution.

```cddl
ProgradeRequest = {
  kind: "ProgradeRequest",
  attributeSet: AttributeSet,

  / Optional ARIN token to subscribe the created lease into an ARIN stream. /
  ? arinToken: bstr
}

ProgradeResponse = {
  kind: "ProgradeResponse",
  / The created lease. /
  lease: Lease
}

Lease = {
  / A lease identifier used solely for purposes of invalidation. It does not need
    to be unique beyond the scope of the Key Server process's lifespan.
    It MUST be present if an ARIN Token was quoted in the ProgradeRequest
    and MAY be omitted otherwise. /
  ? leaseID: tstr,
  / The opaque Lease Reference. /
  leaseRef: bstr,
  / The Key Server may optionally report back the Attribute Set pertaining to the lease. /
  ? attributeSet: AttributeSet,
  / The LKAI for the Lease Key. /
  lkai: LKAI,
  / The expiry time as a CBOR integral UNIX timestamp (UTC). /
  expiry: time
}

LKAI = {
  / There MUST be exactly one of these fields present. 
    A Client MUST reject a LKAI with both present, or with any other field present. /
  ? nonCaptive: LKAI_NonCaptive,
  ? captive: LKAI_Captive
}

LKAI_NonCaptive = {
  / COSE Key object with symmetric 'k' /
  leaseKey: COSE_Key
}

LKAI_Captive = {
  / The Lease Key Access Token for use with the Assisted Encapsulate
    and Decapsulate operations. /
  leaseKeyAccessToken: bstr
}
```

## Retrograde

```cddl
RetrogradeRequest = {
  kind: "RetrogradeRequest",
  / The Attribute Set of the Envelope causing the Retrograde request. /
  attributeSet: AttributeSet,
  / The Lease Reference quoted in the Envelope causing the Retrograde request. /
  leaseRef: bstr
}

RetrogradeResponse = {
  kind: "RetrogradeResponse",
  / The Key Server may optionally report back the Attribute Set pertaining to
    the retrograde request. /
  ? attributeSet: AttributeSet,
  / The LKAI for the Lease Key. /
  lkai: LKAI
}
```

## AssistedEncapsulate

```cddl
AssistedEncapsulateRequest = {
  kind: "AssistedEncapsulateRequest",
  / The Lease Key Access Token in an LKAI_Captive structure. /
  leaseKeyAccessToken: bstr,
  / The unencrypted Content Encryption Key to be wrapped. /
  cek: bstr
}

AssistedEncapsulateResponse = {
  kind: "AssistedEncapsulateResponse",
  / The newly wrapped Content Encryption Key. /
  wrappedCEK: bstr
}
```

## AssistedDecapsulate

```cddl
AssistedDecapsulateRequest = {
  kind: "AssistedDecapsulateRequest",
  / The Lease Key Access Token in an LKAI_Captive structure. /
  leaseKeyAccessToken: bstr,
  / The wrapped Content Encryption Key to be unwrapped. /
  wrappedCEK: bstr
}

AssistedDecapsulateResponse = {
  kind: "AssistedDecapsulateResponse",
  / The unencrypted Content Encryption Key. /
  cek: bstr
}
```

# HTTP Transport

## Requirements

CKAP is currently defined with an HTTP-based transport. Other transports could
be defined in the future. The HTTP transport is independent of any specific
HTTP protocol but can use any transport compliant with HTTP semantics (e.g.
HTTP/1.1, HTTP/2, HTTP/3).

Due to the sensitive nature of CKAP operations, and since CKAP is used to
transport key material, Transport Layer Security (TLS) or a comparable channel
security mechanism MUST be used.

A CKAP server has a base URL which is used to access it, such as
`https://example.com/ckap/`. Except where otherwise specified, operations in
the abstract service interface defined in the previous section are uniformly
converted to HTTP requests as follows:

- The request method shall be `POST`;

- The URL shall be formed by appending a '/' (if not already present) to the base URL and the name of the operation;

- The request `Content-Type` header and `Accept` header MUST both be specified as
  `application/ckap+cbor`;

- An informative `User-Agent` header SHOULD be specified;

- The request body of the request MUST be the `xRequest` structure, serialized as CBOR;

The Key Server MUST respond with a HTTP response constructed as follows:

- The response `Content-Type` header MUST be `application/ckap+cbor`, whether
  or not the response code is a success (2xx) code or a failure code.

- The response body is the CBOR serialization of either

  - the `xResponse` structure directly corresponding to the `xRequest` structure
    which was sent; or

  - the `Error` structure.

If an error occurs during processing of an operation and the Key Server
responds with an `Error` structure, the HTTP status code MUST be an error
status code. If the Key Server responds with an `xResponse` structure, the HTTP
status code MUST be 200.

## Example

An example HTTP/1.1 request is shown below:

```
POST /ckap/Prograde HTTP/1.1
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

The serialization of Request and Response messages has a field `kind` inserted
to ensure that all valid byte strings under the `application/ckap+cbor` content
type are unambiguous. This field MUST be set to the name of the structure (e.g.
`GetSelfRequest`, `Error`).

## Client Identity

It is REQUIRED that a Key Server implement a means of authenticating Clients
and assigning Principals to Clients based on a Client's authenticated identity.

CKAP does not define a specific mechanism for Client authentication. Key
Servers MAY use a mechanism of their choice to authenticate Clients and
associate Principals with them. In the case of the HTTP transport, this may
include client certificates presented during establishment of a TLS connection,
or a defined HTTP authentication scheme presented in the `Authorization`
header, any other mechanism, or some combination thereof.

# HTTP Asynchronous Resolution Invalidation Notification (ARIN)

A Client using the HTTP transport SHOULD implement Asynchronous Resolution
Invalidation Notification (ARIN). This is an [HTTP Server-Sent Events
(SSE)](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events)
mechanism by which a Client can be notified that a previously returned Lease is
no longer valid.

## Initialization

A Client initializes ARIN by obtaining an ARIN Token by issuing a GET request
for the `ARINToken` resource under the CKAP Base URL. The `Accept` header MUST
be set to `application/ckap+cbor`. For example:

```
GET /ckap/ARINToken HTTP/1.1
Accept: application/ckap+cbor
```

If the Key Server does not support ARIN, it MAY return a status code of 404
or 501 to indicate this.

If the Key Server supports ARIN, it generates a new ARIN Token and returns it
in the following CBOR-serialized structure. The `Content-Type` header MUST be
set to `application/ckap+cbor`:

```cddl
ARINTokenResponse = {
  arinToken: bstr
}
```

An ARIN Token is an opaque byte string generated by a Key Server to cross
reference an ARIN Session with Prograde Key Resolution requests and the Leases
produced by them.

An ARIN Token is a reference to an individual event stream (an ARIN Stream)
which can recover from connection loss. If an event is sent to an ARIN Stream
while no Client is connected to the SSE endpoint, it is buffered until
reconnection occurs or until the ARIN Stream and associated ARIN Token expires.

No events are sent to an ARIN Stream by default. In order to make use of ARIN,
the ARIN Token must be quoted in a Prograde Key Resolution request. If the
request is successful and results in a response, the created Lease has the
given ARIN Stream attached to it. If the Lease becomes expired or is otherwise
invalidated due to Synchronous or Asynchronous Rollover, an invalidation event
is sent to the associated ARIN Stream.

If multiple concurrent requests are made to the SSE endpoint for a given ARIN
Token, the Key Server MUST attempt to send invalidation events for the given
ARIN Stream to all ongoing SSE streams for it.

If an ARIN Stream and associated Token expires due to disuse, this does not
impact the lifespan of any related Lease; rather, it is simply detached from
any Leases it was previously attached to.

## Streaming

Having obtained an ARIN Token, a Client streams ARIN events by retrieving an
HTTP SSE resource. The URL is the resource `ARIN` beneath the CABE Base URL,
with an additional query string parameter `token` set to the ARIN Token, for
example:

```
GET /ckap/ARIN?token={arinToken} HTTP/1.1
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream
```

Each event returned by the event stream is one of the following event types.
The event type name corresponds to the `event:` field of HTTP SSE.

Every event sent by the Key Server MUST have an `id:` field as per the SSE
specification. A Client MUST use the `Last-Event-ID` mechanism when
reconnecting and a Key Server MUST implement this to replay lost events. A Key
Server MAY drop events reconnection does not occur for an extended period. This
interval SHOULD be chosen according to the expiration times issued in Leases to
avoid the possibility of missed invalidations.

If a Client attempts to begin an ARIN stream using an ARIN Token which is
invalid or expired, the Key Server MUST respond with an HTTP error status code
and MUST NOT stream a SSE response. In this case, the response SHOULD have a
`Content-Type` of `application/ckap+cbor` and a response body which is the CBOR
serialization of the `Error` structure defined in this specification.

The event types are:

### `invalidate`

This event type specifies the invalidation of a Lease. The `data:` field is
simply the `leaseID` which was returned with the Lease.

There is no requirement for `invalidate` events to be sent in any particular
order, or to only be sent once, including during replay when reconnecting using
`Last-Event-ID`. `invalidate` events MUST be idempotent. For a given ARIN
Stream used by a Client, a Client is expected to track the Leases that it has
received by Lease IDs. Clients MUST ignore `invalidate` events for Lease IDs it
does not recognise or it has already processed invalidation for. Lease IDs are
unique within the context of a given ARIN Token and ARIN Stream and MUST NOT be
reused within the context of a given ARIN Token or Stream.

# References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [CABE-ARCH](../arch/): *CABE Architecture Specification*
- [RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html): *Concise Data Definition Language (CDDL)*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CBOR)*
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html): *CBOR Object Signing and Encryption (COSE): Structures and Process*
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html): *CBOR Object Signing and Encryption (COSE): Initial Algorithms*
- [HTML-SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events): *HTML Standard — Server-Sent Events*

# Colophon

**Author**<br/>
[Hugo Landau](mailto:hl@messier42.com)
