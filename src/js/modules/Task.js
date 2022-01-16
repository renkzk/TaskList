export default class Task {
    constructor(name, details, dueDate, dueTime, priority) {
        this.name = name
        this.details = details
        this.dueDate = dueDate
        this.dueTime = dueTime
        this.priority = priority
    }

    setName(name) {
        this.name = name
    }

    getName() {
        return this.name
    }

    setDate(dueDate) {
        this.dueDate = dueDate
    }

    getDate() {
        return this.dueDate
    }

    getDateFormatted() {
        let day = this.dueDate.split('/')[0]
        let month = this.dueDate.split('/')[1]
        let year = this.dueDate.split('/')[2]
        return `${month}/${day}/${year}`
    }
}