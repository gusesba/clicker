// Ilustrações vetoriais originais. Cada camada é uma textura reutilizada pelo PixiJS.
const svg = (w: number, h: number, content: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${content}</svg>`;

const leaf = (x: number, y: number, scale: number, color: string, angle = 0) => `<path transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" d="M0 0Q-27-10-26-38Q-2-37 0 0Q8-34 30-33Q28-8 0 0" fill="${color}"/>`;

export const forestBack = svg(1400, 760, `
  <defs>
    <linearGradient id="sky" x2="0" y2="1"><stop stop-color="#285d60"/><stop offset=".45" stop-color="#7fada2"/><stop offset="1" stop-color="#c4d4a0"/></linearGradient>
    <radialGradient id="sun"><stop stop-color="#fff4bd" stop-opacity=".9"/><stop offset=".35" stop-color="#f9edbb" stop-opacity=".3"/><stop offset="1" stop-color="#e9e9ad" stop-opacity="0"/></radialGradient>
    <linearGradient id="earth" x2="0" y2="1"><stop stop-color="#8baa72"/><stop offset=".2" stop-color="#416c4b"/><stop offset="1" stop-color="#173b35"/></linearGradient>
    <linearGradient id="bark"><stop stop-color="#183e39"/><stop offset=".5" stop-color="#30574a"/><stop offset="1" stop-color="#1b433c"/></linearGradient>
    <linearGradient id="ray" x2="0" y2="1"><stop stop-color="#fff3bc" stop-opacity=".24"/><stop offset="1" stop-color="#fff3bc" stop-opacity="0"/></linearGradient>
  </defs>
  <path fill="url(#sky)" d="M0 0h1400v760H0z"/>
  <circle cx="805" cy="240" r="340" fill="url(#sun)"/>
  <g fill="#54867b" opacity=".48">
    <path d="M50 550 108 190 130 0h27l-5 230 63 325zM270 530 307 0h28l-3 290 33 240zM1020 550 1045 0h29l17 300 52 240zM1200 570 1240 0h36l-8 350 58 220z"/>
    <path d="M140 250 54 85l12-12 92 125 64-124 14 8-77 180zM320 210l-80-123 12-12 66 84 80-113 14 8zM1060 265l-92-139 12-10 74 99 93-151 13 10z"/>
  </g>
  <g fill="#347365" opacity=".55"><path d="M0 440q130-95 240-40t210-15q130-80 250 10t230-20q150-65 270 10t200 10v230H0z"/></g>
  <path d="M0 535q200-100 420-5t410-4q240-110 570-3v237H0z" fill="#638e67"/>
  <path d="m670 0 180 0 200 620-550 0z" fill="url(#ray)"/>
  <path d="m1010 0 33 0 255 600-140 0z" fill="url(#ray)" opacity=".6"/>
  <g fill="url(#bark)">
    <path d="M0 0h153q-24 202-10 335 13 138 90 254l-137 48-96-42z"/>
    <path d="M1400 0h-155q27 170-6 329-27 130-112 261l153 47 120-31z"/>
    <path d="M80 175q134 21 285-114l19 15Q243 238 109 237zM1291 224q-144-13-255-154l-18 13q117 190 260 212z"/>
    <path d="M205 0h70q-33 200-7 384 11 97 65 173l-106 12q-56-195-22-569z"/>
    <path d="M1145 0h65q-21 202-11 367 11 100 61 188l-105 6q-61-211-10-561z"/>
  </g>
  <g fill="none" stroke="#57735a" stroke-width="5" opacity=".4"><path d="M109 15Q66 320 161 527M240 4q-29 245 13 441M1276 17q42 282-69 489M1179 0q-17 227 0 383"/></g>
  <g fill="#1d4b40"><ellipse cx="70" cy="15" rx="270" ry="122"/><ellipse cx="350" cy="0" rx="260" ry="83"/><ellipse cx="1210" cy="0" rx="280" ry="107"/><ellipse cx="1410" cy="90" rx="185" ry="150"/></g>
  <g fill="#2c6150"><ellipse cx="128" cy="50" rx="150" ry="67"/><ellipse cx="350" cy="4" rx="160" ry="45"/><ellipse cx="1150" cy="28" rx="150" ry="58"/></g>
  ${Array.from({ length: 32 }, (_, i) => leaf((i * 137) % 1400, 36 + (i * 31) % 105, .4 + (i % 4) * .15, i % 2 ? '#497853' : '#386b4b', i * 43)).join('')}
  <path d="M0 587q165-70 349-23 152 39 308 4 215-47 393-7 172 39 350-4v203H0z" fill="url(#earth)"/>
  <ellipse cx="715" cy="616" rx="393" ry="45" fill="#c4d39b" opacity=".19"/>
  <path d="M0 657q180-60 396-6t421 4q270-65 583-4v109H0z" fill="#244d3a"/>
  <g fill="#69845b"><path d="m201 587 47-24 42 12 22 28-100 8z"/><path d="m1030 578 40-28 46 10 20 36-110 2z"/></g>
  <g fill="#a6b58a"><path d="m201 587 47-24 42 12-40 1z"/><path d="m1030 578 40-28 46 10-43 1z"/></g>
  <path d="M62 540q74 63 197 64l-8 17q-114 8-189-39zM1290 536q-63 50-157 56l-3 20q105 4 160-24z" fill="#294f3b"/>
  ${Array.from({ length: 58 }, (_, i) => {
    const x = (i * 173) % 1400, y = 576 + (i * 23) % 144;
    return `<path d="m${x} ${y}q-8-22-16-22 9 2 14 10 1-19 7-27-1 17 2 23 5-10 14-12-11 9-12 28" fill="${['#5c8051', '#7a9c65', '#356447'][i % 3]}"/>`;
  }).join('')}
  <g fill="#e7dba3"><ellipse cx="440" cy="605" rx="5" ry="2"/><ellipse cx="842" cy="641" rx="7" ry="2"/><ellipse cx="1000" cy="617" rx="4" ry="1.5"/></g>
`);

export const forestFront = svg(1400, 760, `
  <defs><linearGradient id="front" x2="0" y2="1"><stop stop-color="#214e3b"/><stop offset="1" stop-color="#0f302c"/></linearGradient></defs>
  <path d="M0 690q140-54 325 26t365 6q203-38 368-3t342-50v91H0z" fill="url(#front)"/>
  ${Array.from({ length: 34 }, (_, i) => leaf((i * 181) % 1400, 745 + i % 3 * 18, 1 + (i % 4) * .25, i % 3 ? '#173f32' : '#28573c', (i % 2 ? 18 : -18))).join('')}
  <g stroke="#4c7951" stroke-width="3" fill="none"><path d="M85 760Q67 671 18 620M1270 760q18-84 76-117"/></g>
  ${Array.from({ length: 8 }, (_, i) => leaf(30 + i * 7, 650 + i * 11, .7, '#396646', -45)).join('')}
  ${Array.from({ length: 8 }, (_, i) => leaf(1342 - i * 8, 655 + i * 12, .7, '#396646', 45)).join('')}
  <g><path d="M156 697v-28h8v28" fill="#d9c59f"/><path d="M135 675q23-39 49 0z" fill="#ba705c"/><circle cx="148" cy="666" r="3" fill="#f6dbb8"/><circle cx="167" cy="662" r="4" fill="#f6dbb8"/><path d="M1190 712v-30h8v30" fill="#d9c59f"/><path d="M1166 686q27-41 52 0z" fill="#b7785c"/></g>
`);

export const heroCape = svg(240, 280, `<defs><linearGradient id="c" x2="1" y2="1"><stop stop-color="#b75d50"/><stop offset="1" stop-color="#673b42"/></linearGradient></defs><path d="M114 74Q55 77 40 144L15 224q25-10 45 5l19-19 9 24q46-6 70-35L153 91z" fill="url(#c)" stroke="#3e3538" stroke-width="5"/><path d="M108 97Q79 140 60 204m53-82q-5 42-22 74" fill="none" stroke="#d47d61" stroke-width="5" stroke-linecap="round"/>`);

export const heroBody = svg(240, 280, `
  <defs><linearGradient id="t" x2="1" y2="1"><stop stop-color="#82a995"/><stop offset="1" stop-color="#3a6b64"/></linearGradient><linearGradient id="b" x2="1" y2="1"><stop stop-color="#917156"/><stop offset="1" stop-color="#4b4a3f"/></linearGradient></defs>
  <g stroke="#30453e" stroke-width="5" stroke-linejoin="round">
  <path d="m94 185-8 49-15 17q0 12 31 7l14-15 4-49" fill="url(#b)"/>
  <path d="m125 184 13 48-6 17q9 14 34 5l1-15-12-54" fill="url(#b)"/>
  <path d="M85 100q35-22 66 1l13 78-19 31-54-9-14-29z" fill="url(#t)"/>
  <path d="m86 139-11 40-24-6 8-58q6-18 25-11" fill="#648b76"/>
  <path d="M52 166q-17 11-6 26 11 12 23-5l5-14" fill="#deb489"/>
  <path d="m81 171 77 3-3 16-71-2z" fill="#664c3a"/>
  <path d="m113 172 18 1v17l-19-1z" fill="#d9bd75" stroke-width="3"/>
  <path d="m91 104 48 63 10-9-42-62" fill="#a58b60" stroke-width="3"/>
  <path d="m137 186 9 20 15-3 3-16" fill="#c1b180" stroke-width="3"/>
  </g><path d="m89 215 19 1m34-1 14-3" stroke="#c5ac7b" stroke-width="4"/>
`);

export const heroHead = svg(240, 280, `
  <defs><linearGradient id="skin" x2="0" y2="1"><stop stop-color="#f5d6ac"/><stop offset="1" stop-color="#d8a47c"/></linearGradient></defs>
  <path d="M86 87q-15-12-16-36 0-34 39-37 42-3 52 25l-5 42-19 23z" fill="#ded5ac" stroke="#3b4b41" stroke-width="5"/>
  <path d="M83 62q-17-8-16 8 1 15 18 13m64-20q17-11 17 5-1 15-16 17" fill="#deb18a" stroke="#3b4b41" stroke-width="4"/>
  <path d="M83 46q31-18 67 0l-1 33q-3 24-30 26-29-4-34-26z" fill="url(#skin)" stroke="#3b4b41" stroke-width="4"/>
  <path d="M78 56q-8-32 18-39 31-11 53 5 13 8 11 30l-16-7-6-16-17 20-2-13-19 19-1-14z" fill="#e2dbb7" stroke="#3b4b41" stroke-width="4" stroke-linejoin="round"/>
  <path d="m92 67 12-2m24 0 12 3" stroke="#51483d" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="102" cy="73" rx="3.5" ry="5" fill="#293f36"/><ellipse cx="133" cy="74" rx="3.5" ry="5" fill="#293f36"/>
  <path d="m113 87 12 1" stroke="#935f50" stroke-width="3" stroke-linecap="round"/>
  <path d="M82 96q34 13 70-4l7 16-23 14-51-9z" fill="#c06d53" stroke="#593f38" stroke-width="4"/>
  <path d="m141 110 31 2-20 18-17-12" fill="#bc6551" stroke="#593f38" stroke-width="3"/>
  <path d="M92 22q-4-25 19-20 0 12-10 20" fill="#8cb480" stroke="#3b4b41" stroke-width="3"/>
`);

export const heroArm = svg(190, 220, `
  <defs><linearGradient id="s" x2="1" y2="0"><stop stop-color="#bccac0"/><stop offset=".45" stop-color="#f8f6d9"/><stop offset=".5" stop-color="#a2c2bb"/><stop offset="1" stop-color="#779e98"/></linearGradient></defs>
  <path d="M30 133q2-20 19-17l32 24-11 23-32-9z" fill="#739b83" stroke="#30453e" stroke-width="5"/>
  <path d="m73 139 23 2 8 18-21 13-15-16z" fill="#edc69c" stroke="#30453e" stroke-width="4"/>
  <g transform="rotate(23 103 135)" stroke="#30453e" stroke-width="4" stroke-linejoin="round"><path d="m100 129-5-103 15-24 15 24-8 103z" fill="url(#s)"/><path d="m83 124 51 0-4 12-19-3-20 4z" fill="#d3b977"/><path d="m101 136 13 0-1 30-12 0z" fill="#816247"/><path d="m100 162 15 0 3 10-20 0z" fill="#dbbf77"/></g>
`);

export const sproutBody = svg(300, 280, `
  <defs><linearGradient id="g" x2=".8" y2="1"><stop stop-color="#bbd78f"/><stop offset=".45" stop-color="#84b16d"/><stop offset="1" stop-color="#446e51"/></linearGradient></defs>
  <g stroke="#355b42" stroke-width="5" stroke-linejoin="round"><path d="M78 138Q39 127 32 168q17 12 42-8m144-22q38-12 46 30-19 10-42-8" fill="#729b61"/>
  <path d="m93 220-15 29q17 15 40-1l10-24m43-4 12 29q21 13 38-1l-17-30" fill="#537e50"/>
  <path d="M69 158q-4-71 44-91 56-25 104 28 25 28 17 76-6 59-76 65-81 4-89-78z" fill="url(#g)"/>
  <path d="m79 118 12-32 25-2 17 14-28 23z" fill="#b6cf8c" stroke-width="3"/>
  </g><path d="M106 177q39 17 79-1-4 38-39 31-27-3-40-30" fill="#36543d"/>
  <path d="m129 181 16 3-7 12z" fill="#f2edc4"/><ellipse cx="110" cy="147" rx="10" ry="15" fill="#293f32"/><ellipse cx="185" cy="147" rx="10" ry="15" fill="#293f32"/>
  <ellipse cx="107" cy="142" rx="3" ry="5" fill="#fbf6c6"/><ellipse cx="182" cy="142" rx="3" ry="5" fill="#fbf6c6"/>
  <ellipse cx="91" cy="169" rx="12" ry="6" fill="#d8b87c" opacity=".65"/><ellipse cx="203" cy="168" rx="12" ry="6" fill="#d8b87c" opacity=".65"/>
  <g fill="#c4dc93" opacity=".7"><circle cx="94" cy="127" r="4"/><circle cx="207" cy="196" r="5"/><circle cx="182" cy="217" r="3"/></g>
`);

export const sproutCrown = svg(300, 280, `<g stroke="#355b42" stroke-width="4" stroke-linejoin="round"><path d="M145 81q-2-33 17-50" fill="none"/><path d="M151 55q-45 3-47-39 43-2 47 39" fill="#82b765"/><path d="M152 49q8-43 46-37-1 40-46 37" fill="#b5d787"/><path d="m119 28 27 23m39-25-28 18" stroke="#5d914f" stroke-width="2"/></g>`);

export const mushroomBody = svg(300, 280, `
  <defs><linearGradient id="stem" x2="0" y2="1"><stop stop-color="#eee0b0"/><stop offset="1" stop-color="#b6a078"/></linearGradient><linearGradient id="cap" x2="0" y2="1"><stop stop-color="#e0a475"/><stop offset="1" stop-color="#a65e4c"/></linearGradient></defs>
  <g stroke="#514d38" stroke-width="5" stroke-linejoin="round"><path d="M107 135 91 218q-25 24-10 31 27 5 46-13l35 1q28 27 52 9 6-8-12-24l-15-89" fill="url(#stem)"/>
  <path d="M103 166q-27-8-35 22l19 8 20-17m88-13q27-10 38 22l-19 10-22-18" fill="#d4bf91"/>
  <path d="M39 125q10-90 107-101 95 11 114 100-47 45-111 26-55 18-110-25z" fill="url(#cap)"/>
  <path d="M42 124q57 25 107 14 56 13 108-14" fill="none" stroke="#efc597" stroke-width="8"/></g>
  <g fill="#f6ddb1"><ellipse cx="96" cy="78" rx="17" ry="12" transform="rotate(-28 96 78)"/><ellipse cx="176" cy="58" rx="15" ry="12"/><ellipse cx="218" cy="103" rx="13" ry="9"/><ellipse cx="137" cy="110" rx="9" ry="7"/></g>
  <ellipse cx="124" cy="184" rx="8" ry="11" fill="#3d4735"/><ellipse cx="175" cy="184" rx="8" ry="11" fill="#3d4735"/><path d="M139 205q12 8 23-1" fill="none" stroke="#795b46" stroke-width="4" stroke-linecap="round"/><g fill="#c58c6d"><ellipse cx="106" cy="201" rx="10" ry="5"/><ellipse cx="194" cy="201" rx="10" ry="5"/></g>
`);

export const stoneBody = svg(300, 280, `
  <defs><linearGradient id="r" x2="1" y2="1"><stop stop-color="#9aa899"/><stop offset="1" stop-color="#596f65"/></linearGradient></defs>
  <g stroke="#354c43" stroke-width="5" stroke-linejoin="round"><path d="m84 192-13 45 37 12 19-27m49-14 10 36 41-7-13-47" fill="#687b6b"/><path d="m74 105-40 29-5 49 35 8 23-42m128-42 39 27 8 47-33 12-26-43" fill="#768d78"/>
  <path d="m74 109 29-57 76-8 48 57-7 93-43 37-70-9-35-41z" fill="url(#r)"/><path d="m103 52 76-8 30 37-71-9-51 31z" fill="#b1baa2" stroke-width="3"/>
  <path d="m128 79 12 40-16 21 15 21-11 52" fill="none" stroke-width="3"/>
  </g><path d="m93 117 30 7-2 16-29-7m74-10 31-8 2 19-31 7" fill="#dce39e"/><path d="m122 177 59-4-11 15-33 4z" fill="#374d42"/>
  <path d="m79 94 9-36q32-12 48 7l-7 18-27-6z" fill="#6a935d"/><path d="m171 213 30-8 16-24-4 32-28 17z" fill="#7c9b60"/>
  ${leaf(171, 55, .85, '#8bb478', 15)}${leaf(187, 62, .6, '#638b5a', 65)}
`);

export const bossBody = svg(360, 360, `
  <defs><linearGradient id="wood" x2="1" y2="1"><stop stop-color="#aa8860"/><stop offset=".5" stop-color="#725b42"/><stop offset="1" stop-color="#413f34"/></linearGradient></defs>
  <g stroke="#303f31" stroke-width="6" stroke-linejoin="round"><path d="m110 263-24 57-39 13 7 14 59-3 28-63m80-15 17 59 43 18 22-5-26-32-13-54" fill="url(#wood)"/>
  <path d="m100 148-49 10-33 73 18 19 38-46 33 1m146-54 46 15 42 66-20 22-40-43-31-2" fill="url(#wood)"/>
  <path d="m97 136 31-65 104 2 34 67-8 108-42 49-90-4-33-64z" fill="url(#wood)"/>
  <path d="m119 88-19-35-37-5-5-39 18-1 6 24 40 2 22 43m70 1 24-37 36-6 11-29 18 5-7 44-44 3-13 38" fill="url(#wood)"/>
  <path d="m145 109 10 44-13 33 16 32-11 56m61-161-7 43 14 39-10 76" fill="none" stroke="#bea076" stroke-width="4"/>
  </g><path d="m116 143 44 16-6 23-41-17m86-6 42-16 2 22-41 19" fill="#f5ca6c" stroke="#3d4936" stroke-width="5"/>
  <path d="m139 225 79-3-13 25-49 3z" fill="#263c30"/><path d="m150 224 13 2-2 15 13-2 4-15 14 1-1 16 12-2 5-15" fill="#bda87a"/>
  ${leaf(126, 99, 1.65, '#5f8952', -45)}${leaf(208, 97, 1.75, '#78995a', 40)}${leaf(177, 78, 1.65, '#8ba861', 0)}
  <g fill="#85a266"><ellipse cx="105" cy="224" rx="15" ry="32"/><ellipse cx="243" cy="239" rx="15" ry="24"/></g>
  <g fill="#d2ba83"><circle cx="115" cy="207" r="4"/><circle cx="243" cy="224" r="5"/></g>
`);
