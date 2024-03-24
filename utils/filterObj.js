const filterObject = (obj, ...allowedFilleds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFilleds.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

module.exports = { filterObject };
