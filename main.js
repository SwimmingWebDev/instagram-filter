const path = require("path");

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathSepia = path.join(__dirname, "sepia");
const pathSlumber = path.join(__dirname, "slumber");

async function main() {
  try {
    await IOhandler.unzip(zipFilePath, pathUnzipped);
    // const imgs = await IOhandler.readDir(pathUnzipped);
    await IOhandler.grayScale(pathUnzipped, pathProcessed);
    await IOhandler.sepia(pathUnzipped, pathSepia);
    await IOhandler.slumber(pathUnzipped, pathSlumber);
  } catch (error) {
    console.log(error);
  }
}

main();
