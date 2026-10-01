
---
title: "CABE Federation and Resilience (CFAR)"
draft: "cfar"
status: "Version 1.0"
date: "September 2026"
abstract: "This document specifies the CABE Federation, Availability and Resilience (CFAR) specification."
---

# Introduction

A CABE Domain is a data processing environment which facilitates the Encapsulation of plain-text CABE Messages into encrypted CABE Envelopes and the subsequent Decapsulation of those same CABE Envelopes to obtain the corresponding plain-text CABE Messages. This occurs by virtue of a Client interacting with the CABE Domain's Key Service to obtain information (Lease Key Access Information, LKAI), such as key material, which can be used to perform Encapsulation or Decapsulation.

The sharing of information between CABE Domains is frequently desirable. Different CABE Domains may represent physically or geographically separated operating environments in which network communication is not directly possible, or is unreliable or intermittent, so-called Disconnected, Denied, Intermittent or Low-Bandwidth (DDIL) environments. In these circumstances, CABE Envelopes may still be passed between environments via arbitrary means, for example via alternate communication channels, or even by sneakernet. Facilitating mutual access to information originating from other CABE Domains, namely via Decapsulation of CABE Envelopes, is frequently a desirable goal even when network communication between an originating and receiving CABE Domain is not possible.

This specification defines extensions to the CABE Architecture and associated specifications to facilitate inter-domain federation of CABE Domains, facilitating access to CABE Envelopes originating from foreign federated CABE Domains, including under DDIL conditions.

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in [BCP
14](https://www.rfc-editor.org/info/bcp14) when, and only when, they appear in
all capitals, as shown here.

All definitions given in the [CABE Architecture Specification](../arch/) are
reused for the purposes of this document.

The architectural definitions given in [CABE-ARCH](../arch/) are expanded with the following additions:

- A **Domain ID** is a universally unique identifier for a CABE Domain. It is a textual string of non-zero length.

- A **Local Domain** refers to the CABE Domain which is the contextual perspective from which some operation is being performed or from the perspective of which an event is occurring.

- A **Foreign Domain** refers to any CABE Domain other than the Local Domain.

- An **Origin Domain** refers to the CABE Domain which produced some given Message or Envelope.

- A **Local Message** is a Message produced within the context of the Local Domain.

- A **Foreign Message** is a Message produced within the context of a Foreign Domain.

- A **Local Envelope** is an Envelope produced within the context of the Local Domain.

- A **Foreign Envelope** is an Envelope produced within the context of a Foreign Domain.

- A **Target Domain** refers to a CABE Domain in which context of the Decapsulation of a Foreign Envelope is being attempted.

- A **Federated Lease Package (FLP)** is a cryptographically protected unit of data which enables one or more Target Domains to derive or obtain the LKAI associated with a specific Lease of a given Origin Domain.

- A **Simple FLP (SFLP)** is a FLP which is protected using secure asymmetric encryption such that it can be decrypted only by a finite non-empty set of Target Domains and their respective Key Services.

- An **Advanced FLP (AFLP)** is a FLP other than a SFLP.

- **Target Domain Set** refers to a finite set of Target Domains each of which may potentially require access to a given Lease and the Envelopes produced using it, in the context of some given Origin Domain, and each of which is to be so facilitated.

- **Interbinding** refers to the process of determining the Target Domain Set (in the context of a given Origin Domain, Lease and one or more associated Envelopes) and ensuring that suitable FLPs are created or otherwise made available to the Target Domain Set.

- **Early Interbinding** refers to an Interbinding approach in which the Target Domain Set is determined as part of Prograde Resolution when a Lease is created.

- **Late Interbinding** refers to any Interbinding approach in which the Target Domain Set is identified and the access of which is facilitated subsequently to the creation of a Lease or subsequently to the creation of one or more associated Envelopes.

- **FLP Generation** refers to the process of generating one or more FLPs with respect to a given Lease, Origin Domain and Target Domain Set, independently of any subsequent propagation mechanism.

- **FLP Propagation** refers to the process by which any FLPs created by FLP Generation are made available to the corresponding Target Domains.

- **Propagation Mechanism** refers to a mechanism or channel via which FLP Propagation is accomplished. Propagation Mechanisms may vary greatly in latency, reliability or modality.

- **Inline Propagation** refers to a Propagation Mechanism in which one or more FLPs are carried in the headers of a CABE Envelope.

- **Sidecar Propagation** refers to a Propagation Mechanism in which one or more FLPs are transported alongside a CABE Envelope by an application using an application-specific mechanism.

- **Domain Propagation** refers to a Propagation Mechanism in which FLPs are transmitted over a network from an Origin Domain to a Target Domain.

- **Proactive Domain Propagation** refers to Domain Propagation in which the transmission of FLPs occurs prior to a given Target Domain's need for an FLP (i.e. to facilitate a Retrograde operation) arising.

- **Reactive Domain Propagation** refers to Domain Propagation in which the propagation of FLPs to a Target Domain occurs as and when requested by that Target Domain.

- **Federation Key (FK)** refers to an asymmetric cryptographic keypair used by a CABE Domain for federation purposes, and which comprises a Federation Public Key (FPK) and a Federation Secret Key (FSK).

- **Federation Public Key (FPK)** refers to the public part of a Federation Key.

- **Federation Secret Key (FSK)** refers to the secret (that is, private) part of a Federation Key.

- **Federation Key ID (FKID)** refers to a universally unique identifier assigned to each Federation Key.

- **Federation Key Rollover** refers to the process by which a Federation Key is retired and replaced.

# Federation Overview

Standard CABE performs Encapsulation and Decapsulation using symmetric keys (generically, LKAI). As such, the ability for a Foreign Domain to perform Decapsulation of a CABE Envelope requires that the given CABE Domain (referred to as the Target Domain) be able to obtain or derive the necessary LKAI without interactive dependency on the Origin Domain or any network infrastructure connecting the Origin and Target Domains.

Access is facilitated on a per-Lease basis. A given Target Domain is enabled to obtain the necessary LKAI for a Lease and thereby handle a Retrograde operation by virtue of a FLP. A FLP is a cryptographically secured data unit which enables a Target Domain to obtain the LKAI for a given Lease.

An Origin Domain produces an FLP for a given Target Domain when Interbinding occurs. Interbinding is the process by which an Origin Domain makes a Lease (and associated Envelopes) portable to a Target Domain by generating one or more FLPs.

This specification defines a federation architecture based around Early Interbinding. This is a form of Interbinding in which the Target Domain Set is determined at the time of a Prograde operation. Future specifications may define architectures facilitating Late Interbinding, wherein the Target Domain Set is not known at the time of a Prograde operation.

FLPs, once generated, must be propagated to a Target Domain's Key Service using a Propagation Mechanism. CABE Federation is agnostic to the Propagation Mechanism which is used; this specification defines certain basic Propagation Mechanisms, but does not preclude the definition or use of other Propagation Mechanisms.

The Simple FLPs (SFLPs) used by this specification rely on asymmetric encryption primitives, via a federation key (FK) published by each CABE Domain participating in federation. This FK is rotated periodically. Other FLP formats may be defined by other specifications; such FLPs are not required to use the same cryptographic mechanisms or a Domain's FK as defined in this specification, or even to use asymmetric encryption.

A common scenario envisaged by this specification is the use of Inline Propagation. In Inline Propagation, a Prograde operation handled by the Origin Domain's Key Service causes generation of a Lease. The Target Domain Set is determined by the Origin Domain's Key Service, a form of Early Interbinding. One or more FLPs are generated and are provided to the Client performing Encapsulation along with the Lease. The Client includes the FLPs in the headers of the CABE Envelopes it produces.

When an Envelope is obtained by a Client in a Target Domain which is part of the original Target Domain Set, the Client requests the Target Domain's Key Service perform a Retrograde operation, and quotes any FLPs found in the headers of that Envelope. The Target Domain's Key Service is able to use the correct quoted FLP to obtain the same LKAI as would be returned by any Retrograde operation directed at the Origin Domain's Key Service for the same Envelope, and is thereby able to service the request.

For Non-Captive Lease Keys, this means recovering the same Lease Key and all parameters needed to use it, including its Base IV. Interoperability using Captive Lease Keys is not specified by this revision of this specification.

# Extensions to CKAP

The CABE Key Access Protocol is extended as follows:

- the Prograde operation is extended to allow the Key Service to return a set of FLPs;
- the Retrograde operation is extended to allow a Client to quote a set of FLPs to a Key Service;
- to provide a discovery mechanism for FPKs.

## Common definitions

```cddl
DomainID = tstr .ne ""
FLP = bstr .ne h''
FLPSet = [0* FLP]
```

An FLPSet MUST NOT contain duplicate entries of the same byte-identical FLP in `Prograde` or `Retrograde` operations.

## Prograde operation

The Prograde operation is extended to allow the operation to return a set of FLPs. Specifically, the `Lease` structure is extended with an optional `federation` member:

```cddl
Lease = {
   ...
   ? federation: LeaseFederation
}

LeaseFederation = {
   originDomain: DomainID,
   ? flps: FLPSet
}
```

The `LeaseFederation` structure specifies the Origin Domain ID and can report zero or more FLPs. It MAY also be used to report the Origin Domain ID if federation is not in use. If the `LeaseFederation` structure is not specified, the Origin Domain does not implement this specification and federation is not supported.

## Retrograde operation

`RetrogradeRequest` is extended as follows:

```cddl
RetrogradeRequest = {
  ...
  ? federation: {
    originDomain: DomainID,
    flps: FLPSet
  }
}
```

For a foreign Envelope, the Client provides the Origin Domain ID from the CABE Envelope header and quotes the FLPs supplied inline or which were obtained via another channel.

The Target Domain's Key Service processes a request for a foreign Retrograde operation by identifying which, if any, of the FLPs it knows about are relevant to the request and which it can use. This may include FLPs directly quoted in the Retrograde request or any FLPs known to the Target Domain's Key Service from another source. Clients MAY include FLPs not applicable to a Target Domain's Key service in a Retrograde request, which are ignored.

## FederationIdentity resource

`FederationIdentity` is a public object. In the HTTP transport, it can be retrieved using a `GET` request at the CKAP Base URL with `FederationIdentity` appended. The request MUST be made with an `Accept` header of `application/ckap+cbor`. The response is as follows:

```cddl
FederationIdentity = {
  kind: "FederationIdentity",
  domainID: DomainID,
  keys: [* FederationPublicKey]
}

FederationPublicKey = {
  publicKey: COSE_Key,
  status: "current" / "future" / "retired"
}
```

The `kid` of a `COSE_Key` in a `FederationPublicKey` structure must be set to the FKID. FKIDs MUST be globally unique.

The `status` value indicates whether the key is the presently preferred key, is being advertised with the anticipation of transitioning to it in future, or has been retired and will soon stop being advertised. More than one `current` key MAY be advertised at any given time. All advertised keys, including `retired` keys, are considered valid.

The HTTP endpoint MUST set `Cache-Control` and `Expires` headers appropriately according to its rollover schedule, to ensure that Clients refresh the resource at an appropriate timeline before a transition occurs.

# Extensions to CBES

The CABE Base Envelope Structure is extended as follows to facilitate Inline Propagation where desired. The following header fields are defined:

- `CABE_OriginDomain`: if present, MUST be a textual string conforming to `DomainID`. This header MUST be placed in the `protected` section. It MUST NOT be referenced in a `crit` header.
- `CABE_FLPs`: if present, MUST be an array of one or more FLPs. This header MUST be placed in the `unprotected` section. It MUST be omitted if the logical array of FLPs is of zero length (in other words, a zero-length FLP array is serialized as the absence of this header). It MUST NOT be referenced in a `crit` header.

An Encapsulating Client can place FLPs in the headers of Envelopes it creates. Other data processing entities MAY also add, remove, or change the set of FLPs placed in the `unprotected` header of an Envelope which has already been created; this capability is intentionally preserved.

A Client which receives an Envelope with either of these headers in the wrong section (`protected` or `unprotected`) MUST refuse to process the Envelope.

# Propagation

## Inline Propagation

In Inline Propagation, an Encapsulating Client places the FLPs returned with a Lease in each Envelope created using that Lease. Each Envelope has the same FLP Set duplicated into each Envelope created. The FLPs are transported along with each Envelope to a Target Domain. Other processing entities can also add, remove, or change the set of FLPs on an Envelope without re-encrypting it or having access to the plaintext. This allows FLPs learned from another source to be embedded into an Envelope which has already been created to aid portability, or FLPs to be removed from an Envelope to make the Envelope more concise if it is a known fact that the given FLP is already known to a Target Domain's Key Service.

## Sidecar Propagation

In Sidecar Propagation, a different (unspecified, application-specific) means is used to transport the FLPs. This could involve, for example, a separate file adjacent to a file containing a CABE Envelope. Sidecar Propagation has the advantage of enabling an application to use its unique domain-specific attributes to facilitate the most efficient and non-redundant transport of FLPs to a Target Domain's Key Service.

# Simple Federated Lease Packages (SFLPs)

## Structure

A SFLP is a CBOR-encoded COSE `COSE_Encrypt` structure (optionally `COSE_Encrypt_Tagged`) containing Non-Captive LKAI for a specific Lease. It is encrypted to a non-empty array of COSE Recipients. A unique, random Content Encryption Key (CEK) protects the LKAI payload. The plaintext of the encrypted structure MUST be a CBOR-encoded `SFLP_Body` structure:

```cddl
SFLP_Body = {
  nonCaptive: LKAI_NonCaptive
}
```

The `protected` header section of a SFLP MUST contain the following header fields:

- `CABE_OriginDomain`: a textual string conforming to `DomainID` and specifying the Origin Domain ID that produced the SFLP;
- `CABE_AttributeSet`: a byte string containing an `AttributeSet` serialized as per CABE-ARCH, describing the Attribute Set of the Lease the SFLP was created for;
- `CABE_LeaseRef`: a byte string containing the Lease Reference of the Lease the SFLP was created for.

The `content type` header of the `COSE_Encrypt` structure MUST be present in the `protected` section and MUST be set to `application/cose-sflp+cbor`.

The `kid` of a `COSE_Recipient` MUST exactly match that of the FPK which was used to generate that recipient entry.

The `COSE_Encrypt` structure MUST use embedded ciphertext with zero-length `external_aad`.

## Generation

An Origin Domain's Key service determines the Target Domain Set during Prograde Resolution. For each needed SFLP (which can be one SFLP for all Target Domains, if desired), for each intended recipient Target Domain for that SFLP, it learns a suitable FPK of the given Target Domain, using the `FederationIdentity` CKAP resource if needed, and uses it to generate the recipient information for the given SFLP.

## Consumption

Before using an SFLP to satisfy a Retrograde request, the Target Domain's Key Service MUST successfully decrypt the SFLP and verify its integrity. The SFLP's protected Origin Domain ID, Attribute Set and Lease Reference MUST exactly match the corresponding values in the request. If an SFLP does not match, the Key Service MAY continue processing by attempting to use other FLPs.

# Limitations

This specification is intended primarily for use in relation to Non-Captive Lease Keys. Use with Captive Lease Keys may be feasible if managed and provisioned correctly, but would require careful implementation planning.

This specification does not define any FLPs other than SFLPs, nor does it define any mechanisms for Late Interbinding.

This specification specifies a small number of Propagation Mechanisms and does not define any mechanism for Domain Propagation.

These are not innate limitations of the CABE Architecture and it is foreseen that other specifications will provide further enhancements to CABE Federation in each of these areas.

## References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [CABE-ARCH](../arch/): *CABE Architecture Specification*
- [CABE-CKAP](../ckap/): *CABE Key Access Protocol*
- [CABE-CBES](../cbes/): *CABE Base Envelope Structure*
- [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final): *Module-Lattice-Based Key-Encapsulation Mechanism Standard*
- [NIST SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final): *Recommendations for Key-Encapsulation Mechanisms*
- [RFC 8610](https://www.rfc-editor.org/rfc/rfc8610.html): *Concise Data Definition Language (CDDL)*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CBOR)*
- [RFC 9052](https://www.rfc-editor.org/rfc/rfc9052.html): *CBOR Object Signing and Encryption (COSE): Structures and Process*
- [RFC 9053](https://www.rfc-editor.org/rfc/rfc9053.html): *CBOR Object Signing and Encryption (COSE): Initial Algorithms*
- [RFC 9964](https://www.rfc-editor.org/rfc/rfc9964.html): *ML-DSA for JOSE and COSE* (generic AKP key representation only)

# Colophon

**Author**<br/>
[Hugo Landau](mailto:hl@messier42.com)
