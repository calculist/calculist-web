function getNewGuid(): string {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function(n: any) {
    return (n ^ Math.random() * 16 >> n / 4).toString(16);
  });
}

export default getNewGuid;
