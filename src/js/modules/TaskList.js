import { compareAsc, toDate } from 'date-fns'
import List from './List'
import Task from './Task'

export default class TaskList {
    constructor() {
        this.lists = []
        this.lists.push(new List('Inbox'))
        this.lists.push(new List('Today'))
        this.lists.push(new List('Upcoming'))
        this.lists.push(new List('Grocery List'))
        this.lists.push(new List('Gym'))
        this.lists.push(new List('Personal'))
    }

    setLists(lists) {
        this.lists = lists
    }

    getLists() {
        return this.lists
    }

    getList(listName) {
        return this.lists.find((list) => list.getName() === listName)
    }

    contains(listName) {
        return this.lists.some((list) => list.getName() === listName)
    }

    addList(newList) {
        if (this.lists.find((list) => list.name === newList.name)) return;
        this.lists.push(newList)
    }

    deleteList(listName) {
        let listToDelete = this.lists.find((list) => list.getName() === listName)
        this.lists.splice(this.lists.indexOf(listToDelete), 1)
    }
}
