export function chunk(input: string, size: number): string[] {
  const ret: Array<string> = Array.from({
    length: Math.ceil(input.length / size),
  });
  let readIndex = 0;
  let writeIndex = 0;

  while (readIndex < input.length) {
    ret[writeIndex] = input.slice(readIndex, readIndex + size);

    writeIndex += 1;
    readIndex += size;
  }

  return ret;
}
