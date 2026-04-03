# What is CABE?

CABE is a family of specifications which provides a unified infrastructure for
encrypting and decrypting arbitrary data to control access using the principles
of Attribute Based Access Control (ABAC).

It is intended to function as a lightweight alternative to formats such as Zero
Trust Data Format (ZTDF) and OpenTDF.

# How does CABE differ from ZTDF?

ZTDF is, like CABE's core specification, a standardized means of wrapping data
in an encrypted container, associating attribute metadata with that container,
and communicating with a key server to retrieve keys used to encrypt and
decrypt such containers using Attribute-Based Access Control (ABAC).

CABE differs from ZTDF in that it is designed to be more flexible and
lightweight than ZTDF. ZTDF is based around the use of ZIP archives to
encapsulate encrypted objects. As an approach, this is suitable only for
encrypted objects of a certain minimum size. It is obviously inapplicable, for
example, to securing individual 5-byte temperature sensor readings; to use an
analogy, it would be like placing each individual temperature reading in a
separate Word document.

Whereas ZTDF is built on container formats like ZIP, CABE is built on the
IETF's state of the art standards COSE and CBOR, which define modern,
peer-reviewed encryption and data serialization mechanisms.

# How does CABE differ from Attribute-Based Encryption (ABE)?

ABE refers to the use of advanced or novel cryptography to enforce an
attribute-based access control policy via cryptographic means.

Neither ZTDF nor CABE's base specification are strictly ABE in the sense that
they are instead a key management framework designed to achieve ABAC policy
objectives via interaction with a key server. CABE's base specification is only
reliant on symmetric cryptography, rather than relying on asymmetric (public
key) cryptography.

This means that CABE is more reliant on the availability of a suitable key
server. On the other hand, the use of only symmetric primitives renders CABE
resilient to post-quantum cryptanalysis.

CABE is an overarching framework for ABAC-based object encryption and
decryption and while its base specification is based around ABAC enforced by a
key server and symmetric cryptography, it does not proclude a future profile of
CABE which uses novel attribute-based encryption methodologies.

# Why is CABE a more compelling solution than ZTDF?

CABE has several advantages:

- CABE is more lightweight and performant than ZTDF, with lower overheads. This
  allows it to scale from transporting messages as small as 1 byte to messages
  which are arbitrarily large.

- CABE provides an integrated set of specifications for key management around
  ABAC principles.

- CABE has a publicly available specification which can be freely viewed by
  all. The specification is open to public comment to facilitate future
  improvement in an open process of collaboration.

- CABE is built on contemporary internet standards such as CBOR and COSE.

# What standards is CABE built on?

CABE is built on the IETF standards CBOR (Concise Binary Object Representation)
and COSE (CBOR Object Signing and Encryption). COSE itself incorporates
NIST-approved cryptographic algorithms such as AES and SHA-2.

# How is the CABE specification structured?

CABE is a family of specifications. The core specification defines a way of
wrapping an arbitrary message in an encrypted envelope given some set of
metadata attributes. This specification is intended to be used in conjunction
with the CABE Key Access Protocol (CKAP), which defines the key management
architecture of a CABE system.


