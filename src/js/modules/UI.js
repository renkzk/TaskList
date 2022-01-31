import Storage from "./Storage"
import List from "./List"
import Task from "./Task"
import { format } from "date-fns"
import flatpickr from "flatpickr"
import TaskList from "./TaskList"

export default class UI {
    static loadHomepage() {
        UI.loadLists()
        UI.openList(UI.getActiveList())
        UI.initUserInputs()
    }

    static loadLists() {
        let userListsContainer = document.querySelector("#user-lists-container") //clears the lists container so that it doesnt render multiple times the same lists
        userListsContainer.innerHTML = ""
        Storage.getTaskList()
            .getLists()
            .forEach((list) => {
                if (
                    list.name !== "Inbox" &&
                    list.name !== "Today" &&
                    list.name !== "Upcoming"
                ) {
                    UI.createListElement(list.name)
                }
            })
    }

    // LIST MANAGING
    //Creating a new list
    static addList() {
        let newListInput = document.querySelector("#new-list-input")
        let newListName = newListInput.value
        newListInput.value = "" //clear input field

        if (newListName == "") {
            alert(`List name cannot be empty`)
            return
        }

        if (newListName.length < 3) {
            alert(`The list name must be longer than 2 characters.`)
            return
        }

        if (Storage.getTaskList().contains(newListName)) {
            alert(`This list already exists`)
            return
        }

        Storage.addList(new List(newListName))
        UI.createListElement(newListName)
    }

    static createListElement(newListName) {
        let userListsContainer = document.querySelector("#user-lists-container")
        let newListElement = document.createElement("div")
        newListElement.classList.add("list", "user-list")
        newListElement.id = newListName
        newListElement.innerHTML = `
        <span class="list-name">${newListName}</span>
        <btn class="list-options">
            <i class="fas fa-ellipsis-h options-icon"></i>
            <div class="list-options-modal modal">
                <btn class="list-edit">Edit</btn>
                <btn class="list-delete"> Delete</btn>
            </div>
        </btn>
        `

        if (newListName == UI.getActiveList()) {
            newListElement.classList.add("selected")
        }

        userListsContainer.append(newListElement)
    }

    static openList(listName) {
        let lists = document.querySelectorAll(".list")
        lists.forEach((list) => list.classList.remove("selected"))
        let listElement = document.getElementById(`${listName}`)
        listElement.classList.add("selected")

        Storage.saveSelectedList(JSON.stringify(listName))
        UI.renderMainSection(listName)
    }

