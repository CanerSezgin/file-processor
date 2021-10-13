# Getting Started

-   Clone Repo |  `git clone https://github.com/CanerSezgin/file-processor.git`
-   Install dependencies | npm install
-   Run In Development Mode |  `npm run dev`
-   Build `npm run build`
-   Run Server |  `npm start`

   This Project is using **Redis**, make sure you are running Redis Server before starting project.
   Redis can be easily replaced (thanks to extendable design patterns) with any other storage/db
   See: `src/services/index.ts`
   No Auth implemented, you can just run redis cluster as default.
   If you want to use docker, you can go with 
   `docker run --rm -d -p 6379:6379 -e ALLOW_EMPTY_PASSWORD=yes bitnami/redis:latest` 
   No data persistence for this container.

# Abstract 
This kind of large file processors generally developed by using `Map Reduce Programming` approach and software utilities such as [Hadoop](https://hadoop.apache.org/) is one of the best player in this area. Thanks to **Distributed Computation**` (split file into chunk --> send them into different processor services --> process --> merge)` any file can be processed scalable and quickly.
Within the scope of this task, I haven't gone with platforms like Hadoop, and wanted to create everything from scratch to show more and chose Node.js (typescript). 
As long as, time requirement is not super critical (couple of mins latency) and you have single consumer, this approach (single node server with queue system) also even can be used in production level.

# Endpoints

**CountWords Process Resource** 
```
POST /api/v1/words/count

payload
{
"resourceType": "uri",
"resourceValue": "https://raw.githubusercontent.com/CanerSezgin/reky/master/README.md"
}

returns: 202 | 422
{
"status": "added_to_queue"
}
```
**resourceType**: `"text" | "fs" | "uri"`
PS: fs reads from files `./data`


**Get Stats of Word**
```
GET /api/v1/words/stats/:word

returns: 200
{
"word": "https",
"counts": 19
}
```

**Queue Dashboard [no auth implemented]**
```
GET /admin/queues/
```

# Assumptions
* It basically reads all file types, I didn't convert them into readable ones or validate. 
I highly suggest that you should test with simple text files `.txt`, `.md` etc.
* Language processing hasn't been applied. Thanks to it, more meaningful words could be detected (like: `in, of, I, me` etc shouldn't be counted.) For the sake of simplicity, the input is sanitized and get the `words` only then count it with hashmap. 

# General Business Logic Of App & More
* `src/services/processors/Processor.ts` Generic resource processors for resources coming from **remote** `URIProcessor`, **filesystem** `FSProcessor`, text `TextProcessor`
* `src/services/processors/CountWordsProcessor.ts` this is one of the most important files of the project. `CountWordsProcessor` is a class which is extended from generic `Processor` class.
`CountWordsProcessor.process` has a pipeline for processing resource. 
Also file includes `CountWordsTransformer` which is responsible for processing file (chunks) and get countedWords object. 

At this point there are 3 options
1. Directly Update Database
--- Downside is that during processing, some errors may occur and processing may be interrupted.
--- This cause inconsistency because processed chunks already updated the db however there are some missing chunks because process is interrupted.

2. Create an object in memory, hold it until whole file is processed (update each chunk is processed) then update db.
--- Downside is that for large files memory limitations can exceed, processing will fail

3. Create a temporary storage (db), write everything into this db, when processing is done, move everything into Main DB. Clean up temp data.
 --- If some error happens during the processing, main db won't be affected. (No need to rollback)
 --- If processing fails at some point, it can be run again from queue system.

* `src/services/queues/processors/countWord.ts` This is the job processor for countWord of queue system. It simply call `countWordProcessor.process` function, then pass data from `tempDB` into `mainDB` if the entire file has been processed successfully. Then clean up the `tempDB`

* `src/services/CountWordsService.ts` CountWordsService has methods just for taking some action with `mainDB` Again, it can be used with any DB, the selection of DB can be changed easily at any point.