(async () => {
  var self = global;
  const {
    Profile,
    Transform,
    eIntent,
    convert,
    color,
  } = require("jscolorengine");
  let rgbProfile = new Profile();
  rgbProfile.load("*sRGB");
  let cmykProfile = new Profile();
  await cmykProfile.loadPromise(
    "file:/Users/mingo/Documents/github-demo/node-server/cmyk-adobe-japan-2001-coated.icc"
  );
  let rgb2cmykTransform = new Transform();
  rgb2cmykTransform.create(rgbProfile, cmykProfile, eIntent.perceptual);
  let rgbColor = color.RGB(174, 151, 204); // Example RGB color
  let cmykColor = rgb2cmykTransform.transform(rgbColor);
  console.log(
    `CMYK: ${cmykColor.C}, ${cmykColor.M}, ${cmykColor.Y}, ${cmykColor.K}`
  );
  // Do stuff with RGB
})();
