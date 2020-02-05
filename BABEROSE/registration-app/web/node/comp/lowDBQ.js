const {forEach, pipe} = require('callbag-basics')
const Queue = require('better-queue')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class DBQ {
    constructor(process, {option}, dbPath) {
        const adapter = new FileSync(dbPath)
        const db = low(adapter)
        this.q = new Queue(process,{option});
        this.db = db
        this.db.defaults({ q: [] }).write()
        this.fromDB2Q()
        setInterval(() => this.fromDB2Q(),5 * 60 * 1000)
    }
    fromDB2Q = () => {
        let items = this.db.get('q').value()
        items.forEach(item => {
            console.log(item)
            this.q.push({
                rf_id: item.rf_id,
                file_name: item.file_name,
                file_path: item.file_path,
                festival: item.festival,
                experience: item.experience
            })
            console.log(`retrieved csv ${item}, added to q`)
        })
    }
    startQ = () => (start, sink) =>{
        if(start !== 0) return
        sink(0, t => {
            if (t === 2){
                console.log('disposed')
                sink(2,this.q)
            }
        })
        sink(1,this.q)
    }
    add = (input, cb) => this.q.push(input, cb)
    addEvent = (name,fac) => source => (start, sink) =>{
        if(start  !== 0) return
        source(0,(t,d)=>{
            if(t===1){
                let q = d
                q.on(name,fac)
                sink(1,q)
            }else {
                sink(t,d)
            }
        })
    }

    onTaskDone = function (taskId, input, stats){
        let self = this
        // if (DELETE_AFTER_UPLOAD) fs.unlink(input.file_path, (err) => {})
        let item_in_q = self.db.get('q').find({file_name: input.file_name}).value()
        if (item_in_q !== undefined) {
            self.db.get('q').remove({file_name: input.file_name}).write()
        }
        console.log("task completed!")
    }
    onError = function (taskId, input, stats){
        let self = this
        let check = self.db.get('q').filter({file_name: input.file_name}).value()
        if (check.length === 0) {
            self.db.get('q')
                .push({
                    rf_id: input.rf_id,
                    file_name: input.file_name,
                    file_path: input.file_path,
                    festival: input.festival,
                    experience: input.experience
                })
                .write()
        }
        console.log(`error, adding back to q -> ${input}`)
    }

    run = function () {
        let self = this
        let stream = pipe(
            self.startQ(),
            self.addEvent('task_finish',self.onTaskDone.bind(self)),
            self.addEvent('task_failed',self.onError.bind(self)),
        )
        forEach(d =>{})(stream)
    }
}
module.exports = {DBQ}