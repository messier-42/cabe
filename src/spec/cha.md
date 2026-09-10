---
title: "CABE High Availability Specification (CABE-HA)"
draft: "CABE-HA"
status: "Active Draft"
date: "September 2026"
abstract: "This document specifies high availability requirements for a CABE Key Server implemented by multiple colocated Key Server Instances."
---

# Introduction

This specification defines architectural requirements for high-availability
deployments of singular CABE Domains. A high-availability deployment
facilitates the use of multiple CABE Key Servers within a particular domain to
provide continuity of service in the event of the failure or partition of CABE
Key Servers.

# Definitions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY" and "OPTIONAL" in this
document are to be interpreted as specified in [BCP
14](https://www.rfc-editor.org/info/bcp14) when, and only when, they appear in
all capitals, as shown here.

All definitions in [CABE-ARCH](../arch/), [CBES](../cbes/) and [CKAP](../ckap/)
are imported.

# Scope

This specification defines requirements for high-availability CABE
implementations. The underlying implementation strategy used by a CABE
implementation supporting high availability is not constrained beyond what is
required by this specification.

# Invariants

A CABE Domain provides service (the Key Service) to CABE Clients; the Key Service
is realized via one or more Key Servers. Fundamentally, the following Invariants
must be maintained within the context of a specific CABE Domain:

- The semantics of all CKAP operations are independent of which Key Server
  handles a request directed at a Key Service.

- Any successful Prograde reply from any Key Server to a Client must be honorable
  by a future Retrograde request made to any Key Server, subject to any current
  or future Policy.

  As such, a CABE Key Server MUST NOT provide an affirmative reply to a
  Prograde operation until it has durably ensured that any and all current or
  future Key Servers will be able to process a corresponding Retrograde
  operation (quoting the returned Lease Reference) occurring at the present
  instant or any future instant. A Key Server which is unable to provide this
  guarantee for a specific request MUST NOT satisfy the request and MUST
  instead return an error reporting the failure condition.

# Service Access

The mechanism by which access by Clients to a Key Service comprised of multiple
Key Servers is undefined. The following approaches are all examples of valid
implementation approaches:

- a Client which can configure multiple CKAP base URLs (one for each Key
  Server), and which is capable of retrying requests to different CKAP
  endpoints as needed;

- a CABE Domain which deploys an arbitrary HTTP-based load balancing and
  failover solution to ensure a single CKAP Base URL provides service even in
  the event of the failure of a CABE Key Server. This approach enables
  proactive health monitoring of individual CABE Key Servers and avoids the
  need for Clients to manage endpoint retry, timeout and failover.

Note that because CKAP is accessed over HTTP, CKAP can be distributed through a
wide ecosystem of mature HTTP-based high availability solutions. So long as the
requirements of this specification are met, administrators deploying CABE
Domains have flexibility to deploy HTTP High Availability technologies which
best serve their specific deployment requirements.

Where a Client includes support for accessing a Key Service via multiple CKAP
Base URLs, clients SHOULD use timeouts and failover if a request made using one
CKAP Base URL fails with an error that indicates server or transport failure.
Clients SHOULD prioritise using CKAP Base URLs based on the recent history of
a given CKAP Base URL's error rate.

# References

## Normative References

- [BCP 14](https://www.rfc-editor.org/info/bcp14): *Best Current Practice 14*
- [CABE-ARCH](../arch/): *CABE Architecture Specification*
- [CKAP](../ckap/): *CABE Key Access Protocol Specification*
- [RFC 5234](https://www.rfc-editor.org/rfc/rfc5234#section-6.1): *Augmented BNF for Syntax Specific  ation: ABNF*
- [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html): *Concise Binary Object Representation (CB  OR)*

# Colophon

  **Author**<br/>
  [Hugo Landau](mailto:hl@messier42.com)
