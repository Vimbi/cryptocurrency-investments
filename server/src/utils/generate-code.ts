export const generateCode = (length: number) => {
  const number = Math.floor(Math.random() * 1000000);
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }

  return str;
};
