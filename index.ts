function delay<T>(time: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), time))
}

interface FileProps {
  key: string
  body: string
  size: number
}

async function getFile(key: string): Promise<FileProps> {
  const delayFn = delay(1000, { key, body: '...', size: 123 })
  return delayFn
}

/**
 * @return {Promise<FileProps | string>}
 * @description
 * promise.race는
 * 서비스 헬스체크를 위해 몇초 이내 되는지 안되는지 확인할때 사용할 수 있다.
 * 빠른 응답의 경우 로딩을 띄우는게 화면이 더 지저분 할 수 있기떄문에 확인할 수 있음
 */
async function checkCallTime(): Promise<void> {
  const result: FileProps | string = await Promise.race([getFile('file1.png'), delay(1000, 'timeout')])

  if (result === 'timeout') {
    console.log('네트워크 환경을 확인해주세요')
  } else {
    console.log(result)
  }
}

/**
 * @param {number} limit
 * @param {Array<() => Promise<T>>} fs
 * @return {Promise<T[]>}
 * @description
 * Promise.all은
 * 여러개의 promise를 limit까지 끊어서 실행
 */
async function concurrent<T>(limit: number, fs: Array<() => Promise<T>>): Promise<T[]> {
  const result: T[] = []
  const chunks = Math.ceil(fs.length / limit)

  for (let i = 0; i < chunks; i++) {
    const chunk = fs.slice(i * limit, i * limit + limit)
    result.push(...(await Promise.all(chunk.map((fn) => fn()))))
  }

  return result
}

function* take<T>(length: number, iterable: Iterable<T>) {
  const iterator = iterable[Symbol.iterator]()
  while (length-- > 0) {
    const { value, done } = iterator.next()
    if (done) break
    yield value
  }
}

function* chunk<T>(size: number, iterable: Iterable<T>) {
  const iterator = iterable[Symbol.iterator]()
  while (true) {
    const arr = [
      ...take(size, {
        [Symbol.iterator]() {
          return iterator
        },
      }),
    ]
    if (arr.length) yield arr
    if (arr.length < size) break
  }
}

function* map<A, B>(f: (a: A) => B, iterable: Iterable<A>): IterableIterator<B> {
  for (const a of iterable) {
    yield f(a)
  }
}

async function formAsync<T>(iterable: Iterable<Promise<T>>) {
  const arr: Awaited<T>[] = ([] = [])
  for await (const a of iterable) {
    arr.push(a)
  }
  return arr
}

async function concurrent2<T>(limit: number, fs: (() => Promise<T>)[]) {
  const result = Array.fromAsync(
    map(
      (ps) => Promise.all(ps),
      map((fs) => fs.map((f) => f()), chunk(limit, fs))
    )
  )
  return (await result).flat()
}

class FxIterator<T> {
  constructor(public iterable: Iterable<T>) {}

  chunk(size: number) {
    return new FxIterator(chunk(size, this.iterable))
  }

  map<U>(f: (a: T) => U): FxIterator<U> {
    return new FxIterator(map(f, this.iterable))
  }
}

async function concurrent3<T>(limit: number, fs: (() => Promise<T>)[]) {}

/**
 * @return {Promise<FileProps[]>}
 * @description
 * Promise.all은
 * 여러개의 서비스를 동시에 호출하고 모두 끝난 결과를 받아올때 사용할 수 있다.
 */
async function main() {
  const files = await concurrent2(3, [
    () => getFile('file1.png'),
    () => getFile('file2.png'),
    () => getFile('file3.png'),
    () => getFile('file4.png'),
    () => getFile('file5.png'),
    () => getFile('file6.png'),
    () => getFile('file7.png'),
    () => getFile('file8.png'),
  ])
  console.time()
  console.log(files)
  console.timeEnd()
}

main()
