import List from "./List"
import Task from "./Task"
import TaskList from "./TaskList"

export default class Storage {
    static saveTaskList(data) {
        localStorage.setItem("taskList", JSON.stringify(data))
    }

    static saveSelectedList(listId) {
        localStorage.setItem("selectedListId", JSON.stringify(listId))
    }

    static getTaskList() {
        let taskList = Object.assign(
            new TaskList(),
            JSON.parse(localStorage.getItem("taskList"))
        )

        taskList.setLists(
            taskList.getLists().map((list) => Object.assign(new List(), list))
        )

        taskList
            .getLists()
            .forEach((list) =>
                list.setTasks(
                    list
                        .getTasks()
                        .map((task) => Object.assign(new Task(), task))
                )
            )

        return taskList
    }

    static addList(list) {
        let taskList = Storage.getTaskList()
        taskList.addList(list)
        Storage.saveTaskList(taskList)
    }

    static deleteList(list) {
        let taskList = Storage.getTaskList()
        taskList.deleteList(list)
        Storage.saveTaskList(taskList)
    }

    static renameList(oldListName, newListName) {
        let taskList = Storage.getTaskList()
        taskList.getList(oldListName).setName(newListName)
        Storage.saveTaskList(taskList)
    }

    static addTask(listName, newTaskObj) {
        let taskList = Storage.getTaskList()
        taskList.getList(listName).addTask(newTaskObj)
        Storage.saveTaskList(taskList)
    }

    static editTask(
        listName,
        taskId,
        name,
        details,
        dueDate,
        dueTime,
        priority
    ) {
        let taskList = Storage.getTaskList()
        taskList
            .getList(listName)
            .getTask(taskId)
            .edit(name, details, dueDate, dueTime, priority)
        Storage.saveTaskList(taskList)
    }

    static deleteTask(listName, taskId) {
        let taskList = Storage.getTaskList()
        taskList.getList(listName).deleteTask(taskId)
        Storage.saveTaskList(taskList)
    }

    static checkTask(listName, taskId) {
        let taskList = Storage.getTaskList()
        taskList.getList(listName).moveTaskToCompletedArray(taskId)
        Storage.saveTaskList(taskList)
    }

    static uncheckTask(listName, taskId) {
        let taskList = Storage.getTaskList()
        taskList.getList(listName).moveTaskToIncompleteArray(taskId)
        Storage.saveTaskList(taskList)
    }
}
