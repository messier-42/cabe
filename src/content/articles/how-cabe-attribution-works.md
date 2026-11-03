---
title: "CABE Primer Part 3: How CABE Attribution Works"
description: "Why key access and authenticated encryption do not by themselves prove who produced a Message."
category: "Primer"
publishedAt: "2026-11-02"
---

An encrypted report contains source=sensor-17. Its authenticated encryption verifies successfully. Has the receiver established that sensor-17 produced it?

Not from those two facts alone. The source Attribute is a statement, and symmetric authentication does not distinguish every participant able to use the same key. Attribution requires knowing what evidence connects a particular producer to a particular Message. This is distinct from assigning Attributes, which is covered in the tagging article. [1](https://cabespec.org/)

[![Key-request authentication is distinct from portable producer attribution. An application-defined signed publication record is protected inside a CABE Envelope, then decrypted and verified by an authorised reader.](/images/primer-attribution.png)](/images/primer-attribution.png)

*Figure 3. The Key Service authenticates a key request. Portable producer attribution requires additional evidence bound to the Message; the signed publication record shown here is an application design, not a standard CABE field.*

## Three different assertions

First, a Key Server can authenticate the Client making a key request. khaled's authentication and claims-mapping plugins establish the Principal on which its access decisions are based. That answers a question about the caller of the Key Service. It is not automatically a portable statement about every Envelope subsequently created with the released key. [2](https://khaled.cabespec.org/overview/arch/)

Second, CABE protects the Payload and the protected headers against modification by an intermediary without the relevant key. An authorised recipient verifies that protection during decapsulation. The result establishes the cryptographic integrity property of that construction, not a unique publisher identity among parties capable of producing valid ciphertext with that key. [3](https://cabespec.org/spec/cbes/)

Third, an application may require evidence that a named producer issued specific information. That evidence needs an additional binding. The baseline Envelope and a successful key-resolution request do not, by themselves, supply it. [1](https://cabespec.org/)

## Why a protected source name is not enough

Putting a source name in the protected Attribute Set prevents a keyless intermediary from changing that name and still having the Envelope verify under the intended key. It does not prevent a participant which has the required key material from constructing an Envelope containing the same source name. [3](https://cabespec.org/spec/cbes/)

The same distinction applies to federation. CFAR includes an Origin Domain identifier in protected headers and requires a receiving Key Service to match the FLP's context to the request. This is a consistency check. Encryption to a Target Domain's public key is not, by itself, proof that a particular Origin Domain created the package: knowledge of a public key is not a secret signing capability. The CABE site's security model explicitly excludes treating these fields as producer-specific proof. [4](https://cabespec.org/spec/cfar/) [1](https://cabespec.org/)

A network connection can provide more immediate evidence. For example, an authenticated publishing endpoint can establish which caller submitted particular bytes. Once those bytes are forwarded or stored, a downstream reader needs a way to obtain and verify that evidence rather than merely trusting a copied source string.

## Adding a producer binding

An application which needs portable attribution could define a signed publication record and protect it as part of the CABE Payload. This is an application design, not a standard CABE attribution format or a feature claimed here for cabetool.

The record should bind the producer, content and interpretation context: for example, the report identifier, revision, schema and relevant handling Attributes. A profile must specify its encoding, signature validation and identity-to-key relationship. Surrounding metadata cannot repair a signature over the wrong representation.

Signing inside the encrypted Payload is one possible composition when only authorised readers need to verify the producer. A different placement may be appropriate when intermediaries need verification without decryption. That choice also determines which identifiers and other metadata are exposed.

It would be a mistake to sign every byte of a transport representation without considering legitimate mutations. CFAR deliberately permits the FLP attachment list to be changed without re-encrypting the Envelope. A provenance profile must distinguish the stable content it is attributing from transport attachments which may change. [4](https://cabespec.org/spec/cfar/)

## Attribution after transformation

Suppose a processor reads several sensor reports and produces a summary. The processor is the producer of the summary. The original sensors are sources of its inputs. Carrying a sensor's signature next to a changed Payload would not make that signature authenticate the new result.

A provenance design could preserve references to the verified inputs while binding the processor to its own output. It would also need to say what those references prove: that inputs existed, that the processor used them, or that a specified transformation was actually performed. These are progressively different claims. An output signature alone does not prove the computation.

The same care applies to logs and attestation. A key-service log may show that an identity obtained access to a Lease. An attestation result may identify the assessed execution environment. Neither automatically supplies a durable, producer-specific signature over every Message emitted from that environment.

CABE can carry and protect attribution evidence, and its identity and key-access machinery can participate in an attribution architecture. The precise guarantee comes from the evidence that architecture actually produces and verifies. It should be described as such, rather than inferred from a source label or the word "authenticated" in authenticated encryption.
