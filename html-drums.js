/**
 * HTML Drums — Turn any web page into a percussion instrument.
 *
 * A zero-dependency vanilla JS library that walks the DOM tree in time with a
 * configurable BPM, playing drum machine samples from the Strudel CDN for each
 * HTML element. Inject it via bookmarklet, console, or <script> tag.
 *
 * CDN base: https://strudel.b-cdn.net/tidal-drum-machines/machines/
 *
 * @license MIT
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */

  var CDN_BASE =
    'https://strudel.b-cdn.net/tidal-drum-machines/machines/';

  /* Canonical sound abbreviations and their display labels */
  var SOUND_LABELS = {
    bd: 'Kick',       sd: 'Snare',      hh: 'Closed HH',
    oh: 'Open HH',    ht: 'High Tom',   mt: 'Mid Tom',
    lt: 'Low Tom',    rd: 'Ride',       cr: 'Crash',
    cp: 'Clap',       rim: 'Rim',       cb: 'Cowbell',
    sh: 'Shaker',     tb: 'Tambourine', perc: 'Percussion',
    misc: 'Misc',     fx: 'FX'
  };

  /* Highlight colours per sound category */
  var HIGHLIGHT_COLORS = {
    bd:   'rgba(255,80,80,0.35)',
    sd:   'rgba(255,200,50,0.35)',
    hh:   'rgba(100,200,255,0.35)',
    oh:   'rgba(80,160,255,0.35)',
    cr:   'rgba(255,255,100,0.40)',
    rd:   'rgba(200,150,255,0.35)',
    cp:   'rgba(255,150,200,0.35)',
    rim:  'rgba(255,180,100,0.35)',
    ht:   'rgba(100,255,150,0.35)',
    mt:   'rgba(100,255,150,0.35)',
    lt:   'rgba(100,255,150,0.35)',
    cb:   'rgba(255,220,100,0.35)',
    sh:   'rgba(200,255,200,0.35)',
    tb:   'rgba(255,200,150,0.35)',
    perc: 'rgba(150,255,220,0.35)',
    misc: 'rgba(200,200,200,0.35)',
    fx:   'rgba(200,150,255,0.35)'
  };

  /* Default tag → sound mapping (Mode A: tag-based) */
  var DEFAULT_TAG_MAP = {
    'body':    'bd',
    'header':  'sd',   'nav':     'sd',
    'main':    'bd',   'article': 'bd',
    'section': 'hh',   'div':     'hh',
    'h1':      'cr',
    'h2':      'oh',   'h3':      'oh',
    'h4':      'rd',   'h5':      'rd',   'h6':  'rd',
    'p':       'hh',
    'a':       'rim',
    'button':  'cp',
    'img':     'cr',
    'ul':      'mt',   'ol':      'mt',
    'li':      'hh',
    'span':    'hh',   'em':      'hh',   'strong': 'hh',
    'table':   'lt',
    'tr':      'ht',
    'td':      'hh',   'th':      'hh',
    'form':    'sd',   'input':   'sd',   'textarea': 'sd',
    'select':  'hh',
    'footer':  'bd'
  };

  var FALLBACK_SOUND = 'hh';

  /* ------------------------------------------------------------------ */
  /*  Machine definitions (10 iconic drum machines)                       */
  /*  Each key is a display name; value = { folder, sounds: { abbr: [paths] } } */
  /* ------------------------------------------------------------------ */

  var MACHINES = {
    'TR-808': {
      folder: 'RolandTR808',
      sounds: {
        bd:  ['RolandTR808/rolandtr808-bd/BD0000.WAV','RolandTR808/rolandtr808-bd/BD0010.WAV','RolandTR808/rolandtr808-bd/BD0020.WAV','RolandTR808/rolandtr808-bd/BD0030.WAV','RolandTR808/rolandtr808-bd/BD0040.WAV','RolandTR808/rolandtr808-bd/BD0050.WAV','RolandTR808/rolandtr808-bd/BD0060.WAV','RolandTR808/rolandtr808-bd/BD0070.WAV','RolandTR808/rolandtr808-bd/BD0080.WAV','RolandTR808/rolandtr808-bd/BD0090.WAV','RolandTR808/rolandtr808-bd/BD0100.WAV','RolandTR808/rolandtr808-bd/BD2525.WAV','RolandTR808/rolandtr808-bd/BD2550.WAV','RolandTR808/rolandtr808-bd/BD2575.WAV','RolandTR808/rolandtr808-bd/BD5000.WAV','RolandTR808/rolandtr808-bd/BD5025.WAV','RolandTR808/rolandtr808-bd/BD5050.WAV','RolandTR808/rolandtr808-bd/BD5075.WAV','RolandTR808/rolandtr808-bd/BD7500.WAV','RolandTR808/rolandtr808-bd/BD7525.WAV','RolandTR808/rolandtr808-bd/BD7550.WAV','RolandTR808/rolandtr808-bd/BD7575.WAV'],
        cb:  ['RolandTR808/rolandtr808-cb/CB.WAV','RolandTR808/rolandtr808-cb/Cowbell.wav'],
        cp:  ['RolandTR808/rolandtr808-cp/cp0.wav','RolandTR808/rolandtr808-cp/cp1.wav','RolandTR808/rolandtr808-cp/cp2.wav','RolandTR808/rolandtr808-cp/cp3.wav','RolandTR808/rolandtr808-cp/cp4.WAV'],
        cr:  ['RolandTR808/rolandtr808-cr/CY0000.WAV','RolandTR808/rolandtr808-cr/CY0010.WAV','RolandTR808/rolandtr808-cr/CY0020.WAV','RolandTR808/rolandtr808-cr/CY0030.WAV','RolandTR808/rolandtr808-cr/CY0040.WAV','RolandTR808/rolandtr808-cr/CY0050.WAV','RolandTR808/rolandtr808-cr/CY0060.WAV','RolandTR808/rolandtr808-cr/CY0070.WAV','RolandTR808/rolandtr808-cr/CY0080.WAV','RolandTR808/rolandtr808-cr/CY0090.WAV','RolandTR808/rolandtr808-cr/CY0100.WAV','RolandTR808/rolandtr808-cr/CY2525.WAV','RolandTR808/rolandtr808-cr/CY2550.WAV','RolandTR808/rolandtr808-cr/CY2575.WAV','RolandTR808/rolandtr808-cr/CY5000.WAV','RolandTR808/rolandtr808-cr/CY5025.WAV','RolandTR808/rolandtr808-cr/CY5050.WAV','RolandTR808/rolandtr808-cr/CY5075.WAV','RolandTR808/rolandtr808-cr/CY7500.WAV','RolandTR808/rolandtr808-cr/CY7525.WAV','RolandTR808/rolandtr808-cr/CY7550.WAV','RolandTR808/rolandtr808-cr/CY7575.WAV'],
        hh:  ['RolandTR808/rolandtr808-hh/CH.WAV'],
        ht:  ['RolandTR808/rolandtr808-ht/HT00.WAV','RolandTR808/rolandtr808-ht/HT10.WAV','RolandTR808/rolandtr808-ht/HT25.WAV','RolandTR808/rolandtr808-ht/HT50.WAV','RolandTR808/rolandtr808-ht/HT75.WAV'],
        lt:  ['RolandTR808/rolandtr808-lt/LT00.WAV','RolandTR808/rolandtr808-lt/LT10.WAV','RolandTR808/rolandtr808-lt/LT25.WAV','RolandTR808/rolandtr808-lt/LT50.WAV','RolandTR808/rolandtr808-lt/LT75.WAV'],
        mt:  ['RolandTR808/rolandtr808-mt/MT00.WAV','RolandTR808/rolandtr808-mt/MT10.WAV','RolandTR808/rolandtr808-mt/MT25.WAV','RolandTR808/rolandtr808-mt/MT50.WAV','RolandTR808/rolandtr808-mt/MT75.WAV'],
        oh:  ['RolandTR808/rolandtr808-oh/OH00.WAV','RolandTR808/rolandtr808-oh/OH10.WAV','RolandTR808/rolandtr808-oh/OH25.WAV','RolandTR808/rolandtr808-oh/OH50.WAV','RolandTR808/rolandtr808-oh/OH75.WAV'],
        perc:['RolandTR808/rolandtr808-perc/CL.WAV','RolandTR808/rolandtr808-perc/HC00.WAV','RolandTR808/rolandtr808-perc/HC25.WAV','RolandTR808/rolandtr808-perc/HC50.WAV','RolandTR808/rolandtr808-perc/HC75.WAV','RolandTR808/rolandtr808-perc/LC00.WAV','RolandTR808/rolandtr808-perc/LC25.WAV','RolandTR808/rolandtr808-perc/LC50.WAV','RolandTR808/rolandtr808-perc/LC75.WAV','RolandTR808/rolandtr808-perc/MA.WAV','RolandTR808/rolandtr808-perc/MC00.WAV','RolandTR808/rolandtr808-perc/MC25.WAV','RolandTR808/rolandtr808-perc/MC50.WAV','RolandTR808/rolandtr808-perc/MC75.WAV'],
        rim: ['RolandTR808/rolandtr808-rim/RS.WAV'],
        sd:  ['RolandTR808/rolandtr808-sd/SD0000.WAV','RolandTR808/rolandtr808-sd/SD0010.WAV','RolandTR808/rolandtr808-sd/SD0020.WAV','RolandTR808/rolandtr808-sd/SD0030.WAV','RolandTR808/rolandtr808-sd/SD0040.WAV','RolandTR808/rolandtr808-sd/SD0050.WAV','RolandTR808/rolandtr808-sd/SD0060.WAV','RolandTR808/rolandtr808-sd/SD0070.WAV','RolandTR808/rolandtr808-sd/SD0080.WAV','RolandTR808/rolandtr808-sd/SD0090.WAV','RolandTR808/rolandtr808-sd/SD0100.WAV','RolandTR808/rolandtr808-sd/SD2525.WAV','RolandTR808/rolandtr808-sd/SD2550.WAV','RolandTR808/rolandtr808-sd/SD2575.WAV','RolandTR808/rolandtr808-sd/SD5000.WAV','RolandTR808/rolandtr808-sd/SD5025.WAV','RolandTR808/rolandtr808-sd/SD5050.WAV','RolandTR808/rolandtr808-sd/SD5075.WAV','RolandTR808/rolandtr808-sd/SD7500.WAV','RolandTR808/rolandtr808-sd/SD7525.WAV','RolandTR808/rolandtr808-sd/SD7550.WAV','RolandTR808/rolandtr808-sd/SD7575.WAV'],
        sh:  ['RolandTR808/rolandtr808-sh/Cabasa.wav','RolandTR808/rolandtr808-sh/MA.WAV']
      }
    },
    'TR-909': {
      folder: 'RolandTR909',
      sounds: {
        bd: ['RolandTR909/rolandtr909-bd/Bassdrum-01.wav','RolandTR909/rolandtr909-bd/Bassdrum-02.wav','RolandTR909/rolandtr909-bd/Bassdrum-03.wav','RolandTR909/rolandtr909-bd/Bassdrum-04.wav'],
        cp: ['RolandTR909/rolandtr909-cp/Clap.wav','RolandTR909/rolandtr909-cp/cp01.wav','RolandTR909/rolandtr909-cp/cp02.wav','RolandTR909/rolandtr909-cp/cp03.wav','RolandTR909/rolandtr909-cp/cp04.wav'],
        cr: ['RolandTR909/rolandtr909-cr/Crash.wav','RolandTR909/rolandtr909-cr/cr01.wav','RolandTR909/rolandtr909-cr/cr02.wav','RolandTR909/rolandtr909-cr/cr03.wav','RolandTR909/rolandtr909-cr/cr04.wav'],
        hh: ['RolandTR909/rolandtr909-hh/hh01.wav','RolandTR909/rolandtr909-hh/hh02.wav','RolandTR909/rolandtr909-hh/hh03.wav','RolandTR909/rolandtr909-hh/hh04.wav'],
        ht: ['RolandTR909/rolandtr909-ht/Tom H.wav','RolandTR909/rolandtr909-ht/ht01.wav','RolandTR909/rolandtr909-ht/ht02.wav','RolandTR909/rolandtr909-ht/ht03.wav','RolandTR909/rolandtr909-ht/ht04.wav','RolandTR909/rolandtr909-ht/ht05.wav','RolandTR909/rolandtr909-ht/ht06.wav','RolandTR909/rolandtr909-ht/ht07.wav','RolandTR909/rolandtr909-ht/ht08.wav'],
        lt: ['RolandTR909/rolandtr909-lt/Tom L.wav','RolandTR909/rolandtr909-lt/lt01.wav','RolandTR909/rolandtr909-lt/lt02.wav','RolandTR909/rolandtr909-lt/lt03.wav','RolandTR909/rolandtr909-lt/lt04.wav','RolandTR909/rolandtr909-lt/lt05.wav','RolandTR909/rolandtr909-lt/lt06.wav','RolandTR909/rolandtr909-lt/lt07.wav','RolandTR909/rolandtr909-lt/lt08.wav'],
        mt: ['RolandTR909/rolandtr909-mt/Tom M.wav','RolandTR909/rolandtr909-mt/mt01.wav','RolandTR909/rolandtr909-mt/mt02.wav','RolandTR909/rolandtr909-mt/mt03.wav','RolandTR909/rolandtr909-mt/mt04.wav','RolandTR909/rolandtr909-mt/mt05.wav','RolandTR909/rolandtr909-mt/mt06.wav','RolandTR909/rolandtr909-mt/mt07.wav','RolandTR909/rolandtr909-mt/mt08.wav'],
        oh: ['RolandTR909/rolandtr909-oh/Hat Open.wav','RolandTR909/rolandtr909-oh/oh01.wav','RolandTR909/rolandtr909-oh/oh02.wav','RolandTR909/rolandtr909-oh/oh03.wav','RolandTR909/rolandtr909-oh/oh04.wav'],
        rd: ['RolandTR909/rolandtr909-rd/Ride.wav','RolandTR909/rolandtr909-rd/rd01.wav','RolandTR909/rolandtr909-rd/rd02.wav','RolandTR909/rolandtr909-rd/rd03.wav','RolandTR909/rolandtr909-rd/rd04.wav'],
        rim:['RolandTR909/rolandtr909-rim/Rimshot-01.wav','RolandTR909/rolandtr909-rim/Rimshot-02.wav','RolandTR909/rolandtr909-rim/Rimshot-03.wav'],
        sd: ['RolandTR909/rolandtr909-sd/Snaredrum-01.wav','RolandTR909/rolandtr909-sd/Snaredrum-02.wav','RolandTR909/rolandtr909-sd/Snaredrum-03.wav','RolandTR909/rolandtr909-sd/Snaredrum-04.wav','RolandTR909/rolandtr909-sd/Snaredrum-05.wav','RolandTR909/rolandtr909-sd/Snaredrum-06.wav','RolandTR909/rolandtr909-sd/Snaredrum-07.wav','RolandTR909/rolandtr909-sd/Snaredrum-08.wav','RolandTR909/rolandtr909-sd/Snaredrum-09.wav','RolandTR909/rolandtr909-sd/Snaredrum-10.wav','RolandTR909/rolandtr909-sd/Snaredrum-11.wav','RolandTR909/rolandtr909-sd/Snaredrum-12.wav','RolandTR909/rolandtr909-sd/Snaredrum-13.wav','RolandTR909/rolandtr909-sd/Snaredrum-14.wav','RolandTR909/rolandtr909-sd/Snaredrum-15.wav','RolandTR909/rolandtr909-sd/Snaredrum-16.wav']
      }
    },
    'TR-707': {
      folder: 'RolandTR707',
      sounds: {
        bd: ['RolandTR707/rolandtr707-bd/Bassdrum-01.wav','RolandTR707/rolandtr707-bd/Bassdrum-02.wav'],
        cb: ['RolandTR707/rolandtr707-cb/Cowbell.wav'],
        cp: ['RolandTR707/rolandtr707-cp/Clap.wav'],
        cr: ['RolandTR707/rolandtr707-cr/Crash.wav'],
        hh: ['RolandTR707/rolandtr707-hh/Hat Closed.wav'],
        ht: ['RolandTR707/rolandtr707-ht/Tom H.wav'],
        lt: ['RolandTR707/rolandtr707-lt/Tom L.wav'],
        mt: ['RolandTR707/rolandtr707-mt/Tom M.wav'],
        oh: ['RolandTR707/rolandtr707-oh/Hat Open.wav'],
        rim:['RolandTR707/rolandtr707-rim/Rimshot.wav'],
        sd: ['RolandTR707/rolandtr707-sd/Snaredrum-01.wav','RolandTR707/rolandtr707-sd/Snaredrum-02.wav'],
        tb: ['RolandTR707/rolandtr707-tb/Tambourine.wav']
      }
    },
    'TR-606': {
      folder: 'RolandTR606',
      sounds: {
        bd: ['RolandTR606/rolandtr606-bd/Bassdrum.wav'],
        cr: ['RolandTR606/rolandtr606-cr/Cymbal.wav'],
        hh: ['RolandTR606/rolandtr606-hh/Hat Closed.wav'],
        ht: ['RolandTR606/rolandtr606-ht/Tom H.wav'],
        lt: ['RolandTR606/rolandtr606-lt/Tom L.wav'],
        oh: ['RolandTR606/rolandtr606-oh/Hat Open.wav'],
        sd: ['RolandTR606/rolandtr606-sd/Snaredrum.wav']
      }
    },
    'LinnDrum': {
      folder: 'LinnDrum',
      sounds: {
        bd: ['LinnDrum/linndrum-bd/Bassdrum.wav'],
        cb: ['LinnDrum/linndrum-cb/Cowbell.wav'],
        cp: ['LinnDrum/linndrum-cp/Clap.wav'],
        cr: ['LinnDrum/linndrum-cr/Crash.wav'],
        hh: ['LinnDrum/linndrum-hh/Hat Closed-01.wav','LinnDrum/linndrum-hh/Hat Closed-02.wav','LinnDrum/linndrum-hh/Hat Closed-03.wav'],
        ht: ['LinnDrum/linndrum-ht/Tom H-01.wav','LinnDrum/linndrum-ht/Tom H-02.wav'],
        lt: ['LinnDrum/linndrum-lt/Tom L-01.wav','LinnDrum/linndrum-lt/Tom L-02.wav'],
        mt: ['LinnDrum/linndrum-mt/Tom M-01.wav'],
        oh: ['LinnDrum/linndrum-oh/Hat Open.wav'],
        perc:['LinnDrum/linndrum-perc/Conga H-01.wav','LinnDrum/linndrum-perc/Conga H-02.wav','LinnDrum/linndrum-perc/Conga L-01.wav','LinnDrum/linndrum-perc/Conga L-02.wav','LinnDrum/linndrum-perc/Conga M-01.wav','LinnDrum/linndrum-perc/Conga M-02.wav'],
        rd: ['LinnDrum/linndrum-rd/Ride.wav'],
        rim:['LinnDrum/linndrum-rim/Sidestick-01.wav','LinnDrum/linndrum-rim/Sidestick-02.wav','LinnDrum/linndrum-rim/Sidestick-03.wav'],
        sd: ['LinnDrum/linndrum-sd/0Snarderum-01.wav','LinnDrum/linndrum-sd/0Snarderum-02.wav','LinnDrum/linndrum-sd/0Snarderum-03.wav'],
        sh: ['LinnDrum/linndrum-sh/Cabasa.wav'],
        tb: ['LinnDrum/linndrum-tb/Tambourine.wav']
      }
    },
    'DMX': {
      folder: 'OberheimDMX',
      sounds: {
        bd: ['OberheimDMX/oberheimdmx-bd/Bassdrum-01.wav','OberheimDMX/oberheimdmx-bd/Bassdrum-02.wav','OberheimDMX/oberheimdmx-bd/Bassdrum-03.wav'],
        cp: ['OberheimDMX/oberheimdmx-cp/Clap.wav'],
        cr: ['OberheimDMX/oberheimdmx-cr/Crash.wav'],
        hh: ['OberheimDMX/oberheimdmx-hh/Hat Closed.wav'],
        ht: ['OberheimDMX/oberheimdmx-ht/Tom H.wav'],
        lt: ['OberheimDMX/oberheimdmx-lt/Tom L.wav'],
        mt: ['OberheimDMX/oberheimdmx-mt/Tom M.wav'],
        oh: ['OberheimDMX/oberheimdmx-oh/Hat Open.wav'],
        rd: ['OberheimDMX/oberheimdmx-rd/Ride.wav'],
        rim:['OberheimDMX/oberheimdmx-rim/Rim Shot.wav'],
        sd: ['OberheimDMX/oberheimdmx-sd/Snaredrum-01.wav','OberheimDMX/oberheimdmx-sd/Snaredrum-02.wav','OberheimDMX/oberheimdmx-sd/Snaredrum-03.wav'],
        sh: ['OberheimDMX/oberheimdmx-sh/Cabasa.wav'],
        tb: ['OberheimDMX/oberheimdmx-tb/Tamborine.wav']
      }
    },
    'SP-12': {
      folder: 'EmuSP12',
      sounds: {
        bd: ['EmuSP12/emusp12-bd/Bassdrum-01.wav','EmuSP12/emusp12-bd/Bassdrum-02.wav','EmuSP12/emusp12-bd/Bassdrum-03.wav','EmuSP12/emusp12-bd/Bassdrum-04.wav','EmuSP12/emusp12-bd/Bassdrum-05.wav','EmuSP12/emusp12-bd/Bassdrum-06.wav','EmuSP12/emusp12-bd/Bassdrum-07.wav','EmuSP12/emusp12-bd/Bassdrum-08.wav','EmuSP12/emusp12-bd/Bassdrum-09.wav','EmuSP12/emusp12-bd/Bassdrum-10.wav','EmuSP12/emusp12-bd/Bassdrum-11.wav','EmuSP12/emusp12-bd/Bassdrum-12.wav','EmuSP12/emusp12-bd/Bassdrum-13.wav','EmuSP12/emusp12-bd/Bassdrum-14.wav'],
        cb: ['EmuSP12/emusp12-cb/Cowbell.wav'],
        cp: ['EmuSP12/emusp12-cp/Clap.wav'],
        cr: ['EmuSP12/emusp12-cr/Crash.wav'],
        hh: ['EmuSP12/emusp12-hh/Hat Closed-01.wav','EmuSP12/emusp12-hh/Hat Closed-02.wav'],
        ht: ['EmuSP12/emusp12-ht/Tom H-01.wav','EmuSP12/emusp12-ht/Tom H-02.wav','EmuSP12/emusp12-ht/Tom H-03.wav','EmuSP12/emusp12-ht/Tom H-04.wav','EmuSP12/emusp12-ht/Tom H-05.wav','EmuSP12/emusp12-ht/Tom H-06.wav'],
        lt: ['EmuSP12/emusp12-lt/Tom L-01.wav','EmuSP12/emusp12-lt/Tom L-02.wav','EmuSP12/emusp12-lt/Tom L-03.wav','EmuSP12/emusp12-lt/Tom L-04.wav','EmuSP12/emusp12-lt/Tom L-05.wav','EmuSP12/emusp12-lt/Tom L-06.wav'],
        misc:['EmuSP12/emusp12-misc/Metal-01.wav','EmuSP12/emusp12-misc/Metal-02.wav','EmuSP12/emusp12-misc/Metal-03.wav','EmuSP12/emusp12-misc/Shot-01.wav','EmuSP12/emusp12-misc/Shot-02.wav','EmuSP12/emusp12-misc/Shot-03.wav'],
        mt: ['EmuSP12/emusp12-mt/Tom M-01.wav','EmuSP12/emusp12-mt/Tom M-02.wav','EmuSP12/emusp12-mt/Tom M-03.wav','EmuSP12/emusp12-mt/Tom M-04.wav','EmuSP12/emusp12-mt/Tom M-05.wav'],
        oh: ['EmuSP12/emusp12-oh/Hhopen1.wav'],
        perc:['EmuSP12/emusp12-perc/Blow1.wav'],
        rd: ['EmuSP12/emusp12-rd/Ride.wav'],
        rim:['EmuSP12/emusp12-rim/zRim Shot-01.wav','EmuSP12/emusp12-rim/zRim Shot-02.wav'],
        sd: ['EmuSP12/emusp12-sd/Snaredrum-01.wav','EmuSP12/emusp12-sd/Snaredrum-02.wav','EmuSP12/emusp12-sd/Snaredrum-03.wav','EmuSP12/emusp12-sd/Snaredrum-04.wav','EmuSP12/emusp12-sd/Snaredrum-05.wav','EmuSP12/emusp12-sd/Snaredrum-06.wav','EmuSP12/emusp12-sd/Snaredrum-07.wav','EmuSP12/emusp12-sd/Snaredrum-08.wav','EmuSP12/emusp12-sd/Snaredrum-09.wav','EmuSP12/emusp12-sd/Snaredrum-10.wav','EmuSP12/emusp12-sd/Snaredrum-11.wav','EmuSP12/emusp12-sd/Snaredrum-12.wav','EmuSP12/emusp12-sd/Snaredrum-13.wav','EmuSP12/emusp12-sd/Snaredrum-14.wav','EmuSP12/emusp12-sd/Snaredrum-15.wav','EmuSP12/emusp12-sd/Snaredrum-16.wav','EmuSP12/emusp12-sd/Snaredrum-17.wav','EmuSP12/emusp12-sd/Snaredrum-18.wav','EmuSP12/emusp12-sd/Snaredrum-19.wav','EmuSP12/emusp12-sd/Snaredrum-20.wav','EmuSP12/emusp12-sd/Snaredrum-21.wav']
      }
    },
    'MPC-60': {
      folder: 'AkaiMPC60',
      sounds: {
        bd: ['AkaiMPC60/akaimpc60-bd/0 Bassdrum.wav','AkaiMPC60/akaimpc60-bd/Bassdrum Gated.wav'],
        cp: ['AkaiMPC60/akaimpc60-cp/Clap.wav'],
        cr: ['AkaiMPC60/akaimpc60-cr/Crash.wav'],
        hh: ['AkaiMPC60/akaimpc60-hh/Closed Hat.wav'],
        ht: ['AkaiMPC60/akaimpc60-ht/Tom H.wav'],
        lt: ['AkaiMPC60/akaimpc60-lt/Tom L.wav'],
        misc:['AkaiMPC60/akaimpc60-misc/Bass.wav','AkaiMPC60/akaimpc60-misc/Electric Piano.wav'],
        mt: ['AkaiMPC60/akaimpc60-mt/Tom M.wav'],
        oh: ['AkaiMPC60/akaimpc60-oh/Open Hat.wav'],
        perc:['AkaiMPC60/akaimpc60-perc/Bongo.wav','AkaiMPC60/akaimpc60-perc/Click.wav','AkaiMPC60/akaimpc60-perc/Conga H.wav','AkaiMPC60/akaimpc60-perc/Conga L.wav','AkaiMPC60/akaimpc60-perc/Timbale.wav'],
        rd: ['AkaiMPC60/akaimpc60-rd/Ride.wav'],
        rim:['AkaiMPC60/akaimpc60-rim/Rim Gated.wav'],
        sd: ['AkaiMPC60/akaimpc60-sd/Snare 1.wav','AkaiMPC60/akaimpc60-sd/Snare 2.wav','AkaiMPC60/akaimpc60-sd/Snare 3.wav']
      }
    },
    'SDS-5': {
      folder: 'SimmonsSDS5',
      sounds: {
        bd: ['SimmonsSDS5/simmonssds5-bd/Bassdrum-01.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-02.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-03.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-04.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-05.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-06.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-07.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-08.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-09.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-10.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-11.wav','SimmonsSDS5/simmonssds5-bd/Bassdrum-12.wav'],
        hh: ['SimmonsSDS5/simmonssds5-hh/Hat Closed-01.wav','SimmonsSDS5/simmonssds5-hh/Hat Closed-02.wav','SimmonsSDS5/simmonssds5-hh/Hat Closed-03.wav','SimmonsSDS5/simmonssds5-hh/Hat Pedal-01.wav','SimmonsSDS5/simmonssds5-hh/Hat Pedal-02.wav'],
        ht: ['SimmonsSDS5/simmonssds5-ht/Tom-01.wav','SimmonsSDS5/simmonssds5-ht/Tom-04.wav','SimmonsSDS5/simmonssds5-ht/Tom-05.wav'],
        lt: ['SimmonsSDS5/simmonssds5-lt/Tom-07.wav','SimmonsSDS5/simmonssds5-lt/Tom-08.wav','SimmonsSDS5/simmonssds5-lt/Tom-10.wav','SimmonsSDS5/simmonssds5-lt/Tom-11.wav','SimmonsSDS5/simmonssds5-lt/Tom-13.wav','SimmonsSDS5/simmonssds5-lt/Tom-14.wav','SimmonsSDS5/simmonssds5-lt/Tom-15.wav','SimmonsSDS5/simmonssds5-lt/Tom-17.wav'],
        mt: ['SimmonsSDS5/simmonssds5-mt/Tom-02.wav','SimmonsSDS5/simmonssds5-mt/Tom-03.wav','SimmonsSDS5/simmonssds5-mt/Tom-06.wav','SimmonsSDS5/simmonssds5-mt/Tom-09.wav','SimmonsSDS5/simmonssds5-mt/Tom-12.wav','SimmonsSDS5/simmonssds5-mt/Tom-16.wav'],
        oh: ['SimmonsSDS5/simmonssds5-oh/Hat Open-01.wav','SimmonsSDS5/simmonssds5-oh/Hat Open-02.wav'],
        rim:['SimmonsSDS5/simmonssds5-rim/Rimshot-01.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-02.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-03.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-04.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-05.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-06.wav','SimmonsSDS5/simmonssds5-rim/Rimshot-07.wav'],
        sd: ['SimmonsSDS5/simmonssds5-sd/Snaredrum-01.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-02.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-03.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-04.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-05.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-06.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-07.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-08.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-09.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-10.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-11.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-12.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-13.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-14.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-15.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-16.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-17.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-18.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-19.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-20.wav','SimmonsSDS5/simmonssds5-sd/Snaredrum-21.wav']
      }
    },
    'CR-78': {
      folder: 'RolandCompurhythm78',
      sounds: {
        bd: ['RolandCompurhythm78/rolandcompurhythm78-bd/Bassdrum.wav'],
        cb: ['RolandCompurhythm78/rolandcompurhythm78-cb/Cowbell.wav'],
        hh: ['RolandCompurhythm78/rolandcompurhythm78-hh/Hat Closed-01.wav','RolandCompurhythm78/rolandcompurhythm78-hh/Hat Closed-02.wav'],
        misc:['RolandCompurhythm78/rolandcompurhythm78-misc/Quid-01.wav','RolandCompurhythm78/rolandcompurhythm78-misc/Quid-02.wav','RolandCompurhythm78/rolandcompurhythm78-misc/Quid-03.wav','RolandCompurhythm78/rolandcompurhythm78-misc/Quid-04.wav'],
        oh: ['RolandCompurhythm78/rolandcompurhythm78-oh/Hat Open-01.wav','RolandCompurhythm78/rolandcompurhythm78-oh/Hat Open-02.wav'],
        perc:['RolandCompurhythm78/rolandcompurhythm78-perc/Conga H.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Conga L.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Conga M.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Noiz-01.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Noiz-02.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Ping.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Woodblock-01.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Woodblock-02.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Woodblock-03.wav','RolandCompurhythm78/rolandcompurhythm78-perc/Woodblock-04.wav'],
        sd: ['RolandCompurhythm78/rolandcompurhythm78-sd/Snaredrum.wav'],
        tb: ['RolandCompurhythm78/rolandcompurhythm78-tb/Tambourine.wav']
      }
    }
  };

  /* Machine display order */
  var MACHINE_ORDER = [
    'TR-808', 'TR-909', 'TR-707', 'TR-606',
    'LinnDrum', 'DMX', 'SP-12', 'MPC-60',
    'SDS-5', 'CR-78'
  ];

  /* ------------------------------------------------------------------ */
  /*  Utility helpers                                                    */
  /* ------------------------------------------------------------------ */

  /** Simple shallow clone for plain objects */
  function clone(obj) {
    var out = {};
    for (var k in obj) { if (obj.hasOwnProperty(k)) out[k] = obj[k]; }
    return out;
  }

  /** Pick a random element from an array */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Choke-group definitions: sounds in the same group cut each other off */
  var CHOKE_GROUPS = {
    hats: ['hh', 'oh'],   /* closed hat cuts open hat */
    toms: ['ht', 'mt', 'lt']
  };

  /* ------------------------------------------------------------------ */
  /*  Settings (localStorage-backed)                                      */
  /* ------------------------------------------------------------------ */

  var STORAGE_KEY = 'html-drums-settings';

  var DEFAULTS = {
    machine: 'TR-808',
    bpm: 120,
    volume: 0.8,
    tagMap: clone(DEFAULT_TAG_MAP),
    useDepthVariation: false,
    chokeEnabled: true,
    showSettings: false
  };

  /* Named mapping presets */
  var MAP_PRESETS = {
    'Default': clone(DEFAULT_TAG_MAP),
    'All Kick': { body:'bd',header:'bd',nav:'bd',main:'bd',article:'bd',section:'bd',div:'bd',h1:'bd',h2:'bd',h3:'bd',h4:'bd',h5:'bd',h6:'bd',p:'bd',a:'bd',button:'bd',img:'bd',ul:'bd',ol:'bd',li:'bd',span:'bd',em:'bd',strong:'bd',table:'bd',tr:'bd',td:'bd',th:'bd',form:'bd',input:'bd',textarea:'bd',select:'bd',footer:'bd' },
    'Text Only': { h1:'bd',h2:'sd',h3:'hh',h4:'oh',h5:'cr',h6:'rd', body:'bd', p: 'bd' },
    'Links & Buttons': { a:'rim',button:'cp',input:'sd',select:'hh',textarea:'sd', body:'bd',p:'hh',div:'hh',span:'hh' },
    'Sparse': { body:'bd',h1:'cr',h2:'sd',p:'hh',a:'rim',img:'cr',button:'cp',footer:'bd' }
  };

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        /* shallow merge — keep all keys from DEFAULTS */
        for (var k in DEFAULTS) {
          if (saved.hasOwnProperty(k)) { DEFAULTS[k] = saved[k]; }
        }
      }
    } catch (_) { /* ignore */ }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    } catch (_) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ */
  /*  Audio Engine                                                        */
  /* ------------------------------------------------------------------ */

  function AudioEngine() {
    this.ctx = null;
    this.buffers = {};       /* "soundAbbr" → AudioBuffer[] (random pick) */
    this.masterGain = null;
    this.activeSources = {}; /* for choke groups: "soundAbbr" → AudioBufferSourceNode */
    this.loading = false;
    this.loadedMachine = null;
  }

  AudioEngine.prototype.init = function () {
    if (this.ctx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = DEFAULTS.volume;
    this.masterGain.connect(this.ctx.destination);
  };

  AudioEngine.prototype.setVolume = function (v) {
    DEFAULTS.volume = v;
    if (this.masterGain) { this.masterGain.gain.value = v; }
    saveSettings();
  };

  /** Preload all samples for a machine. Returns a Promise. */
  AudioEngine.prototype.loadMachine = function (machineName) {
    var self = this;
    if (self.loadedMachine === machineName) { return Promise.resolve(); }
    if (self.loading) { return Promise.resolve(); } /* debounce — skip if already loading */

    var machine = MACHINES[machineName];
    if (!machine) { return Promise.reject('Unknown machine: ' + machineName); }

    self.init();
    self.loading = true;
    self.buffers = {};
    self.activeSources = {};

    var sounds = machine.sounds;
    var keys = Object.keys(sounds);
    var total = 0;
    var done = 0;
    keys.forEach(function (k) { total += sounds[k].length; });

    var promises = [];

    keys.forEach(function (abbr) {
      var paths = sounds[abbr];
      if (!self.buffers[abbr]) { self.buffers[abbr] = []; }

      paths.forEach(function (path) {
        /* Encode path segments (some filenames have spaces) */
        var encoded = path.split('/').map(encodeURIComponent).join('/');
        var url = CDN_BASE + encoded;
        var p = fetch(url)
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.arrayBuffer();
          })
          .then(function (buf) {
            return self.ctx.decodeAudioData(buf);
          })
          .then(function (audioBuf) {
            self.buffers[abbr].push(audioBuf);
            done++;
          })
          .catch(function () {
            done++; /* skip missing files silently */
          });
        promises.push(p);
      });
    });

    return Promise.all(promises).then(function () {
      self.loadedMachine = machineName;
      self.loading = false;
    });
  };

  /** Play a sound by abbreviation. Handles choke groups. */
  AudioEngine.prototype.play = function (soundAbbr, depth) {
    if (!this.ctx || !this.buffers[soundAbbr]) { return; }

    var bufs = this.buffers[soundAbbr];
    if (!bufs || bufs.length === 0) { return; }

    /* choke: stop previous sources in the same group */
    if (DEFAULTS.chokeEnabled) {
      for (var groupName in CHOKE_GROUPS) {
        var group = CHOKE_GROUPS[groupName];
        if (group.indexOf(soundAbbr) !== -1) {
          for (var i = 0; i < group.length; i++) {
            var s = group[i];
            if (this.activeSources[s]) {
              try { this.activeSources[s].stop(); } catch (_) {}
              delete this.activeSources[s];
            }
          }
          break;
        }
      }
    }

    var source = this.ctx.createBufferSource();
    /* use depth for variation selection if enabled, otherwise random */
    var idx;
    if (DEFAULTS.useDepthVariation) {
      idx = (depth || 0) % bufs.length;
    } else {
      idx = Math.floor(Math.random() * bufs.length);
    }
    source.buffer = bufs[idx];
    source.connect(this.masterGain);
    source.start(0);

    this.activeSources[soundAbbr] = source;
    var self = this;
    source.onended = function () {
      delete self.activeSources[soundAbbr];
    };
  };

  /* ------------------------------------------------------------------ */
  /*  Highlight Manager                                                   */
  /* ------------------------------------------------------------------ */

  function HighlightManager() {
    this.currentEl = null;
  }

  HighlightManager.prototype.flash = function (el, soundAbbr) {
    var color = HIGHLIGHT_COLORS[soundAbbr] || HIGHLIGHT_COLORS.misc;

    /* remove previous highlight */
    if (this.currentEl) {
      this.currentEl.style.transition = '';
      this.currentEl.style.transform = '';
      this.currentEl.style.backgroundColor = '';
    }

    this.currentEl = el;

    /* apply highlight */
    el.style.transition = 'transform 80ms ease-out, background-color 80ms ease-out';
    el.style.transform = 'scale(1.05)';
    el.style.backgroundColor = color;

    /* remove after 150ms */
    var self = this;
    setTimeout(function () {
      if (self.currentEl === el) {
        el.style.transition = 'transform 120ms ease-in, background-color 120ms ease-in';
        el.style.transform = '';
        el.style.backgroundColor = '';
        self.currentEl = null;
      }
    }, 150);
  };

  /* ------------------------------------------------------------------ */
  /*  Mapping Engine                                                      */
  /* ------------------------------------------------------------------ */

  /** Resolve which sound an element should trigger. */
  function resolveSound(el, tagMap) {
    var tag = el.tagName.toLowerCase();
    return tagMap[tag] || FALLBACK_SOUND;
  }

  /* ------------------------------------------------------------------ */
  /*  DOM Walker                                                          */
  /* ------------------------------------------------------------------ */

  /** Depth-first pre-order traversal, skipping non-visual elements. */
  var SKIP_TAGS = {
    script: 1, style: 1, noscript: 1, template: 1,
    head: 1, link: 1, meta: 1, title: 1, br: 1, hr: 1,
    svg: 1, path: 1, circle: 1, rect: 1, g: 1, line: 1
  };

  function collectWalkable(rootEl, panelEl) {
    var elements = [];

    function walk(node, depth) {
      if (!node || node.nodeType !== 1) return; /* Element nodes only */
      if (node === panelEl) return;             /* skip overlay */
      var tag = node.tagName.toLowerCase();
      if (SKIP_TAGS[tag]) return;

      elements.push({ el: node, depth: depth });

      var child = node.firstElementChild;
      while (child) {
        walk(child, depth + 1);
        child = child.nextElementSibling;
      }
    }

    walk(rootEl, 0);
    return elements;
  }

  function DOMWalker() {
    this.elements = [];
    this.index = 0;
    this.running = false;
    this.timer = null;
    this.lastTick = 0;
    this.onTick = null; /* callback(el, depth) */
  }

  DOMWalker.prototype.build = function (rootEl, panelEl) {
    this.elements = collectWalkable(rootEl || document.body, panelEl);
    this.index = 0;
  };

  DOMWalker.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.lastTick = performance.now();
    this._schedule();
  };

  DOMWalker.prototype.stop = function () {
    this.running = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  };

  DOMWalker.prototype._schedule = function () {
    if (!this.running) return;

    var self = this;
    var interval = 60000 / DEFAULTS.bpm; /* ms per step, always reads current BPM */

    var now = performance.now();
    var elapsed = now - self.lastTick;

    if (elapsed >= interval) {
      /* fire current element */
      if (self.elements.length > 0) {
        var item = self.elements[self.index];
        if (self.onTick) { self.onTick(item.el, item.depth); }
        self.index = (self.index + 1) % self.elements.length;
      }
      self.lastTick = now;
      elapsed = 0;
    }

    var delay = Math.max(0, interval - elapsed);
    self.timer = setTimeout(function () { self._schedule(); }, delay);
  };

  /* ------------------------------------------------------------------ */
  /*  Overlay UI                                                          */
  /* ------------------------------------------------------------------ */

  function OverlayUI(audio, walker) {
    this.audio = audio;
    this.walker = walker;
    this.panel = null;
    this.playing = false;
    this.expanded = false;
    this._build();
  }

  OverlayUI.prototype._build = function () {
    var self = this;

    /* Inject minimal CSS — only what's functionally needed */
    var style = document.createElement('style');
    style.id = 'html-drums-style';
    style.textContent = [
      '#html-drums-panel{position:fixed;top:8px;right:8px;z-index:2147483647;',
      'background:Window;padding:8px;border:2px outset;min-width:200px;max-width:280px;',
      'font-size:13px}',
      '#html-drums-panel select,#html-drums-panel input{box-sizing:border-box}',
      '#html-drums-panel .hd-row{margin:4px 0}',
      '#html-drums-panel .hd-row label{display:inline-block;width:36px}',
      '#html-drums-panel .hd-settings{display:none}',
      '#html-drums-panel .hd-settings.open{display:block}',
      '#html-drums-panel .hd-toggle-row button.active{font-weight:bold;background:ButtonFace;border-style:inset}',
      '#html-drums-panel .hd-loading{display:none}',
      '#html-drums-panel .hd-progress{height:4px;background:ButtonFace;border:1px inset}',
      '#html-drums-panel .hd-progress-bar{height:100%;background:Highlight;width:0%}'
    ].join('');
    document.head.appendChild(style);

    /* Build panel — pure HTML elements, browser-default styling */
    var panel = document.createElement('div');
    panel.id = 'html-drums-panel';

    var machineOpts = MACHINE_ORDER.map(function (m) {
      return '<option value="' + m + '"' + (m === DEFAULTS.machine ? ' selected' : '') + '>' + m + '</option>';
    }).join('');

    var presetOpts = Object.keys(MAP_PRESETS).map(function (p) {
      return '<option value="' + p + '">' + p + '</option>';
    }).join('');

    var depthActive = DEFAULTS.useDepthVariation ? ' active' : '';
    var depthInactive = DEFAULTS.useDepthVariation ? '' : ' active';
    var chokeActive = DEFAULTS.chokeEnabled ? ' active' : '';
    var chokeInactive = DEFAULTS.chokeEnabled ? '' : ' active';

    panel.innerHTML =
      '<b>\u266A HTML DRUMS</b>' +
      '<hr>' +
      '<select id="hd-machine" style="width:100%">' + machineOpts + '</select>' +
      '<div class="hd-loading" id="hd-loading">' +
        'loading&hellip;' +
        '<div class="hd-progress"><div class="hd-progress-bar" id="hd-progress-bar"></div></div>' +
      '</div>' +
      '<div class="hd-row"><label>BPM</label>' +
        '<input type="range" id="hd-bpm" min="30" max="300" value="' + DEFAULTS.bpm + '" style="width:120px">' +
        '<span id="hd-bpm-val">' + DEFAULTS.bpm + '</span></div>' +
      '<div class="hd-row"><label>Vol</label>' +
        '<input type="range" id="hd-vol" min="0" max="100" value="' + Math.round(DEFAULTS.volume * 100) + '" style="width:120px">' +
        '<span id="hd-vol-val">' + Math.round(DEFAULTS.volume * 100) + '</span></div>' +
      '<button id="hd-play" style="width:100%;margin:4px 0">\u25B6 PLAY</button>' +
      '<br>' +
      '<button id="hd-settings-toggle" style="width:100%">' +
        (DEFAULTS.showSettings ? '\u25BC ' : '\u25B6 ') + 'Settings<' + '/button>' +
      '<div class="hd-settings' + (DEFAULTS.showSettings ? ' open' : '') + '" id="hd-settings">' +
        '<fieldset><legend>Mapping Mode</legend>' +
          '<div class="hd-toggle-row">' +
            '<button id="hd-mode-tag"' + (depthActive ? '' : ' class="active"') + '>Tag</button>' +
            '<button id="hd-mode-depth"' + (depthActive ? ' class="active"' : '') + '>Tag+Depth</button>' +
          '</div>' +
        '</fieldset>' +
        '<fieldset><legend>Choke Groups</legend>' +
          '<div class="hd-toggle-row">' +
            '<button id="hd-choke-on"' + (chokeActive ? ' class="active"' : '') + '>On</button>' +
            '<button id="hd-choke-off"' + (chokeInactive ? ' class="active"' : '') + '>Off</button>' +
          '</div>' +
        '</fieldset>' +
        '<fieldset><legend>Preset <button id="hd-preset-reset" style="float:right">Reset</button></legend>' +
          '<select id="hd-preset" style="width:100%">' + presetOpts + '</select>' +
        '</fieldset>' +
        '<fieldset><legend>Tag Mapping <small>(JSON)</small>' +
          ' <button id="hd-mapping-apply">Apply</button></legend>' +
          '<textarea id="hd-mapping" spellcheck="false" rows="8" cols="30"></textarea>' +
        '</fieldset>' +
        '<fieldset><legend>Legend</legend>' +
          '<div id="hd-legend"></div>' +
        '</fieldset>' +
      '</div>';

    document.body.appendChild(panel);
    this.panel = panel;

    /* Wire events */
    this._wireEvents();
    this._updateLegend();
    this._syncMappingEditor();
  };

  OverlayUI.prototype._wireEvents = function () {
    var self = this;

    document.getElementById('hd-machine').addEventListener('change', function () {
      var machine = this.value;
      DEFAULTS.machine = machine;
      saveSettings();
      self._loadAndRestart(machine);
    });

    var bpmSlider = document.getElementById('hd-bpm');
    var bpmVal = document.getElementById('hd-bpm-val');
    bpmSlider.addEventListener('input', function () {
      var bpm = parseInt(this.value, 10);
      bpmVal.textContent = bpm;
      DEFAULTS.bpm = bpm;
      saveSettings();
    });

    var volSlider = document.getElementById('hd-vol');
    var volVal = document.getElementById('hd-vol-val');
    volSlider.addEventListener('input', function () {
      var vol = parseInt(this.value, 10) / 100;
      volVal.textContent = Math.round(vol * 100);
      self.audio.setVolume(vol);
    });

    document.getElementById('hd-play').addEventListener('click', function () {
      if (self.playing) {
        self._stop();
      } else {
        self._play();
      }
    });

    /* Settings toggle */
    document.getElementById('hd-settings-toggle').addEventListener('click', function () {
      DEFAULTS.showSettings = !DEFAULTS.showSettings;
      var settings = document.getElementById('hd-settings');
      var toggle = document.getElementById('hd-settings-toggle');
      if (DEFAULTS.showSettings) {
        settings.classList.add('open');
        toggle.innerHTML = '\u25BC Settings';
        self._updateLegend();
        self._syncMappingEditor();
      } else {
        settings.classList.remove('open');
        toggle.innerHTML = '\u25B6 Settings';
      }
      saveSettings();
    });

    /* Mode toggles */
    document.getElementById('hd-mode-tag').addEventListener('click', function () {
      DEFAULTS.useDepthVariation = false;
      document.getElementById('hd-mode-tag').classList.add('active');
      document.getElementById('hd-mode-depth').classList.remove('active');
      saveSettings();
    });
    document.getElementById('hd-mode-depth').addEventListener('click', function () {
      DEFAULTS.useDepthVariation = true;
      document.getElementById('hd-mode-depth').classList.add('active');
      document.getElementById('hd-mode-tag').classList.remove('active');
      saveSettings();
    });

    /* Choke toggles */
    document.getElementById('hd-choke-on').addEventListener('click', function () {
      DEFAULTS.chokeEnabled = true;
      document.getElementById('hd-choke-on').classList.add('active');
      document.getElementById('hd-choke-off').classList.remove('active');
      saveSettings();
    });
    document.getElementById('hd-choke-off').addEventListener('click', function () {
      DEFAULTS.chokeEnabled = false;
      document.getElementById('hd-choke-off').classList.add('active');
      document.getElementById('hd-choke-on').classList.remove('active');
      saveSettings();
    });

    /* Preset selector */
    document.getElementById('hd-preset').addEventListener('change', function () {
      var preset = MAP_PRESETS[this.value];
      if (preset) {
        DEFAULTS.tagMap = clone(preset);
        saveSettings();
        self._syncMappingEditor();
        self._updateLegend();
      }
    });

    /* Preset reset */
    document.getElementById('hd-preset-reset').addEventListener('click', function () {
      DEFAULTS.tagMap = clone(DEFAULT_TAG_MAP);
      saveSettings();
      self._syncMappingEditor();
      self._updateLegend();
    });

    /* Mapping editor apply */
    document.getElementById('hd-mapping-apply').addEventListener('click', function () {
      try {
        var parsed = JSON.parse(document.getElementById('hd-mapping').value);
        DEFAULTS.tagMap = parsed;
        saveSettings();
        self._updateLegend();
      } catch (e) {
        /* show error briefly */
        var ta = document.getElementById('hd-mapping');
        ta.style.borderColor = '#ff5050';
        setTimeout(function () { ta.style.borderColor = '#111'; }, 600);
      }
    });
  };

  OverlayUI.prototype._syncMappingEditor = function () {
    var ta = document.getElementById('hd-mapping');
    if (ta) {
      ta.value = JSON.stringify(DEFAULTS.tagMap, null, 2);
    }
  };

  OverlayUI.prototype._loadAndRestart = function (machine) {
    var self = this;
    var loadingEl = document.getElementById('hd-loading');
    var progBar = document.getElementById('hd-progress-bar');
    loadingEl.style.display = 'block';
    if (progBar) progBar.style.width = '0%';

    /* Simulate progress since we don't have per-file callbacks easily */
    var progressInterval = setInterval(function () {
      if (progBar) {
        var w = parseFloat(progBar.style.width) || 0;
        if (w < 90) progBar.style.width = (w + Math.random() * 15) + '%';
      }
    }, 150);

    self.audio.loadMachine(machine).then(function () {
      clearInterval(progressInterval);
      if (progBar) progBar.style.width = '100%';
      setTimeout(function () { loadingEl.style.display = 'none'; }, 300);
      self._updateLegend();
    }).catch(function () {
      clearInterval(progressInterval);
      loadingEl.innerHTML = '<div>failed to load.</div>';
    });
  };

  OverlayUI.prototype._play = function () {
    var self = this;
    var btn = document.getElementById('hd-play');
    var loadingEl = document.getElementById('hd-loading');

    if (self.audio.ctx && self.audio.ctx.state === 'suspended') {
      self.audio.ctx.resume();
    }

    var machine = DEFAULTS.machine;
    if (self.audio.loadedMachine !== machine) {
      loadingEl.style.display = 'block';
      var progBar = document.getElementById('hd-progress-bar');
      if (progBar) progBar.style.width = '0%';
      var progressInterval = setInterval(function () {
        if (progBar) {
          var w = parseFloat(progBar.style.width) || 0;
          if (w < 90) progBar.style.width = (w + Math.random() * 15) + '%';
        }
      }, 150);

      self.audio.loadMachine(machine).then(function () {
        clearInterval(progressInterval);
        if (progBar) progBar.style.width = '100%';
        setTimeout(function () { loadingEl.style.display = 'none'; }, 300);
        self._startWalker();
        self.playing = true;
        btn.textContent = '\u23F8 PAUSE';
        btn.classList.add('playing');
      }).catch(function () {
        clearInterval(progressInterval);
        loadingEl.innerHTML = '<div>failed to load.</div>';
      });
    } else {
      self.audio.init();
      self._startWalker();
      self.playing = true;
      btn.textContent = '\u23F8 PAUSE';
      btn.classList.add('playing');
    }
  };

  OverlayUI.prototype._stop = function () {
    var btn = document.getElementById('hd-play');
    this.walker.stop();
    this.playing = false;
    btn.textContent = '\u25B6 PLAY';
    btn.classList.remove('playing');
  };

  OverlayUI.prototype._startWalker = function () {
    var self = this;
    self.walker.build(document.body, self.panel);
    self.walker.onTick = function (el, depth) {
      var sound = resolveSound(el, DEFAULTS.tagMap);
      self.audio.play(sound, depth);
      self._flash(el, sound);
    };
    self.walker.start();
  };

  OverlayUI.prototype._flash = function (el, sound) {
    if (!this._hl) { this._hl = new HighlightManager(); }
    this._hl.flash(el, sound);
  };

  OverlayUI.prototype._updateLegend = function () {
    if (!DEFAULTS.showSettings) return;
    var legend = document.getElementById('hd-legend');
    if (!legend) return;
    var map = DEFAULTS.tagMap;
    var seen = {};
    for (var tag in map) {
      var snd = map[tag];
      if (!seen[snd]) { seen[snd] = [tag]; }
      else { seen[snd].push(tag); }
    }
    var html = '<table border="1" cellpadding="2" cellspacing="0" width="100%">';
    for (var s in seen) {
      html += '<tr><td><b>' + s + '</b></td><td>&lt;' + seen[s].join('&gt; &lt;') + '&gt;</td></tr>';
    }
    html += '</table>';
    legend.innerHTML = html || 'no mappings';
  };

  /* ------------------------------------------------------------------ */
  /*  Bootstrap                                                           */
  /* ------------------------------------------------------------------ */

  function HTMLDrums() {
    loadSettings();
    this.audio = new AudioEngine();
    this.walker = new DOMWalker();
    this.ui = new OverlayUI(this.audio, this.walker);

    /* Preload the default machine */
    var self = this;
    this.audio.loadMachine(DEFAULTS.machine).catch(function () {});
  }

  /* Singleton guard — don't inject twice */
  if (window.__htmlDrumsInjected) return;
  window.__htmlDrumsInjected = true;

  /* Expose for API access */
  var instance = new HTMLDrums();
  window.HTMLDrums = instance;

})();
