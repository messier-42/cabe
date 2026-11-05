---
title: "Flexible data sharing in real time"
description: "How a coalition can give a new participant access to selected reports already in circulation, and what happens when connectivity or access changes."
category: "White paper"
publishedAt: "2026-11-05"
---

[Download the white paper (PDF)](/papers/flexible-data-sharing.pdf)

## When a partner joins mid-mission

An allied ship suffers a mechanical failure. Its replacement, from a partner navy, needs surface tracks, weather reports and navigational warnings by morning. The coalition already distributes those products through a shared broker. The question for the watch team is which reports the incoming ship may read, including reports issued before it joined.

Where each audience has its own network or archive, adding a reader can mean configuring a gateway, arranging a manual transfer or publishing another copy. A position report can go stale while its release is being arranged. A producer who expects that delay may skip an update altogether.

Concise Attribute-Bound Encapsulation (CABE) separates the path a report takes from the decision to release its contents. A producer assigns Attributes to the Message and encrypts it in an Envelope. Brokers, ships and archives can forward the Envelope without holding a decryption key. A Key Service evaluates whether an authenticated application may obtain the key access it requests.

| Participant | What it needs to do |
| --- | --- |
| Track producer | Label the report with its mission, product type and releasability. Obtain an authorised Lease and encrypt the report. |
| Coalition broker | Deliver or store the Envelope. Forwarding it requires no Payload key. |
| Incoming ship | Present a recognised identity. Request key access for the report under the coalition’s release Policy. |

## How a release decision works

Message Attributes describe the information. Principal Claims describe the caller. In the ship example, a release rule might require a surface track for the same mission, a nation on the release list, and a current assignment to the watch. The Key Service needs a trusted source for those Claims. A ship’s application cannot establish its own eligibility simply by supplying those values.

When the new ship is authorised, it can request access to an earlier report if it can retrieve the Envelope and the Domain retains the corresponding key material. The producer need not re-encrypt the report. Across CABE Domains, the participants also need an established federation relationship, compatible Attribute meanings and Policies that permit the transfer and local key access.

Ending the assignment can prevent subsequent key requests. It cannot recall plaintext already released or erase a key a recipient holds. Lease duration, key rollover and the choice of key mode determine how closely a change in Policy can track a change in the mission.

### Two ways to use a Lease

With a Non-Captive Key, an authorised producer can encrypt further Messages with the same Attribute Set locally while its cached Lease remains valid. This matters on a ship that may lose its uplink between reports. A recipient with the necessary key can also decrypt locally.

With a Captive Key, the Lease Key stays with the Key Service. The Client asks the service to wrap or unwrap a content encryption key and uses that key to process the Payload locally. This gives the service a decision point for a new wrap or unwrap, but the Client needs connectivity for that operation. A recipient that already holds the content key can still use it.

## Protection across a changing route

**Adaptive routing.** A damaged reconnaissance aircraft passes encrypted imagery to a drone, which relays it to an escort ship. The carrier stores the Envelope until it can forward it to an analysis cell ashore. Each relay can perform its task without access to the image. The analyst obtains key access under the applicable Policy. If the analyst also needs to verify which aircraft produced the image, the application needs producer-attribution evidence, such as a verifiable signature. Authenticated encryption with a shared key alone cannot distinguish among holders of that key.

**Disconnected reporting.** A submarine prepares a text report between transmission windows. With a valid cached Non-Captive Lease for the report’s Attribute Set, it can encrypt the report while disconnected. It queues the Envelope until a link becomes available. An intermediate platform can store and forward it across another intermittent link. A reader without the necessary key or access to a suitable Key Service must wait. The transmission window and the key-access window are separate planning considerations.

### What the Envelope carries

The CABE Baseline Envelope Structure uses CBOR and COSE to carry an application’s Payload as bytes. A temperature reading, an encoded image and a large file can use the same protection model. The application retains responsibility for its own Payload format, and the receiver must understand that format to use the data.

Compact encoding and Lease reuse matter most when a system produces many small Messages. A cached Non-Captive Lease can avoid a key request per observation. Actual bandwidth and latency depend on Message size, Envelope options, Lease reuse and link conditions. The Envelope does not by itself authorise a network to carry a particular classification.

## Workload access and a common operating picture

**An embarked planning agent.** A planning workload needs weather, fuel and selected sensor reports. A deployment can use its authenticated workload identity to establish Claims about its mission and role. If access also depends on a particular container image or model digest, a trusted component must verify what is running and bind that evidence to the caller. The agent can then encrypt its recommendation under a separately authorised Attribute Set for a commander to review. The application remains responsible for assigning appropriate labels to that output.

**Sensor fusion ashore.** A headquarters receives coalition tracks, logistics updates and compartmented intelligence. A fusion service may be authorised to read more sources than a display on a partner ship. CABE gives both applications a common way to request key access. The service still has to reconcile track identifiers and formats, and decide how to label a derived product before releasing it. Reading several sources does not confer permission to publish everything they contain.

### Implementation and interoperability

CABE is an open specification. CBES defines the Envelope, and CKAP defines Client interactions with a Key Service. The CABE-ACP240 profile maps supported confidentiality-label elements to CABE Attributes. Participating organisations must agree on label meanings, trusted identities and release authority.

The reference Key Server, khaled, supports Cedar and pluggable policy engines. Deployments can integrate workload identity from systems such as SPIFFE, including through Messier 42’s Quantum Helix, and map verified Kubernetes workload metadata into policy inputs. These are implementation choices. Cryptographic assurances likewise depend on the algorithms and key-management arrangements used in the deployment.

For the replacement ship, success has a concrete test: its watch can open an authorised track issued before the ship joined, while a request for a restricted report is refused. The same broker can deliver both Envelopes. The decisive work lies in identifying the watch, labelling the reports accurately and expressing the release decision in Policy.

### Further reading

[CABE Architecture](/spec/arch/) · [Baseline Envelope Structure](/spec/cbes/) · [Key Access Protocol](/spec/ckap/) · [ACP240 mapping](/spec/acp240/) · [Producer attribution](/articles/how-cabe-attribution-works/)
