// Research Servers layered room. Converted from the approved slots.json and
// inventory.txt (360×200). Era bases switch by stage. roomac.png is used on
// the 1930s–1977 machine-room stages; roomac-floor.png only on the 16 later
// (1976+ raised-floor / 1999+ data-center) stages at (300,84).
export const SERVERS_STAGE_DEFS = [
  {
    "id": "era-1930s-start",
    "key": "1930s",
    "stage": "start",
    "year": 1931,
    "base": "1930s",
    "trigger": null
  },
  {
    "id": "era-1930s-mid",
    "key": "1930s",
    "stage": "mid",
    "year": 1931,
    "base": "1930s",
    "trigger": {
      "partId": "tab601",
      "minParts": 3
    }
  },
  {
    "id": "era-1930s-maxed",
    "key": "1930s",
    "stage": "maxed",
    "year": 1931,
    "base": "1930s",
    "trigger": {
      "partId": "tab601",
      "minParts": 6
    }
  },
  {
    "id": "era-1951-start",
    "key": "1951",
    "stage": "start",
    "year": 1951,
    "base": "1951+",
    "trigger": {
      "partId": "mark1",
      "minParts": 1
    }
  },
  {
    "id": "era-1951-mid",
    "key": "1951",
    "stage": "mid",
    "year": 1951,
    "base": "1951+",
    "trigger": {
      "partId": "tape",
      "minParts": 2
    }
  },
  {
    "id": "era-1951-maxed",
    "key": "1951",
    "stage": "maxed",
    "year": 1951,
    "base": "1951+",
    "trigger": {
      "partId": "ramac",
      "minParts": 1
    }
  },
  {
    "id": "era-1959-7090",
    "key": "1959",
    "year": 1959,
    "base": "1951+",
    "trigger": {
      "partId": "ibm7090",
      "minParts": 1
    }
  },
  {
    "id": "era-1965-s360",
    "key": "1965",
    "year": 1965,
    "base": "1951+",
    "trigger": {
      "partId": "s360",
      "minParts": 1
    }
  },
  {
    "id": "era-1970-pdp1120",
    "key": "1970",
    "year": 1970,
    "base": "1951+",
    "trigger": {
      "partId": "pdp1120",
      "minParts": 1
    }
  },
  {
    "id": "era-1977-vax780",
    "key": "1977",
    "year": 1977,
    "base": "1951+",
    "trigger": {
      "partId": "vax780",
      "minParts": 1
    }
  },
  {
    "id": "era-1976-cray1",
    "key": "1976",
    "year": 1976,
    "base": "1976+",
    "trigger": {
      "partId": "cray1",
      "minParts": 1
    }
  },
  {
    "id": "era-1982-xmp",
    "key": "1982",
    "year": 1982,
    "base": "1976+",
    "trigger": {
      "partId": "xmp",
      "minParts": 1
    }
  },
  {
    "id": "era-1985-cray2",
    "key": "1985",
    "year": 1985,
    "base": "1976+",
    "trigger": {
      "partId": "cray2",
      "minParts": 1
    }
  },
  {
    "id": "era-1988-ymp",
    "key": "1988",
    "year": 1988,
    "base": "1976+",
    "trigger": {
      "partId": "ymp",
      "minParts": 1
    }
  },
  {
    "id": "era-1991-c90",
    "key": "1991",
    "year": 1991,
    "base": "1976+",
    "trigger": {
      "partId": "c90",
      "minParts": 1
    }
  },
  {
    "id": "era-1989-tower",
    "key": "1989",
    "year": 1989,
    "base": "1976+",
    "trigger": {
      "partId": "towerT4",
      "minParts": 1
    }
  },
  {
    "id": "era-1991-cm5",
    "key": "1991",
    "year": 1991,
    "base": "1976+",
    "trigger": {
      "partId": "cm5",
      "minParts": 1
    }
  },
  {
    "id": "era-1993-t3d",
    "key": "1993",
    "year": 1993,
    "base": "1976+",
    "trigger": {
      "partId": "t3d",
      "minParts": 1
    }
  },
  {
    "id": "era-1995-t90",
    "key": "1995",
    "year": 1995,
    "base": "1976+",
    "trigger": {
      "partId": "t90",
      "minParts": 1
    }
  },
  {
    "id": "era-1996-origin",
    "key": "1996",
    "year": 1996,
    "base": "1976+",
    "trigger": {
      "anyParts": [
        "t3e",
        "origin2000"
      ]
    }
  },
  {
    "id": "era-1997-e10k",
    "key": "1997",
    "year": 1997,
    "base": "1976+",
    "trigger": {
      "partId": "e10k",
      "minParts": 1
    }
  },
  {
    "id": "era-1999-racks",
    "key": "1999",
    "year": 1999,
    "base": "1999+",
    "trigger": {
      "partId": "rack2u",
      "minParts": 1
    }
  },
  {
    "id": "era-2004-xt3",
    "key": "2004",
    "year": 2004,
    "base": "1999+",
    "trigger": {
      "partId": "xt3",
      "minParts": 1
    }
  },
  {
    "id": "era-2008-xt5",
    "key": "2008",
    "year": 2008,
    "base": "1999+",
    "trigger": {
      "partId": "xt5",
      "minParts": 1
    }
  },
  {
    "id": "era-2012-xc30",
    "key": "2012",
    "year": 2012,
    "base": "1999+",
    "trigger": {
      "partId": "xc30",
      "minParts": 1
    }
  },
  {
    "id": "era-2021-ex",
    "key": "2021",
    "year": 2021,
    "base": "1999+",
    "trigger": {
      "partId": "crayex",
      "minParts": 1
    }
  }
];

