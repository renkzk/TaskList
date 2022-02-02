import {
    toDate,
    isToday,
    isThisWeek,
    subDays,
    format,
    addDays,
    isWithinInterval,
    parseIso,
    startOfDay,
} from "date-fns"
import Storage from "./Storage"

export default class List {
    constructor(name) {
        this.name = name
        this.tasks = []
        this.completedTasks = []
    }

    setName(name) {
        this.name = name
    }

    getName() {
        return this.name
    }

    setTasks(tasks) {
        this.tasks = tasks
    }

    getTasks() {
        return this.tasks
    }

    getCompletedTasks() {
        return this.completedTasks
    }

    getTask(taskId) {
        return this.tasks.find((task) => task.id === taskId)
    }

    getCompletedTask(taskId) {
        return this.completedTasks.find((task) => task.id === taskId)
    }

    addTask(newTaskObj) {
        this.tasks.push(newTaskObj)
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter((task) => task.id !== taskId)
    }

    deleteCompletedTask(taskId) {
        this.completedTasks = this.completedTasks.filter(
            (task) => task.id !== taskId
        )
    }

    moveTaskToCompletedArray(taskId) {
        let task = this.getTask(taskId)
        this.completedTasks.push(task)
        this.deleteTask(taskId)
    }

    moveTaskToIncompleteArray(taskId) {
        let task = this.getCompletedTask(taskId)
        this.tasks.push(task)
        this.deleteCompletedTask(taskId)
    }

    getTodayTasks() {
        return this.tasks.filter((task) => {
            let taskDate = new Date(task.getFormattedDate())
            let todayTasks = isToday(taskDate)
            return todayTasks
        })
    }

    getUpcomingTasks() {
        let tomorrow = startOfDay(addDays(new Date(), 1))
        let sevenDaysFromToday = startOfDay(addDays(new Date(), 7))
        return this.tasks.filter((task) => {
            let taskDate = new Date(task.getFormattedDate())
            let upcomingTasks = isWithinInterval(taskDate, {
                start: tomorrow,
                end: sevenDaysFromToday,
            })
            return upcomingTasks
        })
    }
}
