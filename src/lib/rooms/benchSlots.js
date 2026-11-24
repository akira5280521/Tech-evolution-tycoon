// PC Build Bench layered room. Converted from the approved slots.json
// (360×200). Sprite URLs live under /rooms/bench/. Later-era TECH is not
// in this den — only in-era bench parts appear, when the player actually
// owns them and the Home Computers count has reached the slot's milestone.
export const BENCH_ROOM = {
  "facilityId": "bench",
  "ready": true,
  "generatorId": "homepc",
  "width": 360,
  "height": 200,
  "base": {
    "sprite": "/rooms/bench/base.png",
    "x": 0,
    "y": 0,
    "z": 0,
    "w": 360,
    "h": 200
  },
  "variantRule": "last match wins",
  "slots": [
    {
      "id": "case-primary",
      "flavor": false,
      "z": 20,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/case-atdesk-open.png",
          "unlockId": "k-atdesk",
          "x": 78,
          "y": 78,
          "w": 88,
          "h": 34,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 1,
            "partId": "k-atdesk"
          }
        },
        {
          "sprite": "/rooms/bench/sprites/case-mid.png",
          "unlockId": "k-attower",
          "x": 74,
          "y": 48,
          "w": 94,
          "h": 64,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50,
            "partId": "k-attower"
          }
        }
      ]
    },
    {
      "id": "monitor",
      "flavor": false,
      "z": 30,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/monitor-5151.png",
          "unlockId": "y-5151",
          "x": 214,
          "y": 76,
          "w": 42,
          "h": 34,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 1,
            "partId": "y-5151"
          },
          "eraDefault": "green",
          "screenBox": [
            217,
            80,
            246,
            100
          ],
          "screenVariants": {
            "green": {
              "sprite": "/rooms/bench/sprites/screens/y-5151-green.png",
              "x": 217,
              "y": 80,
              "w": 29,
              "h": 20
            },
            "amber": {
              "sprite": "/rooms/bench/sprites/screens/y-5151-amber.png",
              "x": 217,
              "y": 80,
              "w": 29,
              "h": 20
            },
            "color": {
              "sprite": "/rooms/bench/sprites/screens/y-5151-color.png",
              "x": 217,
              "y": 80,
              "w": 29,
              "h": 20
            }
          }
        },
        {
          "sprite": "/rooms/bench/sprites/monitor-vga.png",
          "unlockId": "y-8513",
          "x": 208,
          "y": 62,
          "w": 50,
          "h": 48,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50,
            "partId": "y-8513"
          },
          "eraDefault": "color",
          "screenBox": [
            218,
            74,
            256,
            98
          ],
          "screenVariants": {
            "green": {
              "sprite": "/rooms/bench/sprites/screens/y-8513-green.png",
              "x": 218,
              "y": 74,
              "w": 38,
              "h": 24
            },
            "amber": {
              "sprite": "/rooms/bench/sprites/screens/y-8513-amber.png",
              "x": 218,
              "y": 74,
              "w": 38,
              "h": 24
            },
            "color": {
              "sprite": "/rooms/bench/sprites/screens/y-8513-color.png",
              "x": 218,
              "y": 74,
              "w": 38,
              "h": 24
            }
          }
        },
        {
          "sprite": "/rooms/bench/sprites/monitor-ms3d.png",
          "unlockId": "y-ms3d",
          "x": 198,
          "y": 56,
          "w": 68,
          "h": 54,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 100,
            "partId": "y-ms3d"
          },
          "eraDefault": "color",
          "screenBox": [
            207,
            65,
            261,
            90
          ],
          "screenVariants": {
            "green": {
              "sprite": "/rooms/bench/sprites/screens/y-ms3d-green.png",
              "x": 207,
              "y": 65,
              "w": 54,
              "h": 25
            },
            "amber": {
              "sprite": "/rooms/bench/sprites/screens/y-ms3d-amber.png",
              "x": 207,
              "y": 65,
              "w": 54,
              "h": 25
            },
            "color": {
              "sprite": "/rooms/bench/sprites/screens/y-ms3d-color.png",
              "x": 207,
              "y": 65,
              "w": 54,
              "h": 25
            }
          }
        }
      ]
    },
    {
      "id": "case-babyat",
      "flavor": false,
      "z": 22,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/case-babyat.png",
          "unlockId": "k-babyat",
          "x": 172,
          "y": 58,
          "w": 26,
          "h": 52,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 100,
            "partId": "k-babyat"
          }
        }
      ]
    },
    {
      "id": "case-atdesk-closed",
      "flavor": false,
      "z": 8,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/case-atdesk-closed.png",
          "unlockId": "k-atdesk",
          "x": 298,
          "y": 140,
          "w": 44,
          "h": 21,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 150,
            "partId": "k-atdesk"
          }
        }
      ]
    },
    {
      "id": "drive-r360k",
      "flavor": false,
      "z": 16,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/drive-r360k.png",
          "unlockId": "r-360k",
          "x": 128,
          "y": 133,
          "w": 22,
          "h": 16,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 100,
            "partId": "r-360k"
          }
        }
      ]
    },
    {
      "id": "drive-st225",
      "flavor": false,
      "z": 16,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/drive-st225.png",
          "unlockId": "d-st225",
          "x": 152,
          "y": 133,
          "w": 24,
          "h": 16,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 100,
            "partId": "d-st225"
          }
        }
      ]
    },
    {
      "id": "drive-r144",
      "flavor": false,
      "z": 42,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/drive-r144.png",
          "unlockId": "r-144",
          "x": 168,
          "y": 94,
          "w": 18,
          "h": 15,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 150,
            "partId": "r-144"
          }
        }
      ]
    },
    {
      "id": "drive-cp3044",
      "flavor": false,
      "z": 42,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/drive-cp3044.png",
          "unlockId": "d-cp3044",
          "x": 188,
          "y": 94,
          "w": 16,
          "h": 15,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 200,
            "partId": "d-cp3044"
          }
        }
      ]
    },
    {
      "id": "tool-left",
      "flavor": true,
      "z": 12,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/tool-left.png",
          "x": 58,
          "y": 48,
          "w": 2,
          "h": 18,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "tool-right",
      "flavor": true,
      "z": 12,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/tool-right.png",
          "x": 72,
          "y": 50,
          "w": 2,
          "h": 12,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "box-beige",
      "flavor": true,
      "z": 18,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/box-beige.png",
          "x": 168,
          "y": 88,
          "w": 36,
          "h": 13,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "box-brown",
      "flavor": true,
      "z": 18,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/box-brown.png",
          "x": 204,
          "y": 88,
          "w": 3,
          "h": 12,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "cables",
      "flavor": true,
      "z": 32,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/cables.png",
          "x": 166,
          "y": 99,
          "w": 50,
          "h": 9,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "mat",
      "flavor": true,
      "z": 40,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/mat.png",
          "x": 130,
          "y": 102,
          "w": 78,
          "h": 14,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "screwdriver",
      "flavor": true,
      "z": 42,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/screwdriver.png",
          "x": 168,
          "y": 102,
          "w": 22,
          "h": 11,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "tray",
      "flavor": true,
      "z": 42,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/tray.png",
          "x": 188,
          "y": 100,
          "w": 20,
          "h": 11,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "keyboard",
      "flavor": true,
      "z": 50,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/keyboard.png",
          "x": 208,
          "y": 102,
          "w": 52,
          "h": 14,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "bowl",
      "flavor": true,
      "z": 52,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/bowl.png",
          "x": 56,
          "y": 100,
          "w": 20,
          "h": 14,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "paper",
      "flavor": true,
      "z": 54,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/paper.png",
          "x": 270,
          "y": 106,
          "w": 27,
          "h": 10,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "under-box-l",
      "flavor": true,
      "z": 16,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/under-box-l.png",
          "x": 62,
          "y": 132,
          "w": 28,
          "h": 17,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "under-box-m",
      "flavor": true,
      "z": 16,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/under-box-m.png",
          "x": 73,
          "y": 132,
          "w": 37,
          "h": 17,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "under-box-r",
      "flavor": true,
      "z": 16,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/under-box-r.png",
          "x": 90,
          "y": 134,
          "w": 28,
          "h": 15,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50
          }
        }
      ]
    },
    {
      "id": "cat",
      "flavor": true,
      "cosmetic": true,
      "z": 56,
      "variantRule": "last match wins",
      "variants": [
        {
          "sprite": "/rooms/bench/sprites/cat-start.png",
          "strip": "/rooms/bench/sprites/cat-start-strip.png",
          "x": 177,
          "y": 88,
          "w": 27,
          "h": 18,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 1
          },
          "animation": {
            "frames": 24,
            "durationMs": 70,
            "kind": "strip"
          }
        },
        {
          "sprite": "/rooms/bench/sprites/cat.png",
          "strip": "/rooms/bench/sprites/cat-strip.png",
          "x": 266,
          "y": 84,
          "w": 27,
          "h": 18,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 50,
            "partId": "y-8513"
          },
          "animation": {
            "frames": 24,
            "durationMs": 70,
            "kind": "strip"
          }
        },
        {
          "sprite": "/rooms/bench/sprites/cat.png",
          "strip": "/rooms/bench/sprites/cat-strip.png",
          "x": 266,
          "y": 84,
          "w": 27,
          "h": 18,
          "condition": {
            "generatorId": "homepc",
            "minOwned": 100,
            "partId": "y-ms3d"
          },
          "animation": {
            "frames": 24,
            "durationMs": 70,
            "kind": "strip"
          }
        }
      ]
    }
  ],
  "monitorDisplay": {
    "prefKey": "monitorDisplay",
    "defaultMode": "era",
    "modes": [
      {
        "id": "era",
        "label": "Era-accurate"
      },
      {
        "id": "green",
        "label": "Green"
      },
      {
        "id": "amber",
        "label": "Amber"
      },
      {
        "id": "color",
        "label": "Color"
      }
    ],
    "keying": "resolvedMode = (prefs.monitorDisplay === 'era') ? monitor.eraDefault : prefs.monitorDisplay",
    "flicker": {
      "green": {
        "bright": 1,
        "dim": [
          0.58,
          0.48
        ],
        "kind": "phosphor"
      },
      "amber": {
        "bright": 1,
        "dim": [
          0.58,
          0.48
        ],
        "kind": "phosphor"
      },
      "color": {
        "bright": 1,
        "dim": [
          0.46,
          0.36
        ],
        "kind": "crt"
      },
      "lcd_oled": {
        "bright": 1,
        "dim": [],
        "kind": "static"
      }
    },
    "monitors": [
      {
        "unlockId": "y-5151",
        "eraDefault": "green",
        "phosphorOrPanel": "P39 green long-persistence phosphor",
        "year": 1981,
        "inRoom": true
      },
      {
        "unlockId": "y-5153",
        "eraDefault": "color",
        "phosphorOrPanel": "P22 color, 16 CGA colors (320\u00d7200 / 640\u00d7200)",
        "year": 1983,
        "inRoom": false
      },
      {
        "unlockId": "y-5154",
        "eraDefault": "color",
        "phosphorOrPanel": "P22 color, 16 of 64 EGA colors, 640\u00d7350",
        "year": 1984,
        "inRoom": false
      },
      {
        "unlockId": "y-8513",
        "eraDefault": "color",
        "phosphorOrPanel": "P22 color, 640\u00d7480",
        "year": 1987,
        "inRoom": true
      },
      {
        "unlockId": "y-ms3d",
        "eraDefault": "color",
        "phosphorOrPanel": "P22 color, up to 1024\u00d7768",
        "year": 1989,
        "inRoom": true
      },
      {
        "unlockId": "y-17sf",
        "eraDefault": "color",
        "phosphorOrPanel": "17-inch vertically-flat Trinitron, color",
        "year": 1995,
        "inRoom": false
      },
      {
        "unlockId": "y-fw900",
        "eraDefault": "color",
        "phosphorOrPanel": "24-inch 16:10 Trinitron, up to 1920\u00d71200",
        "year": 2000,
        "inRoom": false
      },
      {
        "unlockId": "y-2001fp",
        "eraDefault": "color",
        "phosphorOrPanel": "20-inch 1600\u00d71200 flat panel, no phosphor flicker",
        "year": 2003,
        "inRoom": false
      },
      {
        "unlockId": "y-3007",
        "eraDefault": "color",
        "phosphorOrPanel": "30-inch 2560\u00d71600, dual-link DVI, no flicker",
        "year": 2006,
        "inRoom": false
      },
      {
        "unlockId": "y-vg236h",
        "eraDefault": "color",
        "phosphorOrPanel": "23-inch 120 Hz 3D, DVI + HDMI, no flicker",
        "year": 2010,
        "inRoom": false
      },
      {
        "unlockId": "y-pg278q",
        "eraDefault": "color",
        "phosphorOrPanel": "27-inch TN, DisplayPort, no flicker",
        "year": 2014,
        "inRoom": false
      },
      {
        "unlockId": "y-p2715q",
        "eraDefault": "color",
        "phosphorOrPanel": "27-inch 3840\u00d72160, no flicker",
        "year": 2015,
        "inRoom": false
      },
      {
        "unlockId": "y-pg27uq",
        "eraDefault": "color",
        "phosphorOrPanel": "27-inch IPS HDR, no flicker",
        "year": 2018,
        "inRoom": false
      },
      {
        "unlockId": "y-aw3423",
        "eraDefault": "color",
        "phosphorOrPanel": "34-inch curved QD-OLED, 175 Hz, true blacks",
        "year": 2022,
        "inRoom": false
      },
      {
        "unlockId": "y-pg32",
        "eraDefault": "color",
        "phosphorOrPanel": "32-inch 4K OLED, 240 Hz, true blacks",
        "year": 2024,
        "inRoom": false
      }
    ]
  }
};
