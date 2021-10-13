import { QueueJob } from '../../../types'
import wait from '../../../utils/wait'
import { CountWordsProcessor } from '../../../services/processors/CountWordsProcessor'
import { countWordsService, tempProcessorStorage } from '../../../services'

export default async (job: QueueJob): Promise<any> => {
  const { id, data, opts } = job
  console.log({ id, data, opts })

  const { resourceValue, resourceType } = data

  const countWordProcessor = new CountWordsProcessor(
    resourceValue,
    resourceType,
    tempProcessorStorage
  )

  const { processKey } = await countWordProcessor.process()
  await wait(100) // [This is a hacky solution] adding extra 100 ms just for redis client latency between write and read request.
  const records = await countWordProcessor.getTempRecords(processKey)
  console.log({ processKey, records })

  // Add All Records of ProcessKey Into Main DB
  await Promise.all(
    records.map((record) =>
      countWordsService.upsertCounts(
        record.key.split(`${processKey}_`)[1],
        parseInt(record.value)
      )
    )
  )

  // Clean Temp DB of ProcessKey
  await countWordProcessor.deleteTempRecords(processKey)

  const records2 = await countWordProcessor.getTempRecords(processKey)
  console.log({ processKey, records2 })

  return
}
