export interface DiagramNode {
  id: string; x: number; y: number; width: number; height: number;
  title: string; lines: string[]; kind?: 'key' | 'store' | 'envelope' | 'trusted' | 'control';
  decision?: { text: string; allowed: boolean };
}
export interface DiagramEdge { path: string; kind?: 'key' | 'control'; }
export interface ScenarioDiagram {
  title: string; description: string; assumption: string; height: number;
  domains: { x: number; y: number; width: number; height: number; label: string }[];
  nodes: DiagramNode[]; edges: DiagramEdge[];
  labels?: { x: number; y: number; text: string }[];
  caption: string; mobile: { title: string; text: string; kind?: 'key' | 'control' }[];
}
const node = (id: string, x: number, y: number, width: number, title: string, lines: string[], kind?: DiagramNode['kind'], decision?: DiagramNode['decision']): DiagramNode => ({id,x,y,width,height:52+lines.length*21+(decision?24:0),title,lines,kind,decision});
const domain = (height: number) => [{x:16,y:16,width:848,height:height-32,label:'CABE Domain · one logical Key Service'}];
export const diagrams: Record<string, ScenarioDiagram> = {
  'shared-storage': {
    title: 'One stored Envelope, two access decisions over time',
    description: 'Within one CABE Domain, the same stored report is delivered to Team B before and after a policy change. Initially the Key Service refuses key access. Six months later, a revised Policy permits a fresh request. The service retains the historical decryption material; the Envelope is unchanged.',
    assumption: 'Established Domain · retained historical key material · Non-Captive Keys',
    height: 470, domains: domain(470),
    nodes: [
      node('report',280,65,320,'One stored report',['Envelope unchanged for six months'],'store'),
      node('key',300,223,280,'Key Service',['Retains historical key material','Policy changes to admit Team B'],'key'),
      node('before',40,338,215,'Team B · initially',['Envelope received'],undefined,{text:'Key access refused',allowed:false}),
      node('after',625,338,215,'Team B · later',['Same Envelope received'],undefined,{text:'Key access permitted',allowed:true}),
    ],
    edges: [
      {path:'M280 102H105V338'}, {path:'M600 102H790V338'},
      {path:'M300 270H215V338',kind:'key'}, {path:'M580 270H675V338',kind:'key'},
      {path:'M170 186H710',kind:'control'},
    ],
    labels:[{x:440,y:178,text:'Six months of retention → a later sharing decision'}],
    caption:'Time changes the access decision, not the stored ciphertext. Six months is a retention interval, not a Lease duration. Dashed lines show separate requests to the same Key Service.',
    mobile:[
      {title:'One retained Envelope',text:'Producers upload an encrypted report to shared storage. Its ciphertext stays unchanged for six months.'},
      {title:'Initially · key access refused',text:'Team B fetches the Envelope. The existing Key Service refuses its fresh request for decryption material.',kind:'key'},
      {title:'Later · Policy changes',text:'A sharing decision admits Team B to these historical reports. The Key Service still holds the required material.',kind:'control'},
      {title:'New request · key access permitted',text:'The Key Service checks Team B’s Claims, the stored report’s Attributes and the operation under revised Policy. Team B reads the original Envelope.',kind:'key'},
    ],
  },
  'telemetry': {
    title:'Repeated observations and status events reuse their applicable Leases',
    description:'One producer caches separate Non-Captive Leases for observation and equipment-status Attribute Sets. It encrypts a sequence locally and passes the Envelopes through a shared broker. The analysis consumer can access observations; the maintenance consumer can access equipment status. Key resolution is separate from repeated delivery.',
    assumption:'Distinct Attribute Sets · valid cached Leases · Non-Captive Keys',
    height:490,domains:domain(490),
    nodes:[
      node('key',300,65,280,'Key Service',['Authorises each product Lease'],'key'),
      node('producer',40,213,220,'Producer · cached Leases',['Observation → Lease O','Equipment status → Lease E']),
      node('sequence',310,213,240,'Repeated Envelopes',['O₁   O₂   O₃  ·  Lease O','E₁   E₂   E₃  ·  Lease E'],'envelope'),
      node('broker',310,363,240,'Shared broker',['No decryption keys'],'store'),
      node('analysis',610,203,220,'Analysis application',['Observations permitted']),
      node('maintenance',610,350,220,'Maintenance application',['Equipment status permitted']),
    ],
    edges:[{path:'M260 259H310'},{path:'M430 307V363'},{path:'M550 396H580V242H610'},{path:'M580 388H610'},
      {path:'M300 102H150V213',kind:'key'},{path:'M580 102H735V203',kind:'key'},{path:'M580 119H847V388H830',kind:'key'}],
    caption:'O and E identify different information products and their applicable Leases. Repeated local encryption reuses a valid Lease; it does not make every Envelope an independent key access boundary.',
    mobile:[
      {title:'Resolve two product Leases',text:'The producer obtains authorised Non-Captive Leases O and E for observation and equipment-status Attribute Sets.',kind:'key'},
      {title:'Encrypt a sequence locally',text:'O₁ → O₂ → O₃ use Lease O. E₁ → E₂ → E₃ use Lease E. Each Message uses the required encryption parameters.'},
      {title:'Shared broker delivers Envelopes',text:'The same infrastructure carries both products without receiving their decryption keys.'},
      {title:'Different consumer permissions',text:'The analysis application requests observation access; the maintenance application requests equipment-status access. The Key Service evaluates them separately.',kind:'key'},
    ],
  },
  'coalition-operating-picture': {
    title:'Multiple contributions and selectively authorised operating-picture views',
    description:'Position, observation and satellite producers in one agreed CABE Domain send Envelopes through shared relay and storage. The Key Service authorises a field view for position and observation products and an analysis view for those plus satellite products. Plaintext processing occurs inside the authorised consuming applications, never in the relay.',
    assumption:'Agreed report formats and Attribute meanings · one Domain · Non-Captive Keys',
    height:530,domains:domain(530),
    nodes:[
      node('position',40,76,215,'Position producer',['Position report Envelopes']),
      node('observation',40,222,215,'Observation producer',['Observation Envelopes']),
      node('satellite',40,368,215,'Satellite producer',['Selected product Envelopes']),
      node('key',320,65,270,'Key Service',['Authorises producers','Evaluates consumer access'],'key'),
      node('relay',320,285,250,'Shared relay / storage',['Delivers encrypted objects','No plaintext processing'],'store'),
      node('field',630,213,210,'Field application',['Position + observations','Authorised plaintext use'],'trusted'),
      node('analysis',630,369,210,'Analysis application',['Also satellite products','Authorised plaintext use'],'trusted'),
    ],
    edges:[{path:'M255 112H285V313H320'},{path:'M255 258H285'},{path:'M255 404H285V343H320'},
      {path:'M570 316H600V259H630'},{path:'M600 316V415H630'},
      {path:'M320 102H270V56H120V76',kind:'key'},{path:'M270 102V198H148V222',kind:'key'},{path:'M270 198V348H148V368',kind:'key'},
      {path:'M590 100H735V213',kind:'key'},{path:'M590 125H852V416H840',kind:'key'}],
    caption:'The consuming applications construct their own views from permitted contributions. Any correlation or fusion of plaintext happens there. The shared relay only carries Envelopes; a CABE Domain is not a physical network boundary.',
    mobile:[
      {title:'Agree the application conventions',text:'Participants agree report formats and Attribute meanings, and use one logical Key Service in a CABE Domain.',kind:'control'},
      {title:'Three producers publish',text:'Position reports, observations and selected satellite products become distinct Envelopes under authorised Non-Captive Leases.',kind:'key'},
      {title:'Relay and store ciphertext',text:'Shared infrastructure carries all three contributions. It has no keys and performs no plaintext fusion.'},
      {title:'Field picture · authorised reader',text:'The field application obtains keys for position reports and selected observations, then processes those plaintext inputs.',kind:'key'},
      {title:'Analysis picture · authorised reader',text:'The analysis application is also permitted satellite products. Its plaintext processing builds a different view from its permitted inputs.',kind:'key'},
    ],
  },
  'partner-observation': {
    title:'Partner publisher and authorised field reader across a shared delivery path',
    description:'The partner publisher and SOF field application use one agreed CABE Domain and its Key Service. The publisher encrypts a drone observation. Shared intermediaries forward the Envelope without decryption keys. The Key Service permits the authenticated field application to obtain the key and decrypt locally.',
    assumption:'Partner and field application in one agreed Domain · Non-Captive Keys',
    height:360,domains:domain(360),
    nodes:[
      node('key',305,62,270,'Key Service',['Publish and read permissions'],'key'),
      node('partner',40,222,230,'Partner producer',['Encrypts drone observation']),
      node('path',325,222,230,'Shared delivery path',['Relays have no keys'],'store'),
      node('field',610,222,230,'SOF field application',['Authorised local decryption'],'trusted'),
    ],
    edges:[{path:'M270 259H325'},{path:'M555 259H610'},{path:'M305 99H155V222',kind:'key'},{path:'M575 99H725V222',kind:'key'}],
    caption:'Intermediaries carry the observation; the field application is the reader. The key arrangement is established within one Domain. The diagram does not assert a delivery deadline.',
    mobile:[
      {title:'Partner obtains publishing access',text:'The authorised partner authenticates to the agreed Domain’s Key Service and obtains a Non-Captive Lease.',kind:'key'},
      {title:'Protect and forward the observation',text:'The partner encrypts the drone observation. Shared intermediaries carry the resulting Envelope without decryption keys.'},
      {title:'Field application requests access',text:'The SOF application authenticates to the same Key Service. Its Claims and the observation’s Attributes permit the requested read operation.',kind:'key'},
      {title:'Decrypt at the field endpoint',text:'The field application uses the permitted material to read the delivered observation locally.'},
    ],
  },
  'allied-radio-mesh': {
    title:'Encrypted endpoint traffic crosses an allied mesh; key access remains separate',
    description:'Two application endpoints share a CABE Domain but use an ally-operated radio mesh as transport. The Key Service has separate access relationships with each endpoint. Three mesh relays forward encrypted traffic and hold no application decryption keys. The logical Domain is not the radio network.',
    assumption:'Existing data connectivity · endpoint key access · Non-Captive Keys',
    height:410,domains:domain(410),
    nodes:[
      node('key',290,64,300,'Key Service',['Endpoint access decisions'],'key'),
      node('sender',40,240,190,'Sending application',['Encrypts locally']),
      node('mesh',300,210,280,'Allied radio mesh',['Radio → relay → radio','No application keys'],'store'),
      node('receiver',650,240,190,'Receiving application',['Decrypts locally'],'trusted'),
    ],
    edges:[{path:'M230 278H300'},{path:'M580 278H650'},{path:'M290 101H135V240',kind:'key'},{path:'M590 101H745V240',kind:'key'}],
    labels:[{x:440,y:348,text:'Available network path · distinct from the logical CABE Domain'}],
    caption:'Solid arrows cross the existing mesh. Dashed arrows show the endpoints’ key access relationships, not necessarily separate physical links. Transport operators are not given application keys.',
    mobile:[
      {title:'Endpoint key access',text:'Both applications can authenticate to one logical Key Service. The sender has an authorised Non-Captive Lease.',kind:'key'},
      {title:'Sender encrypts',text:'The application protects its Messages before handing Envelopes to the radio network.'},
      {title:'Radio → relay → radio',text:'The allied mesh supplies an existing data connection. Its operators and intermediate relays are not given application keys.'},
      {title:'Receiver obtains permitted material',text:'The receiving application requests key access and decrypts at the endpoint. Domain membership is not defined by the physical radio path.',kind:'key'},
    ],
  },
  'intermittent-links': {
    title:'A prepared Target Domain recovers keys locally after intermittent delivery',
    description:'An Origin Domain Key Service issues a Non-Captive Lease and prepares an FLP for an included Target Domain. The producer sends the Envelope and FLP through a store-and-forward path. The Target recipient presents the package to its local Key Service, which verifies it, recovers the key material and evaluates access without a live Origin request.',
    assumption:'Target included at Lease creation · usable FLP and local federation secret',
    height:475,
    domains:[{x:16,y:16,width:296,height:443,label:'Origin Domain'},{x:568,y:16,width:296,height:443,label:'Included Target Domain'}],
    nodes:[
      node('origin',35,65,258,'Origin Key Service',['Creates Lease + target FLP'],'key'),
      node('producer',45,292,240,'Producer',['Envelope + attached FLP']),
      node('carrier',337,267,205,'Intermittent path',['Store / forward / carry','No Lease Key'],'store'),
      node('target',587,65,258,'Target Key Service',['Verifies FLP; recovers key','Evaluates local access'],'key'),
      node('recipient',596,292,240,'Local recipient',['Quotes FLP; reads locally'],'trusted'),
    ],
    edges:[{path:'M165 138V292',kind:'key'},{path:'M285 329H337'},{path:'M542 329H596'},{path:'M716 159V292',kind:'key'}],
    labels:[{x:440,y:196,text:'No live Origin request'},{x:440,y:218,text:'needed when reading'}],
    caption:'The Envelope carries the applicable Federated Lease Package. The prepared Target Key Service remains available locally and is trusted with recovered Lease Key material; the carrier is not.',
    mobile:[
      {title:'Origin Domain · prepare the Lease',text:'During Prograde Resolution, the Origin Key Service includes the Target Domain and creates its FLP for a Non-Captive Lease.',kind:'key'},
      {title:'Envelope + applicable FLP',text:'The producer sends both through an intermittent link, store-and-forward path or carried storage. The carrier holds no Lease Key.'},
      {title:'Target Domain · local request',text:'The recipient quotes the FLP and Envelope identifiers to its functioning local Key Service.',kind:'key'},
      {title:'Verify, recover and decide',text:'Using its federation secret material, that service verifies the FLP and matching identifiers, recovers the Lease Key and evaluates access. No live Origin request is needed.',kind:'key'},
    ],
  },
  'derived-results': {
    title:'Trusted plaintext processing creates a separately protected result',
    description:'Restricted input Envelopes reach a trusted processing application. The Key Service authorises reading the inputs and publishing a different output Attribute Set. The application decrypts, analyses and makes the release decision, then produces a new result Envelope for another audience. The output audience has result access, not input access.',
    assumption:'Explicit release rules · distinct input/output Attribute Sets and key arrangements',
    height:475,domains:domain(475),
    nodes:[
      node('key',275,65,330,'Key Service',['Input read + output publish permissions'],'key'),
      node('inputs',35,260,185,'Restricted inputs',['Input Envelopes'],'envelope'),
      node('processor',275,228,330,'Trusted processing application',['Decrypt → analyse → decide release','New Message + own Attribute Set'],'trusted'),
      node('output',660,260,180,'Released result',['New output Envelope'],'envelope'),
      node('reader',640,365,200,'Result audience',['Result access only'],'trusted'),
    ],
    edges:[{path:'M220 297H275'},{path:'M605 297H660'},{path:'M750 333V365'},
      {path:'M440 138V228',kind:'key'},{path:'M605 101H852V402H840',kind:'key'}],
    caption:'The trusted application handles plaintext and makes the release decision. The outgoing object is a new Message with its own protection; relabelling an input Envelope does not produce this result.',
    mobile:[
      {title:'Restricted input Envelopes',text:'The processing application receives protected observations under the restricted input Attribute Sets.'},
      {title:'Authorised input read',text:'The Key Service evaluates the processor’s authenticated request for input material.',kind:'key'},
      {title:'Trusted plaintext processing',text:'The application decrypts, analyses and determines what result its release rules permit. This is the explicit release boundary.',kind:'control'},
      {title:'New protected result',text:'The processor constructs a new Message, assigns the output Attribute Set and obtains an authorised output Lease. It encrypts a distinct result Envelope.',kind:'key'},
      {title:'Different audience',text:'The recipient receives the result and requests its permitted material. Result access does not grant restricted input access.',kind:'key'},
    ],
  },
  'workflow-coordination': {
    title:'Task coordination, encrypted delivery and worker key access are separate flows',
    description:'A coordinator sends task and object references to analysis and maintenance workers. Storage sends encrypted inputs to each worker. A Key Service separately permits analysis to read observations but refuses equipment status, while maintenance has the converse permissions. The coordinator has neither input key; permitted workers process plaintext.',
    assumption:'Workers authenticate as themselves · separate product key arrangements',
    height:530,domains:domain(530),
    nodes:[
      node('coordinator',320,63,255,'Workflow coordinator',['Tasks and object references','No worker input keys'],'control'),
      node('store',35,208,235,'Shared input storage',['Observation Envelopes','Equipment-status Envelopes'],'store'),
      node('key',35,379,235,'Key Service',['Evaluates worker requests'],'key'),
      node('analysis',620,210,220,'Analysis worker',['Observations: permitted','Equipment status: refused','Plaintext processing'],'trusted'),
      node('maintenance',620,377,220,'Maintenance worker',['Equipment status: permitted','Observations: refused','Plaintext processing'],'trusted'),
    ],
    edges:[{path:'M575 98H732V210',kind:'control'},{path:'M575 121H851V435H840',kind:'control'},
      {path:'M270 245H620'},{path:'M270 275H540V408H620'},
      {path:'M270 416H410V292H620',kind:'key'},{path:'M270 434H470V465H620',kind:'key'}],
    caption:'Dotted arrows are task/reference traffic, solid arrows deliver Envelopes, and dashed arrows represent key requests and decisions. The authenticated workers, not the coordinator, obtain their permitted input material.',
    mobile:[
      {title:'Coordinator dispatches tasks',text:'Dotted task/reference flow sends object locations and work instructions to two workers. The coordinator has neither worker’s input keys.',kind:'control'},
      {title:'Storage delivers protected inputs',text:'Solid encrypted delivery supplies observation and equipment-status Envelopes. A reference is not permission to decrypt.'},
      {title:'Analysis worker authenticates',text:'Dashed key access permits observations and refuses equipment status. The worker processes its permitted plaintext inputs.',kind:'key'},
      {title:'Maintenance worker authenticates',text:'Its separate request permits equipment status and refuses observations. Workflow controls still constrain each worker’s tasks and results.',kind:'key'},
    ],
  },
  'supplier-diagnostics': {
    title:'Two deliberately separate products, selective supplier access',
    description:'An operator publishes distinct fault records and operational observations through shared collection and storage. A Key Service grants the supplier fault-record access and refuses observation access. An operator application is permitted observations. The shared collection service has neither product key.',
    assumption:'Producer selects diagnostic content · distinct products and key arrangements',
    height:490,domains:domain(490),
    nodes:[
      node('key',300,65,280,'Key Service',['Evaluates product permissions'],'key'),
      node('faults',35,210,225,'Operator · diagnostics',['Publishes fault records','Diagnostic Attribute Set']),
      node('observations',35,359,225,'Operator · operations',['Publishes observations','Operational Attribute Set']),
      node('collection',325,287,230,'Shared collection',['Stores both products','No decryption keys'],'store'),
      node('supplier',605,203,235,'Supplier diagnostic app',['Fault records: permitted','Observations: refused'],'trusted'),
      node('operator',605,363,235,'Operator application',['Observations: permitted'],'trusted'),
    ],
    edges:[{path:'M260 247H287V319H325'},{path:'M260 396H287V350H325'},
      {path:'M555 319H578V250H605'},{path:'M578 319V400H605'},
      {path:'M300 102H115V210',kind:'key'},{path:'M300 120H20V395H35',kind:'key'},
      {path:'M580 102H725V203',kind:'key'},{path:'M580 120H852V400H840',kind:'key'}],
    caption:'The producer chooses the content of each product before encryption. The supplier receives fault-record access through shared collection infrastructure, without receiving observation keys or the whole operational dataset.',
    mobile:[
      {title:'Publish two distinct products',text:'The operator deliberately separates fault records from operational observations, with different Attribute Sets and key arrangements.',kind:'control'},
      {title:'Share collection infrastructure',text:'Both products are encrypted before entering the same collection and storage service. That service has no product keys.'},
      {title:'Supplier · selective key access',text:'The authenticated diagnostic application is permitted fault-record material and refused operational-observation material.',kind:'key'},
      {title:'Operator · operational access',text:'The operator’s application requests and receives its permitted observation material. Each application handles its own authorised plaintext.',kind:'key'},
    ],
  },
};
