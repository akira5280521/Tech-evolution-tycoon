// Research Servers layered room — condition mapping only. The art (raised
// floor for the Cray years, 1990s+ racks) is still being finished under
// /workspace/mockups/rooms/research-servers/layered/. Do not import those
// assets until Andrew says they are ready. ready: false keeps the page on
// a slim "Room coming soon" strip. When the sprites land, point each slot
// at its file and flip ready.
export const SERVERS_ROOM = {
  facilityId: "servers",
  ready: false,
  width: 360,
  height: 200,
  notes: "Art not imported. Mapping is ready for the Inland 601 (max 6), machine-room computers and their power/cooling kit, Cray-era liquid coolants, disks, and later racks.",
  slots: [
    // Starter punch-card machine: up to six on the benches, each shown once owned.
    ...[1, 2, 3, 4, 5, 6].map((n) => ({
      id: `tab601-${n}`,
      z: 10,
      variants: [
        {
          unlockId: "tab601",
          condition: { facilityId: "servers", partId: "tab601", minParts: n },
          note: `The ${n} of at most 6 Inland 601 Multiplying Punches.`,
        },
      ],
    })),
    // Machine-room computers (valve / transistor / IC room, then Crays).
    ...[
      "mark1", "ibm7090", "s360", "pdp1120", "vax780",
      "cray1", "xmp", "cray2", "ymp", "c90", "t3d", "t90", "t3e",
      "xt3", "xt5", "xc30", "crayex",
      "cm5", "alpha8400", "origin2000", "e10k",
    ].map((id) => ({
      id,
      z: 20,
      variants: [{ unlockId: id, condition: { facilityId: "servers", partId: id, minParts: 1 } }],
    })),
    // Raised floor: once a Cray-era machine is in the room (1976+).
    {
      id: "raised-floor",
      z: 2,
      variants: [
        { condition: { facilityId: "servers", partId: "cray1", minParts: 1 }, note: "Raised floor for the Chippewa / Cray years." },
      ],
    },
    // Power and cooling for the machine room, then rack cooling.
    ...["mgset", "roomac", "freon", "fluorinert", "chiller", "labfan", "psuAT", "psu400"].map((id) => ({
      id,
      z: 12,
      variants: [{ unlockId: id, condition: { facilityId: "servers", partId: id, minParts: 1 } }],
    })),
    // Disks and tape.
    ...["tape", "ramac", "pack2311", "pack3330", "disk3380", "disk10k", "hdd1t", "symm", "thumper", "pod", "flasharray", "ssd2t"].map((id) => ({
      id,
      z: 14,
      variants: [{ unlockId: id, condition: { facilityId: "servers", partId: id, minParts: 1 } }],
    })),
    // 1989+ towers and 1990s+ racks, plus networking.
    ...["towerT4", "rack2u", "bladeB2", "rack1", "rack4", "calx", "altra",
      "l-synoptix", "l-cat5000", "l-cat6500", "l-nexus5000", "l-is4", "l-edr", "l-quantum",
    ].map((id) => ({
      id,
      z: 22,
      variants: [{ unlockId: id, condition: { facilityId: "servers", partId: id, minParts: 1 } }],
    })),
  ],
};
