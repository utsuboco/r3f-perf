function estimateBytesUsed(geometry) {
  let mem = 0;
  for (let name in geometry.attributes) {
    const attr = geometry.getAttribute(name);
    mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;
  }
  const indices = geometry.getIndex();
  mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
  return mem;
}
export {
  estimateBytesUsed
};
//# sourceMappingURL=estimateBytesUsed.mjs.map