    static getActiveList() {
        let selectedList =
            JSON.parse(localStorage.getItem("selectedListId")) || "Inbox"
        let unquotedSelectedList = selectedList.replace(/["]+/g, "")
        return unquotedSelectedList
    }

    static renderMainSection(listName) {
        let tasks = Storage.getTaskList().getList(listName).getTasks()
        let remainingTasks = tasks.length
        let listDisplay = document.querySelector("#list-display")
        listDisplay.innerHTML = `
            <div id="list-header">
                <h2 id="list-name-header">${listName}</h2>
                <span id="task-counter">${
                    remainingTasks == 1
                        ? "1 task remaining"
                        : remainingTasks + " tasks remaining"
                }</span>
            </div>
            <div id="list-body">
                <div id="tasks-container"></div>
                <button id="open-new-task-form">
                    <i class="fas fa-plus"></i>
                    Add a task
                </button>
            </div>
        `
        let mainHeader = document.querySelector("#list-name-header")
        if (
            listName != "Inbox" &&
            listName != "Today" &&
            listName != "Upcoming"
        ) {
            mainHeader.classList.add("user-list-header")
        } else mainHeader.classList.remove("user-list-header")

        UI.loadTasks()
    }

    //List Options
    static getTargetedListElement() {
        let selectedList = event.target.closest(".list")
        return selectedList
    }

    static deleteList() {
        let selectedList = UI.getTargetedListElement()
        Storage.deleteList(selectedList.id)
        UI.loadLists()
    }

    static openListEdit() {
        let selectedList = UI.getTargetedListElement()
        let selectedListName = selectedList.id
        let editListForm = document.createElement("form")
        editListForm.innerHTML = `
        <input type='text' value='${selectedListName}' id="edit-list-input" autocomplete="off" maxlength="30"/>
        <button type='submit' id="edit-list-confirm"><i class="fas fa-check"></i></button>
        `
        editListForm.id = "edit-list-form"

        selectedList.replaceWith(editListForm)
        let editListInput = document.getElementById("edit-list-input")
        editListInput.focus()
        editListInput.value = ""
        editListInput.value = selectedListName

        let confirmButton = document.querySelector("#edit-list-confirm")
        confirmButton.addEventListener("click", (e) => confirmEdit())

        document.addEventListener(
            "click",
            (e) => {
                if (
                    e.target != editListForm ||
                    e.target != editListForm.children
                )
                    UI.loadLists()
            },
            { once: true }
        )

        function confirmEdit() {
            let newListName = editListInput.value

            if (newListName == "") {
                UI.closeListEdit()
                alert(`The list name can't be empty.`)
                return
            }

            if (newListName.length < 3) {
                UI.closeListEdit()
                alert(`The list name must be longer than 2 characters.`)
                return
            }

            if (Storage.getTaskList().contains(newListName)) {
                UI.closeListEdit()
                alert(`This list already exists`)
                return
            }

            Storage.renameList(selectedListName, newListName)
            UI.closeListEdit()
        }
    }

    static closeListEdit() {
        UI.loadLists()
    }

    static openListHeaderEdit(e) {
        let headerElement = e.target
        let selectedListName = headerElement.textContent
        let editListForm = document.createElement("form")
        editListForm.innerHTML = `
        <input type='text' value='${selectedListName}' id="edit-list-header-input" autocomplete="off" maxlength="30"/>
        <button type='submit' id="edit-list-header-confirm"><i class="fas fa-check"></i></button>
        `
        editListForm.id = "edit-list-header-form"
        headerElement.replaceWith(editListForm)

        let editListInput = document.getElementById("edit-list-header-input")
        editListInput.focus()
        editListInput.value = ""
        editListInput.value = selectedListName
        editListInput.style.width = editListInput.value.length + "ch"

        let confirmButton = document.querySelector("#edit-list-header-confirm")
        confirmButton.addEventListener("click", (e) => confirmEdit())

        document.addEventListener(
            "click",
            (e) => {
                if (
                    e.target != editListForm ||
                    e.target != editListForm.children
                )
                    editListForm.replaceWith(headerElement)
            },
            { once: true }
        )

        function confirmEdit() {
            let newListName = editListInput.value

            if (newListName == "") {
                UI.openList(UI.getActiveList())
                alert(`The list name can't be empty.`)
                return
            }

            if (newListName.length < 3) {
                UI.openList(UI.getActiveList())
                alert(`The list name must be longer than 2 characters.`)
                return
            }

            if (Storage.getTaskList().contains(newListName)) {
                UI.openList(UI.getActiveList())
                alert(`This list already exists`)
                return
            }

            Storage.renameList(selectedListName, newListName)
            UI.loadLists()
            UI.openList(newListName)
        }
    }

    //TASKS MANAGING
    static addTask() {
        let name = document.querySelector("#new-task-name").value
        let details = document.querySelector("#new-task-details").value
        let dueDate = document.querySelector("#selected-date").textContent
        let dueTime = document.querySelector("#selected-time").textContent
        let priority =
            document.querySelector("#new-task-priority").dataset.taskPriority
        let selectedList = document.querySelector(
            "#selected-new-task-list"
        ).textContent

        if (name == "") {
            alert("Task name cannot be empty.")
            return
        }
        if (name.length < 1) {
            alert("Task name must be longer than 1 character")
            return
        }

        if (dueDate == "Schedule") {
            dueDate = ""
        }

        Storage.addTask(
            selectedList,
            new Task(name, details, dueDate, dueTime, priority)
        )
        UI.openList(UI.getActiveList())
    }

    static createTaskElement(id, name, dueDate, dueTime, priority, complete) {
        let tasksContainer = document.querySelector("#tasks-container")
        tasksContainer.innerHTML += `
        <div class="task" data-id='${id}'>
            <div class="custom-cb task-desc">
                <input type="checkbox" id="${id}" class="checkbox">
                <label for="${id}" data-task-priority='${priority}'></label>
                <div class='task-info'>
                    <span class="task-name">${name}</span>
                    <span class="task-due-date">${dueDate} ${dueTime}</span>
                </div>
            </div>
            <btn class="task-options">
                <i class="fas fa-ellipsis-h options-icon"></i>
                <div class="task-options-modal modal">
                    <btn class="task-edit">Edit</btn>
                    <btn class="task-delete"> Delete</btn>
                </div>
            </btn>
        </div>
        `
    }

    static loadTasks() {
        let tasks = Storage.getTaskList().getList(UI.getActiveList()).getTasks()
        tasks.sort((a, b) => a.id - b.id)
        tasks.forEach((task) =>
            UI.createTaskElement(
                task.id,
                task.name,
                task.dueDate,
                task.dueTime,
                task.priority
            )
        )
    }

    static deleteTask(taskId) {
        let listName = UI.getActiveList()
        Storage.deleteTask(listName, taskId)
        UI.openList(UI.getActiveList())
    }

    static checkTask(taskId) {
        let listName = UI.getActiveList()
        let task = Storage.getTaskList().getList(listName).getTask(taskId)
        Storage.checkTask(listName, taskId)
        setTimeout(() => {
            UI.renderMainSection(UI.getActiveList())
            createCompletedTaskPopup()
        }, 200)

        function createCompletedTaskPopup() {
            let mainSection = document.querySelector("main")
            let popup = document.createElement("div")
            popup.id = "completed-task-container"
            popup.innerHTML = `
                "${task.name}" has been marked as completed.
                <btn id="undo-task-check">Undo</btn>
            `
            if (document.querySelector("#completed-task-container"))
                document.querySelector("#completed-task-container").remove()
            mainSection.append(popup)

            let undoBtn = document.querySelector("#undo-task-check")
            undoBtn.addEventListener("click", (e) =>
                uncheckTask(listName, taskId)
            )

            function uncheckTask(listName, taskId) {
                Storage.uncheckTask(listName, taskId)
                UI.renderMainSection(UI.getActiveList())
                popup.remove()
            }

            setTimeout(() => {
                popup.remove()
            }, 3000)
        }
    }

    static saveTaskEdit(taskId) {
        let name = document.querySelector("#new-task-name").value
        let details = document.querySelector("#new-task-details").value
        let dueDate = document.querySelector("#selected-date").textContent
        let dueTime = document.querySelector("#selected-time").textContent
        let priority =
            document.querySelector("#new-task-priority").dataset.taskPriority
        let selectedList = document.querySelector(
            "#selected-new-task-list"
        ).textContent

        if (name == "") {
            alert("Task name cannot be empty.")
            return
        }
        if (name.length < 1) {
            alert("Task name must be longer than 1 character")
            return
        }
        if (dueDate == "Schedule") {
            dueDate = ""
        }
        Storage.editTask(
            selectedList,
            taskId,
            name,
            details,
            dueDate,
            dueTime,
            priority
        )
        UI.openList(UI.getActiveList())
    }

    // INPUT FUNCTIONS AND EVENT LISTENERS
    static initUserInputs() {
        function addGlobalEventListener(type, target, callback) {
            document.addEventListener(type, (e) => {
                if (e.target.matches(target)) callback(e)
            })
        }

        addGlobalEventListener("click", "#open-new-task-modal", (e) => {
            UI.openList(UI.getActiveList())
            createNewTaskModal()
            addOverlay(e)
        })

        addGlobalEventListener("click", ".task-modal-overlay", (e) => {
            removeTaskModal()
        })

        function createNewTaskModal() {
            let mainSection = document.querySelector("main")
            let modalForm = document.createElement("form")
            modalForm.id = "new-task-modal"
            modalForm.innerHTML = `
            <input type="text" placeholder="Task" id="new-task-name" class="text-input">
            <textarea placeholder="Details" name="" id="new-task-details" class="text-input"></textarea>
            <div class="set-inputs">
                <div id="set-list-container" class='set-input-container'>
                    <btn id="new-task-list" class="set-input">
                        <i class="fas fa-folder-open"></i>
                        <span id='selected-new-task-list'>${UI.getActiveList()}</span>
                    </btn>
                    <div id="set-list-modal" class="modal">
                        <div id='saved-lists-container'></div>
                    </div>
                </div>
                
                <div id="set-date-container" class='set-input-container'>
                    <btn id="new-task-date" class="set-input">
                        <i class="far fa-calendar-alt date-icon"></i>
                        <span id="selected-date">Schedule</span>
                        <span id="selected-time"></span>
                        <div id="remove-selected-date-btn" class="hidden">&#10005;</div>
                    </btn>
                    <div id="set-date-modal" class="modal">
                        <div id="flatpickr-date"></div>
                        <div class="set-time-btn-wrapper">
                            <btn id="set-time-btn" class="disabled">
                                Set Time
                            </btn>
                        </div>
                        
                        <div id="flatpickr-time" class=".flatpickr"></div>
                    </div>
                </div>

                <div id="set-priority-container" class='set-input-container'>
                    <btn id="new-task-priority" class="set-input" data-task-priority="low">Priority</btn>
                    <div id="set-priority-modal" class="modal">
                        <span class="set-priority low-priority selected"><i class="fas fa-flag low-priority-flag"></i>Low</span>
                        <span class="set-priority medium-priority"><i class="fas fa-flag medium-priority-flag"></i>Medium</span>
                        <span class="set-priority high-priority"><i class="fas fa-flag high-priority-flag"></i>High</span>
                    </div>
                </div>
            </div>
            <div class="task-modal-bottom-btns">
                <btn id="add-new-task">Add task</btn>
                <btn id="close-new-task-modal">Cancel</btn>
            </div>
        `
            mainSection.append(modalForm)
            initFlatpickr()

            let closeBtn = document.querySelector("#close-new-task-modal")
            closeBtn.addEventListener("click", (e) => removeTaskModal())
        }

        function removeTaskModal() {
            if (document.querySelector("#new-task-modal"))
                document.querySelector("#new-task-modal").remove()
            if (document.querySelector("#task-display"))
                document.querySelector("#task-display").remove()
            if (document.querySelector(".task-modal-overlay"))
                document.querySelector(".task-modal-overlay").remove()
        }

        //LISTS
        addGlobalEventListener("click", ".list", (e) =>
            UI.openList(e.target.id)
        )

        addGlobalEventListener("click", "#add-list-btn", (e) => UI.addList())

        addGlobalEventListener("click", ".list-options", (e) => {
            e.target.parentElement.classList.toggle("active")
            addOverlay(e)
        })

        addGlobalEventListener("click", ".list-edit", (e) => {
            UI.openListEdit()
        })

        addGlobalEventListener("click", ".user-list-header", (e) => {
            UI.openListHeaderEdit(e)
        })

        addGlobalEventListener("click", ".list-delete", (e) => {
            UI.deleteList()
        })

        addGlobalEventListener("click", "#user-lists-title", (e) =>
            e.target.classList.toggle("open")
        )

        //OVERLAY
        function addOverlay(e) {
            let overlay = document.createElement("div")
            if (
                e.target.matches("#open-new-task-modal") ||
                e.target.matches(".task")
            ) {
                overlay.classList.add("task-modal-overlay")
            } else overlay.classList.add("overlay")
            e.target.append(overlay)
            overlay.addEventListener("click", (e) => {
                closeActiveModals()
                overlay.remove()
            })
        }

        function removeOverlay() {
            if (document.querySelector(".overlay")) {
                document.querySelector(".overlay").remove()
            }
            if (document.querySelector(".task-modal-overlay")) {
                document.querySelector(".task-modal-overlay").remove()
            }
        }

        //MODALS
        function closeActiveModals() {
            let activeModals = document.querySelectorAll(".active")
            activeModals.forEach((modal) => modal.classList.remove("active"))
            if (document.querySelector(".overlay")) {
                document.querySelector(".overlay").remove()
            }
        }

        //MAIN ADD TASK FORM
        addGlobalEventListener("click", "#open-new-task-form", (e) => {
            createNewTaskForm()
        })
        addGlobalEventListener("click", "#close-new-task-form", (e) => {
            UI.openList(UI.getActiveList())
        })

        function createNewTaskForm() {
            let openFormBtn = document.querySelector("#open-new-task-form")
            openFormBtn.style.display = "none"
            let newTaskForm = document.createElement("form")
            newTaskForm.id = "new-task-form"
            let activeList = UI.getActiveList()
            if (activeList == "Today" || activeList == "Upcoming") {
                activeList = "Inbox"
            }
            newTaskForm.innerHTML = `
                    <input type="text" placeholder="Task" id="new-task-name" class="text-input">
                    <textarea placeholder="Details" name="" id="new-task-details" class="text-input"></textarea>
                    <div class="set-inputs">
                        <div id="set-list-container" class='set-input-container'>
                            <btn id="new-task-list" class="set-input">
                                <i class="fas fa-folder-open"></i>
                                <span id='selected-new-task-list'>${activeList}</span>
                            </btn>
                            <div id="set-list-modal" class="modal">
                                <div id='saved-lists-container'></div>
                            </div>
                        </div>
                        
                        <div id="set-date-container" class='set-input-container'>
                            <btn id="new-task-date" class="set-input">
                                <i class="far fa-calendar-alt date-icon"></i>
                                <span id="selected-date">Schedule</span>
                                <span id="selected-time"></span>
                                <div id="remove-selected-date-btn" class="hidden">&#10005;</div>
                            </btn>
                            <div id="set-date-modal" class="modal">
                                <div id="flatpickr-date"></div>
                                <div class="set-time-btn-wrapper">
                                    <btn id="set-time-btn" class="disabled">
                                        Set Time
                                    </btn>
                                </div>
                                
                                <div id="flatpickr-time" class=".flatpickr"></div>
                            </div>
                        </div>

                        <div id="set-priority-container" class='set-input-container'>
                            <btn id="new-task-priority" class="set-input" data-task-priority="low">Priority</btn>
                            <div id="set-priority-modal" class="modal">
                                <span class="set-priority low-priority selected"><i class="fas fa-flag low-priority-flag"></i>Low</span>
                                <span class="set-priority medium-priority"><i class="fas fa-flag medium-priority-flag"></i>Medium</span>
                                <span class="set-priority high-priority"><i class="fas fa-flag high-priority-flag"></i>High</span>
                            </div>
                        </div>
                    </div>
                    <div class="add-cancel-btns">
                        <btn id="add-new-task">Add task</btn>
                        <btn id="close-new-task-form">Cancel</btn>
                    </div>
            `
            openFormBtn.parentNode.insertBefore(
                newTaskForm,
                openFormBtn.nextSibling
            )
            initFlatpickr()
        }

        addGlobalEventListener("click", "#add-new-task", (e) => {
            UI.addTask()
            UI.openList(UI.getActiveList())
            if (document.querySelector("#new-task-modal")) removeTaskModal()
            else createNewTaskForm()
        })

        addGlobalEventListener("click", ".set-input", (e) => {
            closeActiveModals()
            e.target.classList.toggle("active")
            addOverlay(e)
            if (e.target == document.getElementById("new-task-list"))
                createSetListDropdown()
        })

        function createSetListDropdown() {
            let listsContainer = document.querySelector(
                "#saved-lists-container"
            )
            listsContainer.innerHTML = ""
            Storage.getTaskList()
                .getLists()
                .forEach((list) => {
                    if (list.name !== "Today" && list.name !== "Upcoming") {
                        let listCopy = document.createElement("span")
                        listCopy.classList.add("new-task-list")
                        listCopy.textContent = list.name
                        if (
                            listCopy.textContent ==
                            document.querySelector("#selected-new-task-list")
                                .textContent
                        ) {
                            listCopy.classList.add("selected")
                        }
                        listsContainer.append(listCopy)
                    }
                })
        }

        addGlobalEventListener("click", ".new-task-list", (e) => {
            let setListBtn = document.querySelector("#selected-new-task-list")
            setListBtn.textContent = e.target.textContent
            closeActiveModals()
            createSetListDropdown()
        })

        //NEW TASK CREATION
        //NEW TASK DATE AND TIME SELECTOR
        function initFlatpickr() {
            let selectedDate = document.querySelector("#selected-date")
            let setTimeBtn = document.querySelector("#set-time-btn")
            let selectedTime = document.querySelector("#selected-time")
            let removeSelectedDateBtn = document.querySelector(
                "#remove-selected-date-btn"
            )
            flatpickr("#flatpickr-date", {
                inline: true,
                dateFormat: "d M Y",
                minDate: "today",
                enableTime: false,
                onChange: function (dateObject, dateString) {
                    selectedDate.innerHTML = dateString
                    setTimeBtn.classList.remove("disabled")
                    removeSelectedDateBtn.classList.remove("hidden")
                },
            })

            addGlobalEventListener("click", "#set-time-btn", (e) => {
                if (setTimeBtn.innerText == "Set Time") {
                    setTimeBtn.textContent = "Remove Time"
                    setTimeBtn.classList.add("remove")
                    let time = flatpickr("#flatpickr-time", {
                        inline: true,
                        noCalendar: true,
                        enableTime: true,
                        time_24hr: true,
                        defaultHour: "12",
                        onChange: function (timeObject, timeString) {
                            selectedTime.textContent = `(${timeString})`
                        },
                    })
                    selectedTime.textContent = "(12:00)"
                } else resetSetTimeBtn()
            })

            function resetSetTimeBtn() {
                setTimeBtn.textContent = "Set Time"
                setTimeBtn.classList.remove("remove")
                let time = flatpickr("#flatpickr-time", {
                    inline: false,
                    noCalendar: true,
                    enableTime: true,
                    time_24hr: true,
                    defaultHour: "12",
                    onChange: function (timeObject, timeString) {
                        selectedTime.textContent = `(${timeString})`
                    },
                })
                time.clear()
                selectedTime.textContent = ""
            }

            addGlobalEventListener("click", "#remove-selected-date-btn", (e) =>
                resetDate()
            )
            function resetDate() {
                event.preventDefault()
                closeActiveModals()
                resetSetTimeBtn()
                selectedDate.innerHTML = "Schedule"
                selectedTime.innerHTML = ""
                setTimeBtn.classList.add("disabled")
                removeSelectedDateBtn.classList.add("hidden")
                let selectedDay = document.querySelector(
                    ".flatpickr-day.selected"
                )
                if (selectedDay == null) return
                else {
                    selectedDay.classList.toggle("selected")
                }
            }
        }

        //NEW TASK PRIORITY SELECTOR
        addGlobalEventListener("click", ".set-priority", (e) =>
            setTaskPriority(e)
        )

        function setTaskPriority(e) {
            let selectedPriority = e.target.textContent.toLowerCase()
            let taskPriority = document.querySelector("#new-task-priority")
            taskPriority.dataset.taskPriority = selectedPriority

            let priorityOptions = document.querySelectorAll(".set-priority")
            priorityOptions.forEach((option) => {
                option.classList.remove("selected")
                if (option.textContent.toLowerCase() == selectedPriority) {
                    option.classList.add("selected")
                }
            })
            closeActiveModals()
        }

        //TASK
        addGlobalEventListener("click", ".task", (e) => {
            openTask(e.target.dataset.id)
            addOverlay(e)
        })

        addGlobalEventListener("click", ".task-edit", (e) => {
            closeActiveModals()
            openTask(e.target.closest(".task").dataset.id)
            addOverlay(e)
        })

        function openTask(taskId) {
            let list = UI.getActiveList()
            let task = Storage.getTaskList().getList(list).getTask(taskId)
            let taskDisplay = document.createElement("div")
            taskDisplay.id = "task-display"
            taskDisplay.innerHTML = `
            <input type="text" placeholder="Task" id="new-task-name" class="text-input" value='${
                task.name
            }'>
            <textarea placeholder="Details" name="" id="new-task-details" class="text-input" spellcheck="false">${
                task.details
            }</textarea>
            <div class="set-inputs">
                <div id="set-list-container" class='set-input-container'>
                    <btn id="new-task-list" class="set-input">
                        <i class="fas fa-folder-open"></i>
                        <span id='selected-new-task-list'>${list}</span>
                    </btn>
                    <div id="set-list-modal" class="modal">
                        <div id='saved-lists-container'></div>
                    </div>
                </div>
                
                <div id="set-date-container" class='set-input-container'>
                    <btn id="new-task-date" class="set-input">
                        <i class="far fa-calendar-alt date-icon"></i>
                        <span id="selected-date">${
                            task.dueDate ? task.dueDate : "Schedule"
                        }</span>
                        <span id="selected-time">${task.dueTime}</span>
                        <div id="remove-selected-date-btn" class="hidden">&#10005;</div>
                    </btn>
                    <div id="set-date-modal" class="modal">
                        <div id="flatpickr-date"></div>
                        <div class="set-time-btn-wrapper">
                            <btn id="set-time-btn" class="disabled">
                                Set Time
                            </btn>
                        </div>
                        
                        <div id="flatpickr-time" class=".flatpickr"></div>
                    </div>
                </div>

                <div id="set-priority-container" class='set-input-container'>
                    <btn id="new-task-priority" class="set-input" data-task-priority="${
                        task.priority
                    }">Priority</btn>
                    <div id="set-priority-modal" class="modal">
                        <span class="set-priority low-priority"><i class="fas fa-flag low-priority-flag"></i>Low</span>
                        <span class="set-priority medium-priority"><i class="fas fa-flag medium-priority-flag"></i>Medium</span>
                        <span class="set-priority high-priority"><i class="fas fa-flag high-priority-flag"></i>High</span>
                    </div>
                </div>
            </div>
            <div class="task-modal-bottom-btns">
                <btn id="save-task-edit">Save</btn>
                <btn id="close-task-modal">Close</btn>
            </div>
            `
            let mainSection = document.querySelector("main")
            mainSection.append(taskDisplay)
            initFlatpickr()

            let closeBtn = taskDisplay.querySelector("#close-task-modal")
            closeBtn.addEventListener("click", (e) => removeTaskModal())

            let saveBtn = taskDisplay.querySelector("#save-task-edit")
            saveBtn.addEventListener("click", (e) => {
                UI.saveTaskEdit(task.id)
                removeTaskModal()
            })
        }

        addGlobalEventListener("click", ".task-options", (e) => {
            e.target.classList.toggle("active")
            addOverlay(e)
        })

        addGlobalEventListener("click", ".task-delete", (e) => {
            let taskId = e.target.closest(".task").dataset.id
            UI.deleteTask(taskId)
        })

        addGlobalEventListener("click", "label", (e) => {
            e.target.style.pointerEvents = "none"
            e.target.closest(".task").style.pointerEvents = "none"
            let taskId = e.target.closest(".task").dataset.id
            UI.checkTask(taskId)
        })

        //LIFE QUALITY CHANGES
        //prevent page reloading
        addGlobalEventListener("click", "button", (e) => e.preventDefault())

        //prevents first input value to be a space
        addGlobalEventListener("keydown", "input", (e) => {
            if (e.target.value.length === 0 && event.which === 32) {
                event.preventDefault()
            }
        })

        //prevent multiple spaces between words inside inputs
        addGlobalEventListener("keydown", "input", (e) => {
            let input = e.target
            let val = input.value
            let end = input.selectionEnd
            if (e.keyCode == 32 && (val[end - 1] == " " || val[end] == " ")) {
                e.preventDefault()
                return false
            }
        })

        //focus on input when clicking on form
        addGlobalEventListener("click", "#new-list-form", (e) => {
            let input = e.target.children[0]
            input.focus()
        })

        addGlobalEventListener("input", "#edit-list-header-input", (e) => {
            e.target.style.width = e.target.value.length + "ch"
        })

        // document.body.addEventListener("click", (e) => console.log(e.target))
    }
}
