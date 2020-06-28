module.exports = collection =>
  collection.sort((a, b) => 
    Number(a.data.displayOrder) > Number(b.data.displayOrder) ? 1 : -1
  );