export interface SpecEntry {
  title: string;
  draft: string;
  desc: string;
  status: string;
  statusType: 'active' | 'pending';
  slug: string | null; // null = no page yet
}

export interface SpecGroup {
  label: string;
  desc: string;
  specs: SpecEntry[];
}

export const specGroups: SpecGroup[] = [
  {
    label: 'Core Specifications',
    desc: 'The core specifications are critical to any CABE system.',
    specs: [
      {
        title: 'CABE Architecture',
        draft: 'CABE-ARCH',
        desc: 'Base architecture specification.',
        status: 'First draft published',
        statusType: 'active',
        slug: 'arch',
      },
      {
        title: 'CABE Base Envelope Structure',
        draft: 'CBES',
        desc: 'Core envelope encapsulation format for CABE-protected messages.',
        status: 'First draft published',
        statusType: 'active',
        slug: 'cbes',
      },
      {
        title: 'CABE Key Access Protocol',
        draft: 'CKAP',
        desc: 'The protocol used by CABE clients to interact with a CABE Key Server and the reference architecture of CABE Key Servers.',
        status: 'Pending first draft',
        statusType: 'pending',
        slug: null,
        //status: 'First draft published',
        //statusType: 'active',
        //slug: 'ckap',
      },
    ],
  },
  {
    label: 'Additional Specifications',
    desc: 'Additional specifications provide extended functionality.',
    specs: [
      {
        title: 'NATO ACP240 Attribute Mapping',
        draft: 'CABE-ACP240',
        desc: 'Defines an isomorphic mapping between NATO ACP240 information classification labelling and CABE Attribute Sets.',
        status: 'Pending first draft',
        statusType: 'pending',
        slug: null,
      },
      {
        title: 'CABE Associated Messaging',
        draft: 'CABE-ASSOC',
        desc: 'An ultra-low-overhead encryption format for efficiently transporting large numbers of small units of information — even a single byte — in the context of a CABE Base Message.',
        status: 'Pending first draft',
        statusType: 'pending',
        slug: null,
      },
    ],
  },
];
