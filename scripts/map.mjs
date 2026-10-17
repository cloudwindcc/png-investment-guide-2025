import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Natural Earth 1:50m boundaries, projected in Mercator across the date line.
// Country outlines come directly from the included GeoJSON, never hand-drawn.
export async function renderMap() {
  const data = JSON.parse(await fs.readFile(path.join(root, 'data/geography/pacific-markets.geojson'), 'utf8'));
  const scale = 592 / 55;
  const mercator = latitude => Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) * 180 / Math.PI;
  const project = ([longitude, latitude]) => [24 + ((longitude < 0 ? longitude + 360 : longitude) - 138) * scale, 84 + (mercator(3) - mercator(latitude)) * scale];
  const point = coordinates => project(coordinates).map(n => n.toFixed(2)).join(',');
  const pathFor = geometry => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).map(polygon => polygon.map(ring => `M${ring.map(point).join('L')}Z`).join('')).join('');
  const labels = [
    { code: 'PNG', text: 'PAPUA NEW GUINEA', anchor: [147.4, -7.0], x: 43, y: 110 },
    { code: 'SLB', text: 'SOLOMON ISLANDS', anchor: [160.2, -9.55], x: 240, y: 174 },
    { code: 'VUT', text: 'VANUATU', anchor: [167.55, -16.3], x: 267, y: 326 },
    { code: 'FJI', text: 'FIJI', anchor: [178.0, -17.8], x: 442, y: 308 },
    { code: 'WSM', text: 'SAMOA', anchor: [-172.1, -13.7], x: 539, y: 232 },
    { code: 'TON', text: 'TONGA', anchor: [-175.2, -21.2], x: 518, y: 392 }
  ];
  const grid = [140, 150, 160, 170, 180, 190].map(lon => {
    const x = project([lon, 0])[0].toFixed(2);
    return `<path d="M${x}74V443"/><text x="${x}" y="463" text-anchor="middle">${lon <= 180 ? lon + '°E' : (360 - lon) + '°W'}</text>`;
  }).join('') + [0, -10, -20, -30].map(lat => {
    const y = project([138, lat])[1].toFixed(2);
    return `<path d="M24 ${y}H616"/><text x="26" y="${Number(y) - 6}">${Math.abs(lat)}°${lat ? 'S' : ''}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="520" viewBox="0 0 640 520" role="img" aria-labelledby="title desc">
<title id="title">South Pacific island markets — geographic map</title><desc id="desc">Real Natural Earth coastlines for Papua New Guinea, Solomon Islands, Vanuatu, Fiji, Samoa and Tonga, in their geographic positions. Mercator projection crossing the international date line.</desc>
<defs><clipPath id="extent"><rect x="24" y="74" width="592" height="369"/></clipPath><radialGradient id="ocean"><stop stop-color="#28606a"/><stop offset="1" stop-color="#123943"/></radialGradient></defs>
<rect width="640" height="520" fill="url(#ocean)"/><text x="30" y="39" fill="#c2d8d0" font-family="system-ui,sans-serif" font-size="11" letter-spacing="2.2">ISLAND MARKETS · SOUTH PACIFIC</text>
<g stroke="#a8c7c1" stroke-opacity=".14" stroke-width=".65" fill="#9ebdb8" font-family="system-ui,sans-serif" font-size="9">${grid}</g>
<g clip-path="url(#extent)" stroke="#bcd7c8" stroke-width=".65" stroke-linejoin="round" fill-rule="evenodd">${data.features.map(feature => `<path data-country="${feature.properties.code}" fill="${feature.properties.code === 'PNG' ? '#d3bb8a' : '#80b8a6'}" d="${pathFor(feature.geometry)}"/>`).join('')}</g>
<g font-family="system-ui,sans-serif" font-size="13" font-weight="550" fill="#f3f7ee">${labels.map(label => { const [x, y] = project(label.anchor); const targetX = label.x + 14; return `<path d="M${x.toFixed(2)},${y.toFixed(2)}L${targetX},${label.y + 7}" fill="none" stroke="#a8c8bb" stroke-width=".7"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.1" fill="#eed5a5" stroke="#123943" stroke-width="1"/><text x="${label.x}" y="${label.y}">${label.text}</text>`; }).join('')}</g>
<g transform="translate(600 36)" fill="none" stroke="#b4cdc4" stroke-width="1"><path d="M0 4V30m-9-12H9m-12-7 3-7 3 7"/><text x="0" y="-3" fill="#b4cdc4" stroke="none" text-anchor="middle" font-family="sans-serif" font-size="8">N</text></g>
<text x="30" y="495" fill="#b0c9bf" font-family="system-ui,sans-serif" font-size="9" letter-spacing=".5">COASTLINES: NATURAL EARTH · MERCATOR PROJECTION</text><rect x="420" y="487" width="8" height="8" rx="2" fill="#d3bb8a"/><text x="435" y="495" fill="#d9e4d7" font-family="system-ui,sans-serif" font-size="9">PNG · OUR STARTING POINT</text>
</svg>\n`;
}
