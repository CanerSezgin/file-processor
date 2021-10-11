import numeral from 'numeral'

export default () => {
  const { rss, heapTotal } = process.memoryUsage()
  const format = (value: number) => numeral(value).format('0.0 ib')
  const log = () =>
    console.log('rss', format(rss), heapTotal, format(heapTotal))
  return { rss, heapTotal, log, format }
}
