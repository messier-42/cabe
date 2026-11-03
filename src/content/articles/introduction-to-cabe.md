---
title: "CABE Primer Part 1: Introduction to CABE"
description: "Basics of CABE."
category: "Primer"
publishedAt: "2026-10-28"
---

## Introduction

Suppose two applications receive the same report through a shared message broker. One is allowed to read it. The other is not. The broker should not have to decrypt the report to make this distinction, and its operator should not acquire access merely by operating the service.

CABE is intended for this sort of arrangement. Concise Attribute-Bound Encapsulation defines an encrypted Envelope format and a protocol through which applications obtain key material under an attribute-based access policy. The transport carries the Envelope. A Key Service decides whether a requesting application may obtain the means to read it. [1](https://cabespec.org/spec/arch/)

[![One producer sends an encrypted Envelope through a shared broker to two consumers. The Key Service permits the analysis application’s key request and refuses the maintenance application’s request; the broker has no decryption key.](/images/primer-introduction.png)](/images/primer-introduction.png)

*Figure 1\. The broker delivers the same Envelope to both consumers. The Key Service permits or refuses their key requests separately; the broker does not receive a decryption key.*

## A Message, an Envelope and a Key Service

A CABE Message consists of a Payload, an Attribute Set and any other associated Metadata. The Payload is a sequence of bytes. It might be a JSON report, an encoded audio block, an image or something specific to an existing application. Using CABE does not require converting that Payload to a new application data format. [1](https://cabespec.org/spec/arch/)

The publishing application assigns the Attributes. For example, an observation could be described by project=survey, product=observation and audience=ExampleOrg. These are application-defined names for this example; their meaning has to be agreed by the participating applications and the policy administrator.

The Client asks its Key Service for a Lease associated with that Attribute Set. If policy permits the request, the returned information allows the Client to encapsulate the Message. The result is an Envelope containing the encrypted Payload and the information needed to request access to its key later. CABE uses CBOR and COSE for this Envelope, independently of the Payload's own encoding. [2](https://cabespec.org/spec/cbes/)

The broker can store, queue and forward those bytes without becoming a reader. A receiving Client obtains the Attribute Set and Lease Reference from the Envelope and asks the Key Service to resolve the key. The server authenticates the Client and evaluates its request. Receiving a copy of the Envelope is not the same as receiving a copy of the key. [3](https://cabespec.org/spec/ckap/)

## One delivery path, different permissions

Consider an analysis application and a maintenance application. Both belong to the same organisation and project. The analysis application is permitted to read observations; the maintenance application is permitted to read equipment-status reports.

Both can subscribe to a shared delivery service. When they receive an observation, the Key Service can permit the analysis application's key request and refuse the maintenance application's request. The broker does not need a second copy of the report encrypted separately for every subscriber. This example assumes neither consumer already holds the relevant usable key material. [4](https://cabespec.org/)

This is the separation CABE provides: distribution can use common infrastructure while access is governed at the key service. It does not mean that the infrastructure has become trustworthy. A compromised broker can still withhold, reorder or replay Envelopes. It can observe their size, timing and visible headers. Those properties need separate treatment where they matter. [4](https://cabespec.org/)

## Why Leases matter

A sensor may produce many reports with the same Attribute Set. Requiring a new key-service round trip for each report would make the key service part of the critical path for every measurement.

A valid cached Lease avoids that requirement in the Non-Captive case. The Client holds the Lease Key and can encapsulate further Messages locally while the Lease is valid. A Captive Lease instead keeps the Lease Key at the Key Service, which performs assisted operations on a content encryption key. In both cases the Client handles the Payload. The Key Service remains trusted for the key material it controls even though it does not need the Payload in its normal request path. [3](https://cabespec.org/spec/ckap/)

A Lease is not a timer which makes previously disclosed information disappear. Expiry controls the use of the Lease for subsequent operations by a conforming Client. It cannot erase retained keys or plaintext. The consequences for policy changes are discussed in [the policy article](/articles/how-cabe-policy-works/).

## What an integration supplies

CABE supplies a common protection and key-access arrangement. An application still supplies the Payload format, the meaning and authority of its Attributes, and its delivery and processing behaviour. A deployment supplies trusted authentication, Claims and policy configuration. The reference implementation separates these concerns: cabe-go provides client functionality, cabetool exposes command-line operations, and khaled provides the Key Service. [4](https://cabespec.org/)

That is enough to use a shared broker or archive without making it a trusted reader. It is not a replacement for decisions about what may be published, who may receive it, or what an authorised application may do once it has plaintext.