export const SERVERS_ROOM = {
  facilityId: "servers",
  ready: true,
  width: 360,
  height: 200,
  variantRule: "stage list + last match wins",
  bases: {
    "1930s": { sprite: "/rooms/servers/base-1930s.png", x: 0, y: 0, z: 0, w: 360, h: 200 },
    "1951+": { sprite: "/rooms/servers/base-1950s.png", x: 0, y: 0, z: 0, w: 360, h: 200 },
    "1976+": { sprite: "/rooms/servers/base-raised.png", x: 0, y: 0, z: 0, w: 360, h: 200 },
    "1999+": { sprite: "/rooms/servers/base-datacenter.png", x: 0, y: 0, z: 0, w: 360, h: 200 },
  },
  base: { sprite: "/rooms/servers/base-1930s.png", x: 0, y: 0, z: 0, w: 360, h: 200 },
  slots: [
    {
      id: "lamp-motes",
      flavor: true,
      z: 6,
      variants: [
        {
          sprite: "/rooms/servers/sprites/lamp-motes.png",
          strip: "/rooms/servers/sprites/lamp-motes-strip.png",
          x: 136, y: 30, w: 206, h: 68,
          condition: { era: "1951+" },
          animation: {"frames": 24, "durationMs": 70, "kind": "strip"},
          note: "Hanging lamp flicker and window motes, 1951 onward.",
        },
      ],
    },
    // Inland 601 at full sprite size (52x63). Sized from photos of the real
    // IBM 601 (Museum fur Kommunikation Bern, Milan science museum): about
    // 50-52 in tall. The room's door is about 85 px for 80 in (1.06 px/in), so
    // the ~58 px of machine in the sprite is ~54 in. Bottoms stay where they were.
    {
      id: "tab601-1",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 188, "y": 90, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 1, "facilityId": "servers", "stageId": "era-1930s-start"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 176, "y": 84, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 1, "facilityId": "servers", "stageId": "era-1930s-mid"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 108, "y": 84, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 1, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tab601-2",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 212, "y": 84, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 2, "facilityId": "servers", "stageId": "era-1930s-mid"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 156, "y": 84, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 2, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tab601-3",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 198, "y": 90, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 3, "facilityId": "servers", "stageId": "era-1930s-mid"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 204, "y": 84, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 3, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tab601-4",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 126, "y": 90, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 4, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tab601-5",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 172, "y": 90, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 5, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tab601-6",
      flavor: false,
      z: 30,
      unlockId: "tab601",
      variants: [
        {"sprite": "/rooms/servers/sprites/tab601.png", "unlockId": "tab601", "x": 210, "y": 90, "w": 52, "h": 63, "condition": {"partId": "tab601", "minParts": 6, "facilityId": "servers", "stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/tab601-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "mark1",
      flavor: false,
      z: 40,
      unlockId: "mark1",
      variants: [
        {"sprite": "/rooms/servers/sprites/mark1.png", "x": 116, "y": 46, "w": 134, "h": 105, "condition": {"stageId": "era-1951-start", "partId": "mark1", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mark1", "strip": "/rooms/servers/sprites/mark1-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/mark1.png", "x": 116, "y": 46, "w": 134, "h": 105, "condition": {"stageId": "era-1951-mid", "partId": "mark1", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mark1", "strip": "/rooms/servers/sprites/mark1-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/mark1.png", "x": 116, "y": 46, "w": 134, "h": 105, "condition": {"stageId": "era-1951-maxed", "partId": "mark1", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mark1", "strip": "/rooms/servers/sprites/mark1-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "ibm7090",
      flavor: false,
      z: 40,
      unlockId: "ibm7090",
      variants: [
        {"sprite": "/rooms/servers/sprites/ibm7090.png", "x": 118, "y": 56, "w": 122, "h": 99, "condition": {"stageId": "era-1959-7090", "partId": "ibm7090", "minParts": 1, "facilityId": "servers", "researchId": "srv-7090"}, "unlockId": "ibm7090"},
      ],
    },
    {
      id: "s360",
      flavor: false,
      z: 40,
      unlockId: "s360",
      variants: [
        {"sprite": "/rooms/servers/sprites/s360.png", "x": 118, "y": 60, "w": 94, "h": 95, "condition": {"stageId": "era-1965-s360", "partId": "s360", "minParts": 1, "facilityId": "servers", "researchId": "srv-360"}, "unlockId": "s360"},
      ],
    },
    {
      id: "pdp1120",
      flavor: false,
      z: 40,
      unlockId: "pdp1120",
      variants: [
        {"sprite": "/rooms/servers/sprites/pdp1120.png", "x": 130, "y": 58, "w": 60, "h": 97, "condition": {"stageId": "era-1970-pdp1120", "partId": "pdp1120", "minParts": 1, "facilityId": "servers", "researchId": "srv-1120"}, "unlockId": "pdp1120"},
      ],
    },
    {
      id: "vax780",
      flavor: false,
      z: 40,
      unlockId: "vax780",
      variants: [
        {"sprite": "/rooms/servers/sprites/vax780.png", "x": 118, "y": 54, "w": 102, "h": 101, "condition": {"stageId": "era-1977-vax780", "partId": "vax780", "minParts": 1, "facilityId": "servers", "researchId": "srv-780"}, "unlockId": "vax780"},
      ],
    },
    {
      id: "cray1",
      flavor: false,
      z: 40,
      unlockId: "cray1",
      variants: [
        {"sprite": "/rooms/servers/sprites/cray1.png", "x": 118, "y": 94, "w": 101, "h": 87, "condition": {"stageId": "era-1976-cray1", "partId": "cray1", "minParts": 1, "facilityId": "servers", "researchId": "srv-cray1"}, "unlockId": "cray1"},
      ],
    },
    {
      id: "xmp",
      flavor: false,
      z: 40,
      unlockId: "xmp",
      variants: [
        {"sprite": "/rooms/servers/sprites/xmp.png", "x": 118, "y": 97, "w": 101, "h": 84, "condition": {"stageId": "era-1982-xmp", "partId": "xmp", "minParts": 1, "facilityId": "servers", "researchId": "srv-xmp"}, "unlockId": "xmp"},
      ],
    },
    {
      id: "cray2",
      flavor: false,
      z: 40,
      unlockId: "cray2",
      variants: [
        {"sprite": "/rooms/servers/sprites/cray2.png", "x": 125, "y": 118, "w": 84, "h": 63, "condition": {"stageId": "era-1985-cray2", "partId": "cray2", "minParts": 1, "facilityId": "servers", "researchId": "srv-cray2"}, "unlockId": "cray2", "strip": "/rooms/servers/sprites/cray2-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "ymp",
      flavor: false,
      z: 40,
      unlockId: "ymp",
      variants: [
        {"sprite": "/rooms/servers/sprites/ymp.png", "x": 114, "y": 84, "w": 104, "h": 97, "condition": {"stageId": "era-1988-ymp", "partId": "ymp", "minParts": 1, "facilityId": "servers", "researchId": "srv-ymp"}, "unlockId": "ymp"},
      ],
    },
    {
      id: "c90",
      flavor: false,
      z: 40,
      unlockId: "c90",
      variants: [
        {"sprite": "/rooms/servers/sprites/c90.png", "x": 100, "y": 80, "w": 118, "h": 101, "condition": {"stageId": "era-1991-c90", "partId": "c90", "minParts": 1, "facilityId": "servers", "researchId": "srv-c90"}, "unlockId": "c90"},
      ],
    },
    {
      id: "mgset",
      flavor: false,
      z: 25,
      unlockId: "mgset",
      variants: [
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1951-start", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1951-mid", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1951-maxed", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1959-7090", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1965-s360", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1970-pdp1120", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1977-vax780", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1976-cray1", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1982-xmp", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1985-cray2", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1988-ymp", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1991-c90", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1989-tower", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1991-cm5", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1993-t3d", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1995-t90", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1996-origin", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
        {"sprite": "/rooms/servers/sprites/mgset.png", "x": 16, "y": 147, "w": 65, "h": 34, "condition": {"stageId": "era-1997-e10k", "partId": "mgset", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "mgset"},
      ],
    },
    {
      id: "roomac",
      flavor: false,
      z: 35,
      unlockId: "roomac",
      variants: [
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1951-start", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1951-mid", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1951-maxed", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1959-7090", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1965-s360", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1970-pdp1120", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac.png", "x": 300, "y": 84, "w": 52, "h": 78, "condition": {"stageId": "era-1977-vax780", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1976-cray1", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1982-xmp", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1985-cray2", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1988-ymp", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1991-c90", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1989-tower", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1991-cm5", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1993-t3d", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1995-t90", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1996-origin", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1997-e10k", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-1999-racks", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-2004-xt3", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-2008-xt5", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-2012-xc30", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
        {"sprite": "/rooms/servers/sprites/roomac-floor.png", "x": 300, "y": 84, "w": 52, "h": 64, "condition": {"stageId": "era-2021-ex", "partId": "roomac", "minParts": 1, "facilityId": "servers", "researchId": "srv-mark1"}, "unlockId": "roomac"},
      ],
    },
    {
      id: "tape",
      flavor: false,
      z: 30,
      unlockId: "tape",
      variants: [
        {"sprite": "/rooms/servers/sprites/tape.png", "x": 72, "y": 48, "w": 48, "h": 102, "condition": {"stageId": "era-1951-start", "partId": "tape", "minParts": 1, "facilityId": "servers", "researchId": "store-tape"}, "unlockId": "tape", "strip": "/rooms/servers/sprites/tape-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tape.png", "x": 72, "y": 48, "w": 48, "h": 102, "condition": {"stageId": "era-1951-mid", "partId": "tape", "minParts": 1, "facilityId": "servers", "researchId": "store-tape"}, "unlockId": "tape", "strip": "/rooms/servers/sprites/tape-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tape.png", "x": 72, "y": 48, "w": 48, "h": 102, "condition": {"stageId": "era-1951-maxed", "partId": "tape", "minParts": 1, "facilityId": "servers", "researchId": "store-tape"}, "unlockId": "tape", "strip": "/rooms/servers/sprites/tape-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "tape-2",
      flavor: false,
      z: 30,
      unlockId: "tape",
      variants: [
        {"sprite": "/rooms/servers/sprites/tape-2.png", "x": 252, "y": 48, "w": 48, "h": 102, "condition": {"stageId": "era-1951-mid", "partId": "tape", "minParts": 2, "facilityId": "servers", "researchId": "store-tape"}, "unlockId": "tape", "strip": "/rooms/servers/sprites/tape-2-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/tape-2.png", "x": 252, "y": 48, "w": 48, "h": 102, "condition": {"stageId": "era-1951-maxed", "partId": "tape", "minParts": 2, "facilityId": "servers", "researchId": "store-tape"}, "unlockId": "tape", "strip": "/rooms/servers/sprites/tape-2-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "ramac",
      flavor: false,
      z: 28,
      unlockId: "ramac",
      variants: [
        {"sprite": "/rooms/servers/sprites/ramac.png", "x": 200, "y": 80, "w": 62, "h": 101, "condition": {"stageId": "era-1951-maxed", "partId": "ramac", "minParts": 1, "facilityId": "servers", "researchId": "store-hdd"}, "unlockId": "ramac"},
        {"sprite": "/rooms/servers/sprites/ramac.png", "x": 72, "y": 54, "w": 62, "h": 101, "condition": {"stageId": "era-1959-7090", "partId": "ramac", "minParts": 1, "facilityId": "servers", "researchId": "store-hdd"}, "unlockId": "ramac"},
      ],
    },
    {
      id: "pack2311",
      flavor: false,
      z: 28,
      unlockId: "pack2311",
      variants: [
        {"sprite": "/rooms/servers/sprites/pack2311.png", "x": 72, "y": 94, "w": 38, "h": 61, "condition": {"stageId": "era-1965-s360", "partId": "pack2311", "minParts": 1, "facilityId": "servers", "researchId": "store-pack"}, "unlockId": "pack2311"},
      ],
    },
    {
      id: "pack3330",
      flavor: false,
      z: 28,
      unlockId: "pack3330",
      variants: [
        {"sprite": "/rooms/servers/sprites/pack3330.png", "x": 72, "y": 86, "w": 40, "h": 69, "condition": {"stageId": "era-1970-pdp1120", "partId": "pack3330", "minParts": 1, "facilityId": "servers", "researchId": "store-3330"}, "unlockId": "pack3330"},
        {"sprite": "/rooms/servers/sprites/pack3330.png", "x": 72, "y": 86, "w": 40, "h": 69, "condition": {"stageId": "era-1977-vax780", "partId": "pack3330", "minParts": 1, "facilityId": "servers", "researchId": "store-3330"}, "unlockId": "pack3330"},
        {"sprite": "/rooms/servers/sprites/pack3330.png", "x": 72, "y": 86, "w": 40, "h": 69, "condition": {"stageId": "era-1976-cray1", "partId": "pack3330", "minParts": 1, "facilityId": "servers", "researchId": "store-3330"}, "unlockId": "pack3330"},
      ],
    },
    {
      id: "disk3380",
      flavor: false,
      z: 28,
      unlockId: "disk3380",
      variants: [
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1982-xmp", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1985-cray2", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1988-ymp", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1991-c90", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1989-tower", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
        {"sprite": "/rooms/servers/sprites/disk3380.png", "x": 72, "y": 62, "w": 42, "h": 93, "condition": {"stageId": "era-1991-cm5", "partId": "disk3380", "minParts": 1, "facilityId": "servers", "researchId": "store-3380"}, "unlockId": "disk3380"},
      ],
    },
    {
      id: "freon",
      flavor: false,
      z: 26,
      unlockId: "freon",
      variants: [
        {"sprite": "/rooms/servers/sprites/freon.png", "x": 224, "y": 145, "w": 48, "h": 36, "condition": {"stageId": "era-1976-cray1", "partId": "freon", "minParts": 1, "facilityId": "servers", "researchId": "srv-cray1"}, "unlockId": "freon"},
        {"sprite": "/rooms/servers/sprites/freon.png", "x": 224, "y": 145, "w": 48, "h": 36, "condition": {"stageId": "era-1982-xmp", "partId": "freon", "minParts": 1, "facilityId": "servers", "researchId": "srv-cray1"}, "unlockId": "freon"},
      ],
    },
    {
      id: "fluorinert",
      flavor: false,
      z: 26,
      unlockId: "fluorinert",
      variants: [
        {"sprite": "/rooms/servers/sprites/fluorinert.png", "x": 214, "y": 144, "w": 42, "h": 37, "condition": {"stageId": "era-1985-cray2", "partId": "fluorinert", "minParts": 1, "facilityId": "servers", "researchId": "srv-cray2"}, "unlockId": "fluorinert", "strip": "/rooms/servers/sprites/fluorinert-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "chiller",
      flavor: false,
      z: 26,
      unlockId: "chiller",
      variants: [
        {"sprite": "/rooms/servers/sprites/chiller.png", "x": 220, "y": 144, "w": 51, "h": 37, "condition": {"stageId": "era-1988-ymp", "partId": "chiller", "minParts": 1, "facilityId": "servers", "researchId": "srv-ymp"}, "unlockId": "chiller"},
        {"sprite": "/rooms/servers/sprites/chiller.png", "x": 220, "y": 144, "w": 51, "h": 37, "condition": {"stageId": "era-1991-c90", "partId": "chiller", "minParts": 1, "facilityId": "servers", "researchId": "srv-ymp"}, "unlockId": "chiller"},
        {"sprite": "/rooms/servers/sprites/chiller.png", "x": 226, "y": 123, "w": 51, "h": 37, "condition": {"stageId": "era-1993-t3d", "partId": "chiller", "minParts": 1, "facilityId": "servers", "researchId": "srv-ymp"}, "unlockId": "chiller"},
        {"sprite": "/rooms/servers/sprites/chiller.png", "x": 214, "y": 145, "w": 51, "h": 37, "condition": {"stageId": "era-1995-t90", "partId": "chiller", "minParts": 1, "facilityId": "servers", "researchId": "srv-ymp"}, "unlockId": "chiller"},
      ],
    },
    {
      id: "cat-1930s",
      flavor: true,
      z: 50,
      variants: [
        {"sprite": "/rooms/servers/sprites/cat-1930s.png", "x": 269, "y": 128, "w": 28, "h": 25, "condition": {"stageId": "era-1930s-start"}, "strip": "/rooms/servers/sprites/cat-1930s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-1930s.png", "x": 269, "y": 128, "w": 28, "h": 25, "condition": {"stageId": "era-1930s-mid"}, "strip": "/rooms/servers/sprites/cat-1930s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-1930s.png", "x": 269, "y": 128, "w": 28, "h": 25, "condition": {"stageId": "era-1930s-maxed"}, "strip": "/rooms/servers/sprites/cat-1930s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "cat-1950s",
      flavor: true,
      z: 55,
      variants: [
        {"sprite": "/rooms/servers/sprites/cat-1950s.png", "x": 78, "y": 38, "w": 36, "h": 22, "condition": {"stageId": "era-1951-start"}, "strip": "/rooms/servers/sprites/cat-1950s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-1950s.png", "x": 78, "y": 38, "w": 36, "h": 22, "condition": {"stageId": "era-1951-mid"}, "strip": "/rooms/servers/sprites/cat-1950s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-1950s.png", "x": 78, "y": 38, "w": 36, "h": 22, "condition": {"stageId": "era-1951-maxed"}, "strip": "/rooms/servers/sprites/cat-1950s-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "cat-later",
      flavor: true,
      z: 55,
      variants: [
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1959-7090"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1965-s360"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1970-pdp1120"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1977-vax780"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1976-cray1"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1982-xmp"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1985-cray2"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1988-ymp"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1991-c90"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1989-tower"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1991-cm5"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1993-t3d"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1995-t90"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1996-origin"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1997-e10k"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-1999-racks"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-2004-xt3"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-2008-xt5"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-2012-xc30"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
        {"sprite": "/rooms/servers/sprites/cat-later.png", "x": 274, "y": 166, "w": 36, "h": 22, "condition": {"stageId": "era-2021-ex"}, "strip": "/rooms/servers/sprites/cat-later-strip.png", "animation": {"frames": 24, "durationMs": 70, "kind": "strip"}},
      ],
    },
    {
      id: "calendar-1930s",
      flavor: true,
      z: 10,
      variants: [
        {"sprite": "/rooms/servers/sprites/calendar-1930s.png", "x": 50, "y": 37, "w": 25, "h": 29, "condition": {"stageId": "era-1930s-mid"}},
        {"sprite": "/rooms/servers/sprites/calendar-1930s.png", "x": 50, "y": 37, "w": 25, "h": 29, "condition": {"stageId": "era-1930s-maxed"}},
      ],
    },
    {
      id: "filing-tall",
      flavor: true,
      z: 12,
      variants: [
        {"sprite": "/rooms/servers/sprites/filing-tall.png", "x": 50, "y": 85, "w": 29, "h": 63, "condition": {"stageId": "era-1930s-mid"}},
        {"sprite": "/rooms/servers/sprites/filing-tall.png", "x": 50, "y": 85, "w": 29, "h": 63, "condition": {"stageId": "era-1930s-maxed"}},
      ],
    },
    {
      id: "filing-short",
      flavor: true,
      z: 12,
      variants: [
        {"sprite": "/rooms/servers/sprites/filing-short.png", "x": 75, "y": 105, "w": 30, "h": 43, "condition": {"stageId": "era-1930s-mid"}},
        {"sprite": "/rooms/servers/sprites/filing-short.png", "x": 75, "y": 105, "w": 30, "h": 43, "condition": {"stageId": "era-1930s-maxed"}},
      ],
    },
    {
      id: "calendar",
      flavor: true,
      z: 8,
      variants: [
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1951-start"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1951-mid"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1951-maxed"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1959-7090"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1965-s360"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1970-pdp1120"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1977-vax780"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1976-cray1"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1982-xmp"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1985-cray2"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1988-ymp"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1991-c90"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1989-tower"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1991-cm5"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1993-t3d"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1995-t90"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1996-origin"}},
        {"sprite": "/rooms/servers/sprites/calendar.png", "x": 51, "y": 38, "w": 21, "h": 25, "condition": {"stageId": "era-1997-e10k"}},
      ],
    },
    {
      id: "filing",
      flavor: true,
      z: 12,
      variants: [
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1951-start"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1951-mid"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1951-maxed"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1959-7090"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1965-s360"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1970-pdp1120"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1977-vax780"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1976-cray1"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1982-xmp"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1985-cray2"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1988-ymp"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1991-c90"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1989-tower"}},
        {"sprite": "/rooms/servers/sprites/filing.png", "x": 45, "y": 106, "w": 27, "h": 42, "condition": {"stageId": "era-1991-cm5"}},
      ],
    },
    {
      id: "t3d",
      flavor: false,
      z: 40,
      unlockId: "t3d",
      variants: [
        {"sprite": "/rooms/servers/sprites/t3d.png", "x": 128, "y": 95, "w": 96, "h": 91, "condition": {"stageId": "era-1993-t3d", "partId": "t3d", "minParts": 1, "facilityId": "servers", "researchId": "srv-t3d"}, "unlockId": "t3d"},
      ],
    },
    {
      id: "t90",
      flavor: false,
      z: 40,
      unlockId: "t90",
      variants: [
        {"sprite": "/rooms/servers/sprites/t90.png", "x": 130, "y": 89, "w": 64, "h": 97, "condition": {"stageId": "era-1995-t90", "partId": "t90", "minParts": 1, "facilityId": "servers", "researchId": "srv-t90"}, "unlockId": "t90"},
      ],
    },
    {
      id: "t3e",
      flavor: false,
      z: 40,
      unlockId: "t3e",
      variants: [
        {"sprite": "/rooms/servers/sprites/t3e.png", "x": 88, "y": 91, "w": 97, "h": 95, "condition": {"stageId": "era-1996-origin", "partId": "t3e", "minParts": 1, "facilityId": "servers", "researchId": "srv-t3e"}, "unlockId": "t3e"},
      ],
    },
    {
      id: "xt3",
      flavor: false,
      z: 40,
      unlockId: "xt3",
      variants: [
        {"sprite": "/rooms/servers/sprites/xt3.png", "x": 104, "y": 89, "w": 94, "h": 97, "condition": {"stageId": "era-2004-xt3", "partId": "xt3", "minParts": 1, "facilityId": "servers", "researchId": "srv-xt3"}, "unlockId": "xt3"},
      ],
    },
    {
      id: "xt5",
      flavor: false,
      z: 40,
      unlockId: "xt5",
      variants: [
        {"sprite": "/rooms/servers/sprites/xt5.png", "x": 108, "y": 89, "w": 94, "h": 97, "condition": {"stageId": "era-2008-xt5", "partId": "xt5", "minParts": 1, "facilityId": "servers", "researchId": "srv-xt5"}, "unlockId": "xt5"},
      ],
    },
    {
      id: "xc30",
      flavor: false,
      z: 40,
      unlockId: "xc30",
      variants: [
        {"sprite": "/rooms/servers/sprites/xc30.png", "x": 100, "y": 91, "w": 112, "h": 95, "condition": {"stageId": "era-2012-xc30", "partId": "xc30", "minParts": 1, "facilityId": "servers", "researchId": "srv-xc30"}, "unlockId": "xc30"},
      ],
    },
    {
      id: "crayex",
      flavor: false,
      z: 40,
      unlockId: "crayex",
      variants: [
        {"sprite": "/rooms/servers/sprites/crayex.png", "x": 96, "y": 91, "w": 126, "h": 95, "condition": {"stageId": "era-2021-ex", "partId": "crayex", "minParts": 1, "facilityId": "servers", "researchId": "srv-crayex"}, "unlockId": "crayex"},
      ],
    },
    {
      id: "cm5",
      flavor: false,
      z: 40,
      unlockId: "cm5",
      variants: [
        {"sprite": "/rooms/servers/sprites/cm5.png", "x": 118, "y": 91, "w": 103, "h": 95, "condition": {"stageId": "era-1991-cm5", "partId": "cm5", "minParts": 1, "facilityId": "servers", "researchId": "srv-cm5"}, "unlockId": "cm5"},
      ],
    },
    {
      id: "alpha8400",
      flavor: false,
      z: 40,
      unlockId: "alpha8400",
      variants: [
        {"sprite": "/rooms/servers/sprites/alpha8400.png", "x": 72, "y": 63, "w": 52, "h": 97, "condition": {"stageId": "era-1995-t90", "partId": "alpha8400", "minParts": 1, "facilityId": "servers", "researchId": "srv-alpha"}, "unlockId": "alpha8400"},
      ],
    },
    {
      id: "origin2000",
      flavor: false,
      z: 40,
      unlockId: "origin2000",
      variants: [
        {"sprite": "/rooms/servers/sprites/origin2000.png", "x": 186, "y": 93, "w": 84, "h": 93, "condition": {"stageId": "era-1996-origin", "partId": "origin2000", "minParts": 1, "facilityId": "servers", "researchId": "srv-origin"}, "unlockId": "origin2000"},
        {"sprite": "/rooms/servers/sprites/origin2000.png", "x": 88, "y": 93, "w": 84, "h": 93, "condition": {"stageId": "era-1997-e10k", "partId": "origin2000", "minParts": 1, "facilityId": "servers", "researchId": "srv-origin"}, "unlockId": "origin2000"},
      ],
    },
    {
      id: "e10k",
      flavor: false,
      z: 40,
      unlockId: "e10k",
      variants: [
        {"sprite": "/rooms/servers/sprites/e10k.png", "x": 186, "y": 87, "w": 50, "h": 99, "condition": {"stageId": "era-1997-e10k", "partId": "e10k", "minParts": 1, "facilityId": "servers", "researchId": "srv-e10k"}, "unlockId": "e10k"},
      ],
    },
    {
      id: "towerT4",
      flavor: false,
      z: 38,
      unlockId: "towerT4",
      variants: [
        {"sprite": "/rooms/servers/sprites/towerT4.png", "x": 140, "y": 109, "w": 32, "h": 77, "condition": {"stageId": "era-1989-tower", "partId": "towerT4", "minParts": 1, "facilityId": "servers", "researchId": "srv-tower"}, "unlockId": "towerT4"},
      ],
    },
    {
      id: "rack2u",
      flavor: false,
      z: 38,
      unlockId: "rack2u",
      variants: [
        {"sprite": "/rooms/servers/sprites/rack2u.png", "x": 58, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-1999-racks", "partId": "rack2u", "minParts": 1, "facilityId": "servers", "researchId": "srv-2u"}, "unlockId": "rack2u"},
        {"sprite": "/rooms/servers/sprites/rack2u.png", "x": 56, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-2004-xt3", "partId": "rack2u", "minParts": 1, "facilityId": "servers", "researchId": "srv-2u"}, "unlockId": "rack2u"},
      ],
    },
    {
      id: "bladeB2",
      flavor: false,
      z: 38,
      unlockId: "bladeB2",
      variants: [
        {"sprite": "/rooms/servers/sprites/bladeB2.png", "x": 56, "y": 129, "w": 52, "h": 57, "condition": {"stageId": "era-2008-xt5", "partId": "bladeB2", "minParts": 1, "facilityId": "servers", "researchId": "srv-blade"}, "unlockId": "bladeB2"},
      ],
    },
    {
      id: "rack1",
      flavor: false,
      z: 38,
      unlockId: "rack1",
      variants: [
        {"sprite": "/rooms/servers/sprites/rack1.png", "x": 52, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-2012-xc30", "partId": "rack1", "minParts": 1, "facilityId": "servers", "researchId": "srv-r1"}, "unlockId": "rack1"},
      ],
    },
    {
      id: "rack4",
      flavor: false,
      z: 38,
      unlockId: "rack4",
      variants: [
        {"sprite": "/rooms/servers/sprites/rack4.png", "x": 204, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-2012-xc30", "partId": "rack4", "minParts": 1, "facilityId": "servers", "researchId": "srv-r4"}, "unlockId": "rack4"},
      ],
    },
    {
      id: "calx",
      flavor: false,
      z: 36,
      unlockId: "calx",
      variants: [
        {"sprite": "/rooms/servers/sprites/calx.png", "x": 250, "y": 83, "w": 52, "h": 45, "condition": {"stageId": "era-2012-xc30", "partId": "calx", "minParts": 1, "facilityId": "servers", "researchId": "srv-calx"}, "unlockId": "calx"},
      ],
    },
    {
      id: "altra",
      flavor: false,
      z: 38,
      unlockId: "altra",
      variants: [
        {"sprite": "/rooms/servers/sprites/altra.png", "x": 52, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-2021-ex", "partId": "altra", "minParts": 1, "facilityId": "servers", "researchId": "srv-altra"}, "unlockId": "altra"},
      ],
    },
    {
      id: "psuAT",
      flavor: false,
      z: 24,
      unlockId: "psuAT",
      variants: [
        {"sprite": "/rooms/servers/sprites/psuAT.png", "x": 190, "y": 133, "w": 44, "h": 27, "condition": {"stageId": "era-1989-tower", "partId": "psuAT", "minParts": 1, "facilityId": "servers", "researchId": "pwr-at"}, "unlockId": "psuAT"},
      ],
    },
    {
      id: "psu400",
      flavor: false,
      z: 24,
      unlockId: "psu400",
      variants: [
        {"sprite": "/rooms/servers/sprites/psu400.png", "x": 88, "y": 161, "w": 44, "h": 25, "condition": {"stageId": "era-1995-t90", "partId": "psu400", "minParts": 1, "facilityId": "servers", "researchId": "pwr-atx"}, "unlockId": "psu400"},
        {"sprite": "/rooms/servers/sprites/psu400.png", "x": 214, "y": 139, "w": 44, "h": 25, "condition": {"stageId": "era-1999-racks", "partId": "psu400", "minParts": 1, "facilityId": "servers", "researchId": "pwr-atx"}, "unlockId": "psu400"},
      ],
    },
    {
      id: "labfan",
      flavor: false,
      z: 24,
      unlockId: "labfan",
      variants: [
        {"sprite": "/rooms/servers/sprites/labfan.png", "x": 192, "y": 157, "w": 36, "h": 33, "condition": {"stageId": "era-1989-tower", "partId": "labfan", "minParts": 1, "facilityId": "servers", "researchId": "cool-labfan"}, "unlockId": "labfan"},
        {"sprite": "/rooms/servers/sprites/labfan.png", "x": 216, "y": 159, "w": 36, "h": 33, "condition": {"stageId": "era-1999-racks", "partId": "labfan", "minParts": 1, "facilityId": "servers", "researchId": "cool-labfan"}, "unlockId": "labfan"},
      ],
    },
    {
      id: "l-synoptix",
      flavor: false,
      z: 34,
      unlockId: "l-synoptix",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-synoptix.png", "x": 190, "y": 103, "w": 56, "h": 21, "condition": {"stageId": "era-1989-tower", "partId": "l-synoptix", "minParts": 1, "facilityId": "servers", "researchId": "net-10baset"}, "unlockId": "l-synoptix"},
      ],
    },
    {
      id: "l-cat5000",
      flavor: false,
      z: 36,
      unlockId: "l-cat5000",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-cat5000.png", "x": 250, "y": 91, "w": 52, "h": 69, "condition": {"stageId": "era-1995-t90", "partId": "l-cat5000", "minParts": 1, "facilityId": "servers", "researchId": "net-100"}, "unlockId": "l-cat5000"},
      ],
    },
    {
      id: "l-cat6500",
      flavor: false,
      z: 36,
      unlockId: "l-cat6500",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-cat6500.png", "x": 108, "y": 105, "w": 56, "h": 81, "condition": {"stageId": "era-1999-racks", "partId": "l-cat6500", "minParts": 1, "facilityId": "servers", "researchId": "net-gige"}, "unlockId": "l-cat6500"},
      ],
    },
    {
      id: "l-nexus5000",
      flavor: false,
      z: 34,
      unlockId: "l-nexus5000",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-nexus5000.png", "x": 214, "y": 135, "w": 56, "h": 21, "condition": {"stageId": "era-2008-xt5", "partId": "l-nexus5000", "minParts": 1, "facilityId": "servers", "researchId": "net-10g"}, "unlockId": "l-nexus5000"},
      ],
    },
    {
      id: "l-is4",
      flavor: false,
      z: 34,
      unlockId: "l-is4",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-is4.png", "x": 214, "y": 121, "w": 56, "h": 19, "condition": {"stageId": "era-2008-xt5", "partId": "l-is4", "minParts": 1, "facilityId": "servers", "researchId": "net-ibqdr"}, "unlockId": "l-is4"},
      ],
    },
    {
      id: "l-edr",
      flavor: false,
      z: 34,
      unlockId: "l-edr",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-edr.png", "x": 220, "y": 117, "w": 56, "h": 19, "condition": {"stageId": "era-2021-ex", "partId": "l-edr", "minParts": 1, "facilityId": "servers", "researchId": "net-ibedr"}, "unlockId": "l-edr"},
      ],
    },
    {
      id: "l-quantum",
      flavor: false,
      z: 34,
      unlockId: "l-quantum",
      variants: [
        {"sprite": "/rooms/servers/sprites/l-quantum.png", "x": 220, "y": 103, "w": 56, "h": 19, "condition": {"stageId": "era-2021-ex", "partId": "l-quantum", "minParts": 1, "facilityId": "servers", "researchId": "net-ibhdr"}, "unlockId": "l-quantum"},
      ],
    },
    {
      id: "disk10k",
      flavor: false,
      z: 28,
      unlockId: "disk10k",
      variants: [
        {"sprite": "/rooms/servers/sprites/disk10k.png", "x": 72, "y": 125, "w": 30, "h": 35, "condition": {"stageId": "era-1996-origin", "partId": "disk10k", "minParts": 1, "facilityId": "servers", "researchId": "store-10k"}, "unlockId": "disk10k"},
      ],
    },
    {
      id: "hdd1t",
      flavor: false,
      z: 28,
      unlockId: "hdd1t",
      variants: [
        {"sprite": "/rooms/servers/sprites/hdd1t.png", "x": 262, "y": 125, "w": 30, "h": 35, "condition": {"stageId": "era-2008-xt5", "partId": "hdd1t", "minParts": 1, "facilityId": "servers", "researchId": "store-1tb"}, "unlockId": "hdd1t"},
      ],
    },
    {
      id: "symm",
      flavor: false,
      z: 32,
      unlockId: "symm",
      variants: [
        {"sprite": "/rooms/servers/sprites/symm.png", "x": 82, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-1993-t3d", "partId": "symm", "minParts": 1, "facilityId": "servers", "researchId": "store-symm"}, "unlockId": "symm"},
      ],
    },
    {
      id: "thumper",
      flavor: false,
      z: 32,
      unlockId: "thumper",
      variants: [
        {"sprite": "/rooms/servers/sprites/thumper.png", "x": 214, "y": 153, "w": 56, "h": 33, "condition": {"stageId": "era-2008-xt5", "partId": "thumper", "minParts": 1, "facilityId": "servers", "researchId": "store-thumper"}, "unlockId": "thumper"},
      ],
    },
    {
      id: "pod",
      flavor: false,
      z: 32,
      unlockId: "pod",
      variants: [
        {"sprite": "/rooms/servers/sprites/pod.png", "x": 248, "y": 127, "w": 56, "h": 33, "condition": {"stageId": "era-2012-xc30", "partId": "pod", "minParts": 1, "facilityId": "servers", "researchId": "store-pod"}, "unlockId": "pod"},
      ],
    },
    {
      id: "flasharray",
      flavor: false,
      z: 32,
      unlockId: "flasharray",
      variants: [
        {"sprite": "/rooms/servers/sprites/flasharray.png", "x": 220, "y": 133, "w": 56, "h": 27, "condition": {"stageId": "era-2021-ex", "partId": "flasharray", "minParts": 1, "facilityId": "servers", "researchId": "store-flasharray"}, "unlockId": "flasharray"},
      ],
    },
    {
      id: "ssd2t",
      flavor: false,
      z: 28,
      unlockId: "ssd2t",
      variants: [
        {"sprite": "/rooms/servers/sprites/ssd2t.png", "x": 262, "y": 133, "w": 24, "h": 27, "condition": {"stageId": "era-2021-ex", "partId": "ssd2t", "minParts": 1, "facilityId": "servers", "researchId": "store-ssd2t"}, "unlockId": "ssd2t"},
      ],
    },
    {
      id: "rackframe-beige",
      flavor: true,
      z: 30,
      variants: [
        {"sprite": "/rooms/servers/sprites/rackframe-beige.png", "x": 186, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-1989-tower"}},
      ],
    },
    {
      id: "rackframe-dark",
      flavor: true,
      z: 30,
      variants: [
        {"sprite": "/rooms/servers/sprites/rackframe-dark.png", "x": 210, "y": 89, "w": 48, "h": 97, "condition": {"stageId": "era-1999-racks"}},
      ],
    },
  ],
};

