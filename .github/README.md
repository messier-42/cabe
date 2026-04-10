# CABE (Concise Attribute-Bound Encapsulation)

CABE is a data-centric approach to securing information across distributed and coalition environments. It is built for conditions where networks are unreliable, trust boundaries are fragmented, and data must move across domains, organizations, and classification levels without depending on intermediaries for enforcement.

This repository contains the source for [cabespec.org](https://cabespec.org), the public specification site.

## The Problem

Most interoperability approaches assume shared infrastructure. They rely on network-centric trust models, gateway-based policy enforcement, or heavyweight container formats that break down the moment data leaves its originating context.

In coalition environments, there is no unified control plane. Intermediaries introduce latency, fragility, and policy drift. Data that cannot carry its own security becomes inert when it crosses a boundary.

## The Approach

CABE moves enforcement into the data object itself. Security travels with the data. Enforcement is cryptographic, not procedural. Interoperability does not require shared infrastructure.

## Core Concepts

**Concise encapsulation.** CABE uses a compact structured encoding, drawing on CBOR/COSE, suited for machine-to-machine communication, message buses, streaming systems, and constrained edge environments.

**Attribute-based access control.** Access decisions are enforced cryptographically using attributes bound to identities, data objects, and policy expressions. This enables fine-grained releasability and cross-coalition sharing without pre-negotiated network trust.

**Data-centric protection.** Once encapsulated, data remains protected across systems, networks, and storage layers. Intermediaries can route without access. Enforcement does not require runtime callbacks or gateways.

**Federation without a global root.** CABE assumes multiple trust domains, partial trust relationships, and no single authority. It supports cross-domain identity verification and incremental adoption without requiring full alignment upfront.

## Non-Goals

CABE is not a transport security replacement, a document archive format, a policy engine, or a centralized control plane.

## Specifications

CABE is a family of open, publicly available specifications. The core specifications are all in active first draft.

**CABE-ARCH** defines the overall architecture: the attribute model, trust domains, and how the other specifications compose into a coherent system.

**CBES** (CABE Baseline Envelope Structure) defines the COSE-based envelope format for encapsulating and encrypting messages. Envelopes use `COSE_Encrypt0` or `COSE_Encrypt` structures serialized as CBOR, scaling from payloads as small as a single byte to arbitrarily large objects.

**CKAP** (CABE Key Access Protocol) defines the protocol between CABE clients and key servers, including the key schedule, key series, key epoch rotation, and principal authorization model.

Two additional specifications are planned: a NATO ACP240 attribute mapping (CABE-ACP240) for isomorphic translation between NATO information classification labelling and CABE attribute sets, and an associated messaging format (CABE-ASSOC) for ultra-low-overhead encryption of large volumes of small messages in the context of a base message.

## Project Structure

The site is built with [Astro](https://astro.build/) 6.x. Specifications are authored as Markdown in `src/spec/` and rendered through a dynamic route. The output is static HTML and CSS with no client-side JavaScript frameworks.

```
src/
  spec/           Specification drafts in Markdown (arch, cbes, ckap)
  pages/          Astro page routes (index, FAQ, specification index, spec/[slug])
  components/     Shared components (Nav, Welcome)
  layouts/        Base page layout
  data/           Specification metadata and groupings (specs.ts)
  content/        Additional content pages (FAQ)
public/
  images/         Architecture diagrams and illustrations (SVG)
```

## Development

Requires Node.js >= 22.12.0.

```sh
npm install
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview production build
```

## License

Specifications are publicly available for review and comment. See the site for details on adoption, incorporation, and collaboration.
