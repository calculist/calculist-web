function removeHTML(string: string): string {
  return ('' + string).replace(/<(?:.|\n)*?>/gm, '');
}

export default removeHTML;
