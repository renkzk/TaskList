export default class Task {
    constructor(name, details, dueDate, dueTime, priority) {
        this.id = Date.now().toString()
        this.name = name
        this.details = details
        this.dueDate = dueDate
        this.dueTime = dueTime
        this.priority = priority
    }

    edit(name, details, dueDate, dueTime, priority) {
        this.name = name
        this.details = details
        this.dueDate = dueDate
        this.dueTime = dueTime
        this.priority = priority
    }

    // getFormattedDate() {
    //     let formattedDate = this.dueDate.replace(/\s/g, "/")
    //     return formattedDate
    // }

    getFormattedDate() {
        let dmy = this.dueDate.split("/")
        let ymd = dmy.reverse()
        return ymd.toString()
    }
}
