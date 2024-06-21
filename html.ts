function tag(strings, ...values) {
  console.log('arr', strings)
  console.log(values)
}

function main() {
  const a = 'a'
  const b = 'b'
  const c = 'c'
  const result = tag`1 ${a} 2 ${b} 3 ${c}`

  console.log('result', result)
}

main()
