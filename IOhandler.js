/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const fs = require("fs");
const { pipeline } = require("stream/promises");
const yauzl = require("yauzl-promise");
const path = require("path");
const PNG = require("pngjs").PNG;

const unzip = async (pathIn, pathOut) => {
  try {
    const zip = await yauzl.open(pathIn);
    await fs.promises.mkdir(pathOut, { recursive: true });

    for await (const entry of zip) {
      if (entry.filename.endsWith("/")) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`, {
          recursive: true,
        });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }

    await zip.close().then(console.log("Extraction operation complete"));
  } catch (error) {
    console.log(error);
  }
};

const readDir = async (dir) => {
  try {
    const file = await fs.promises.readdir(dir);

    const pngImgs = [];
    for (const img of file) {
      if (path.extname(img).toLowerCase() === ".png") {
        pngImgs.push(img);
      }
    }
    return pngImgs;
  } catch (error) {
    console.log(error);
  }
};

const grayScale = async (pathIn, pathOut) => {
  await fs.promises.mkdir(pathOut, { recursive: true });
  const data = await readDir(pathIn);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${pathIn}/${img}`)
      .pipe(
        new PNG({
          filterType: 4, // Transform stream
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          // "this" refers to PNG Image
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            const grayScale = Math.round(
              0.2126 * this.data[idx] +
                0.7152 * this.data[idx + 1] +
                0.0722 * this.data[idx + 2]
            );
            this.data[idx] = grayScale; //R
            this.data[idx + 1] = grayScale; //G
            this.data[idx + 2] = grayScale; //B
            // this.data[idx + 3] = this.data[idx + 3] >> 1; // opacity
          }
        }
        this.pack().pipe(fs.createWriteStream(`${pathOut}/${img}`));
      });
  }
};

const sepia = async (pathIn, pathOut) => {
  await fs.promises.mkdir(pathOut, { recursive: true });
  const data = await readDir(pathIn);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${pathIn}/${img}`)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            const luminance =
              0.299 * this.data[idx] +
              0.587 * this.data[idx + 1] +
              0.114 * this.data[idx + 2];

            this.data[idx] = Math.min(255, luminance + 40);
            this.data[idx + 1] = Math.min(255, luminance + 20);
            this.data[idx + 2] = Math.min(255, luminance);
          }
        }
        this.pack().pipe(fs.createWriteStream(`${pathOut}/${img}`));
      });
  }
};

const slumber = async (pathIn, pathOut) => {
  await fs.promises.mkdir(pathOut, { recursive: true });
  const data = await readDir(pathIn);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${pathIn}/${img}`)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("parsed", function () {
        for (var y = 0; y < this.height; y++) {
          for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            const luminance =
              0.099 * this.data[idx] +
              0.887 * this.data[idx + 1] +
              0.114 * this.data[idx + 2];

            const adjustRed = (this.data[idx] - luminance) * 0.8;
            const adjustGreen = (this.data[idx + 1] - luminance) * 0.2;
            const adjustBlue = (this.data[idx + 2] - luminance) * 0.3;

            this.data[idx] = Math.min(255, luminance + adjustRed);
            this.data[idx + 1] = Math.min(255, luminance + adjustGreen);
            this.data[idx + 2] = Math.min(255, luminance + adjustBlue);
          }
        }
        this.pack().pipe(fs.createWriteStream(`${pathOut}/${img}`));
      });
  }
};

module.exports = {
  unzip,
  readDir,
  grayScale,
  sepia,
  slumber,
};
