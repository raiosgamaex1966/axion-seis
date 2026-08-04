import fs from 'fs';
import zlib from 'zlib';

function generatePNG(width, height, filename) {
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const rCore = width * 0.12;
  const rRingOuter = width * 0.38;
  const rRingInner = width * 0.34;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 10, g = 25, b = 47, a = 255;

      if (dist <= rCore) {
        r = 0; g = 201; b = 177;
      }
      else if (dist >= rRingInner && dist <= rRingOuter) {
        r = 0; g = 201; b = 177;
      }
      else if (dist >= rRingOuter && dist <= rRingOuter + (width * 0.04)) {
        r = 79; g = 195; b = 247;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0;
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedIDAT = zlib.deflateSync(scanlines);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedIDAT);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngFile = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filename, pngFile);
  console.log(`Generated ${filename} (${pngFile.length} bytes)`);
}

generatePNG(192, 192, 'public/pwa-192x192.png');
generatePNG(512, 512, 'public/pwa-512x512.png');
