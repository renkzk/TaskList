import List from "./List";
import Task from "./Task";
import TaskList from "./TaskList";

export default class Storage {
    static saveTaskList(data) {
        localStorage.setItem('taskList', JSON.stringify(data))
    }

    static getTaskList() {
        let taskList = Object.assign(
            new TaskList(),
            JSON.parse(localStorage.getItem('taskList'))
        )

        taskList.setLists(taskList.getLists()
        .map((list) => Object.assign(new List(), list)))

        return taskList
    }

    static addList(list) {
        let taskList = Storage.getTaskList()
        taskList.addList(list)
        Storage.saveTaskList(taskList)
    }

    static deleteList(listName) {
        let taskList = Storage.getTaskList()
        taskList.deleteList(listName)
        Storage.saveTaskList(taskList)
    }

    static renameList(oldListName, newListName) {
        let taskList = Storage.getTaskList()
        taskList.getList(oldListName).setName(newListName)
        Storage.saveTaskList(taskList)
    }
}
