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

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  await fs.promises.mkdir(pathOut, { recursive: true });

  for await (const entry of zip) {
    if (entry.filename.endsWith("/")) {
      await fs.promises.mkdir(`${pathOut}/${entry.filename}`, {
        recursive: true,
      });
    } else {
      const readStream = await entry.openReadStream();
      const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
      await pipeline(readStream, writeStream);
    }
  }

  await zip
    .close()
    .then(console.log("Extraction operation complete"))
    .catch((err) => console.log(err));
};

/**
 * Description: read all the png files from given directory
 * and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
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

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = async (filePath, pathProcessed) => {
  await fs.promises.mkdir(pathProcessed, { recursive: true });
  const data = await readDir(filePath);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${filePath}/${img}`)
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
        this.pack().pipe(fs.createWriteStream(`${pathProcessed}/${img}`));
      });
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathSepia
 * @return {promise}
 */

const sepia = async (filePath, pathSepia) => {
  await fs.promises.mkdir(pathSepia, { recursive: true });
  const data = await readDir(filePath);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${filePath}/${img}`)
      .pipe(
        new PNG({
          filterType: 4, // Transform stream
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

            this.data[idx] = Math.min(255, luminance + 40); //R
            this.data[idx + 1] = Math.min(255, luminance + 20); //G
            this.data[idx + 2] = Math.min(255, luminance); //B
          }
        }
        this.pack().pipe(fs.createWriteStream(`${pathSepia}/${img}`));
      });
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathSlumber
 * @return {promise}
 */

const slumber = async (filePath, pathSlumber) => {
  await fs.promises.mkdir(pathSlumber, { recursive: true });
  const data = await readDir(filePath);
  let pngImgs = Object.values(data);
  for (const img of pngImgs) {
    fs.createReadStream(`${filePath}/${img}`)
      .pipe(
        new PNG({
          filterType: 4, // Transform stream
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

            this.data[idx] = Math.min(255, luminance + adjustRed); //R
            this.data[idx + 1] = Math.min(255, luminance + adjustGreen); //G
            this.data[idx + 2] = Math.min(255, luminance + adjustBlue); //B
          }
        }
        this.pack().pipe(fs.createWriteStream(`${pathSlumber}/${img}`));
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
