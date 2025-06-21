const getImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};
const resolveImageUrl = (req, image) => {
  return image?.startsWith("http") ? image : getImageUrl(req, image);
};
module.exports = getImageUrl, resolveImageUrl;
