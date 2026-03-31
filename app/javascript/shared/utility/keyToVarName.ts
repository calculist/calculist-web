function keyToVarName(key: string): string {
  return key.replace(/\s/g, '_');
}

export default keyToVarName;
