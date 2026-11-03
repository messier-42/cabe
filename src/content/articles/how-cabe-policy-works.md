---
title: "CABE Primer Part 2: How CABE Policy Works"
description: "How khaled evaluates Principal Claims, Message Attributes and requested operations to control key access."
category: "Primer"
publishedAt: "2026-10-30"
---

A CABE Attribute Set characterises a Message. It is not itself an access-control program. An Attribute such as audience=ExampleOrg acquires an access-control meaning because a configured policy interprets it and because the deployment has a trustworthy way to establish which callers belong to ExampleOrg.

The CABE Architecture leaves the policy language unspecified. khaled, the reference Key Server, provides a pluggable policy engine and supports Cedar. This article uses that implementation to make the decision process concrete. [1](https://cabespec.org/spec/arch/) [2](https://khaled.cabespec.org/overview/arch/)

[![Principal Claims, Message Attributes and the requested operation feed Cedar policy evaluation; the matching analysis request is allowed and the maintenance request is denied.](/images/primer-policy.png)](/images/primer-policy.png)

*Figure 2. khaled evaluates the requested operation against the Principal and Attribute Set. The example allows a matching analysis request and refuses a maintenance request with no matching permit.*

## The inputs to a decision

There are two descriptions to keep separate. Message Attributes describe the information. Principal Claims describe the authenticated caller. A request also identifies the operation the caller wants to perform.

Authentication establishes the Client's identity. A claims mapper then constructs the Principal and its Claims from that identity and other configured sources. khaled's current plugins include certificate-based authentication and both static and Kubernetes-aware claims mapping. These are deployment choices, not additional labels which an arbitrary Client is entitled to assert about itself. [3](https://khaled.cabespec.org/plugins/)

For an encapsulation request, khaled evaluates whether the Principal may obtain a Lease for the requested Attribute Set. For decapsulation it evaluates whether the Principal may obtain access to the relevant existing Lease. Its federation decision separately considers release to a Target Domain. The Cedar adapter exposes the requested Attribute Set as the resource and the Principal's Claims as principal attributes. [4](https://github.com/messier-42/khaled/blob/master/pkg/keyserver/ops.go) [5](https://github.com/messier-42/khaled/blob/master/pkg/plugin/policyengine/cedar/cedar.go)

## A small example

Suppose the Message has these application-defined Attributes:

```json
{
  "project": "survey",
  "product": "observation",
  "audience": "ExampleOrg"
}
```

An analysis application has established Claims identifying the same project and organisation, together with function=analysis. A maintenance application has function=maintenance instead.

An illustrative Cedar permission for the first application is:

```text
permit (
    principal,
    action == Action::"Decapsulate",
    resource
)
when {
    principal has project &&
    principal has organisation &&
    principal has function &&
    resource has project &&
    resource has product &&
    resource has audience &&
    principal.project == resource.project &&
    principal.organisation == resource.audience &&
    principal.function == "analysis" &&
    resource.product == "observation"
};
```

This follows the entity and action names used by khaled's Cedar adapter. It is an example rule, not a complete deployment policy. It does not grant encapsulation or federation permission. With this permission alone, the matching analysis request is permitted and the maintenance request has no matching permit. A deployment must also review any other permissions and prohibitions in the policy set. [5](https://github.com/messier-42/khaled/blob/master/pkg/plugin/policyengine/cedar/cedar.go)

The useful feature is not the particular spelling of observation. It is that the decision brings established facts about the caller together with the Attributes of the information and the requested operation.

## Where enforcement occurs

The Key Service enforces its decision by granting or refusing the requested access to key material. It does not need to read the report to evaluate the example above. Nor does it establish that the report was correctly labelled. A publisher authorised to encapsulate an observation remains responsible for the content it places under that description. [4](https://github.com/messier-42/khaled/blob/master/pkg/keyserver/ops.go)

A successful encapsulation permission and a successful decapsulation permission are also not a general transformation permission. An application allowed to read one Attribute Set and publish another has not thereby demonstrated that copying the first Payload into the second is an approved release. That decision belongs in the application or a processing enforcement component.

## Policy is evaluated at an operation, not continuously

With a Non-Captive Lease, the authorised Client receives key material for local use. A cached Lease can support multiple encapsulations. Those local operations do not each cause a fresh policy evaluation. Changing the server's policy affects subsequent requests; it does not remove a key from a Client which already possesses it. [6](https://cabespec.org/spec/ckap/)

A Captive Lease changes where the Lease Key resides. The server can evaluate policy when performing assisted wrapping or unwrapping of a content encryption key. The Client nevertheless obtains a content key and plaintext for the operation it is permitted to perform, and may retain them. Captive operation is therefore not remote erasure either. [4](https://github.com/messier-42/khaled/blob/master/pkg/keyserver/ops.go) [6](https://cabespec.org/spec/ckap/)

Lease expiry, key rollover, retained historical keys and application caches all matter when describing revocation. The correct question is which future operation a policy change prevents, and which information has already been released.

## Testing the arrangement

Testing should include more than the intended ALLOW case. Exercise the wrong project, wrong organisation, wrong function, missing Claims, missing Attributes and each operation independently. Test what happens when a previously authorised Client retains a key, and what happens after a restart or a policy reload. Check policy diagnostics rather than treating a successful parser invocation as a successful security review.

GetSelf, exposed by cabetool whoami, can help establish which Principal the server sees. It does not prove that a particular request is permitted. That requires testing the request against the actual configured policy. [6](https://cabespec.org/spec/ckap/)
