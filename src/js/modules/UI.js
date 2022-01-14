import Storage from './Storage'
import List from './List'
import Task from './Task'
import { format } from 'date-fns'
import flatpickr from "flatpickr";

export default class UI {
    
    static loadHomepage() {
        UI.loadLists()
        UI.initUserInputs()
    }

    static loadLists() {
        let userListsContainer = document.querySelector('#user-lists-container')//clears the lists container so that it doesnt render multiple times the same lists
        userListsContainer.innerHTML = '' 
        Storage.getTaskList()
        .getLists()
        .forEach(list => {
            if (list.name !== 'Inbox' && list.name !== 'Today' && list.name !== 'Upcoming') {
                UI.createListElement(list.name)
            }
        })
    }

    static loadTasks() {
        Storage.getTaskList()
        .getList(listName)
        .getTasks()
        .forEach(task => UI.createTaskElement(task.name, task.dueDate, task.priority))
    }

    // LIST MANAGING
    //Creating a new list
    static addList() {
        let newListInput = document.querySelector('#new-list-input')
        let newListName = newListInput.value
        newListInput.value = '' //clear input field

        if (newListName == '') {
            alert(`List name cannot be empty`)
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
        let userListsContainer = document.querySelector('#user-lists-container')
        userListsContainer.innerHTML += `
        <div class="list user-list">
            <span class="list-name">${newListName}</span>
            <btn class="list-options">
                <i class="fas fa-ellipsis-h options-icon"></i>
                <div class="list-options-modal modal">
                    <btn class="list-edit">Edit</btn>
                    <btn class="list-delete"> Delete</btn>
                </div>
            </btn>
        </div>
        `
    }

    //List Options
    static getTargetedListElement() {
        let selectedList = event.target.closest('.list')
        return selectedList
    }

    static deleteList() {
        let selectedList = UI.getTargetedListElement()
        let selectedListName = selectedList.children[0].innerText
        Storage.deleteList(selectedListName)
        UI.loadLists()
        console.log(selectedList)
    }

    static openListEdit() {
        let selectedList = UI.getTargetedListElement()
        let selectedListName = selectedList.children[0].innerText
        let editListForm = document.createElement('form')
        editListForm.innerHTML = `
        <input type='text' placeholder='${selectedListName}' id="edit-list-input" autocomplete="off" maxlength="30"/>
        <button type='submit' id="edit-list-confirm"><i class="fas fa-check"></i></button>
        `
        editListForm.id = 'edit-list-form'
        selectedList.replaceWith(editListForm)
        let editListInput = document.getElementById('edit-list-input')
        editListInput.focus()

        let confirmButton = document.querySelector('#edit-list-confirm')
        confirmButton.addEventListener('click', e => confirmEdit())
        
            function confirmEdit() {
                let newListName = editListInput.value

                if (newListName== '') {
                    UI.closeListEdit()
                    alert(`The list name can't be empty.`)
                    return
                }

                if (Storage.getTaskList().contains(newListName)) {
                    UI.closeListEdit()
                    alert(`This list already exists`)
                    return
                }

                Storage.renameList(selectedListName, newListName)
                
                //Rename list element
                let newListElement = UI.createListElement(newListName)
                editListForm.replaceWith(newListElement)
                UI.closeListEdit()
            }
        }
            
    static closeListEdit() {
        let overlay = document.querySelectorAll('.editing-overlay')
        overlay.forEach(overlay => overlay.classList.remove('active'))
        UI.loadLists()
    }

    static selectList() {
        let listElement = UI.getTargetedListElement()
        let listName = listElement.querySelector('.list-name').innerText
        // let defaultLists = document.querySelectorAll('.default-list')
        // let userLists = document.querySelectorAll('.user-list')
        // let lists = [...defaultLists, ...userLists]
        let lists = document.querySelectorAll('.list')

        lists.forEach(list => list.classList.remove('selected'))
        listElement.classList.add('selected')
        
        UI.openSelectedList(listName)
    }

    static openSelectedList(listName) {
        console.log(listName)
        let tasks = Storage.getTaskList().getList(listName).getTasks()
        console.log(tasks)
        tasks.forEach(task => UI.createTaskElement(task.name, task.dueDate, task.priority))
    }

    //TASKS MANAGING
    static addTask() {
        let name = document.querySelector('#new-task-name').value
        let details = document.querySelector('#new-task-details').value
        let dueDate = document.querySelector('#selected-date').innerText
        let dueTime =document.querySelector('#selected-time').innerText
        let priority = document.querySelector('#new-task-priority').dataset.taskPriority

        UI.createTaskElement(name, dueDate, dueTime, priority)
        console.log(dueTime)
    }

    static createTaskElement(name, dueDate, dueTime, priority) {
        let tasksContainer = document.querySelector('#tasks-container')
        tasksContainer.innerHTML += `
            <div class="task">
                <div class="custom-cb task-desc">
                    <input type="checkbox" id='${name}' class="checkbox">
                    <label for="${name}" data-task-priority='${priority}'></label>
                    <span class="task-name">${name}
                        <span class="due-date-subtext">${dueDate == 'Schedule' ? '': dueDate} ${dueTime}</span>
                    </span>
                </div>
                <div class="task-options">
                    <i class="fas fa-ellipsis-h options-icon"></i>
                    <div class="task-options-modal modal">
                        <span class="task-edit">Edit</span>
                        <span class="task-dlt"> Delete</span>
                    </div>
                </div>
            </div>
        `
    }
        
    static addGlobalEventListener(type, selector, callback) {
        document.addEventListener(type, e => {
            if (e.target.matches(selector || selector)) callback(e)
        })
    }

    


    // INPUT FUNCTIONS AND EVENT LISTENERS
    static initUserInputs() {

        function addGlobalEventListener(type, selector, callback) {
            document.addEventListener(type, e => {
                if (e.target.matches(selector)) callback(e)
            })
        }

        //LISTS
        addGlobalEventListener('click', '.list', e => UI.selectList())
        addGlobalEventListener('click', '#add-list-btn', e => UI.addList())

        addGlobalEventListener('click', '.list-options', e => {
            e.target.parentElement.classList.toggle('active')
            toggleOverlay()
        })
        addGlobalEventListener('click', '.list-edit', e => {
            closeActiveModals()
            UI.openListEdit()
            toggleEditingOverlay()
        })
        addGlobalEventListener('click', '.editing-overlay.active', e => {
            toggleEditingOverlay()
            UI.closeListEdit()
        })
            
        addGlobalEventListener('click', '.list-delete', e => {
            removeOverlay()
            UI.deleteList()
        })

        addGlobalEventListener('click', '#user-lists-title', e => e.target.classList.toggle('open'))

        //MAIN ADD TASK FORM
        addGlobalEventListener('click', '#open-new-task-form', e => {
            createNewTaskForm()
            initFlatpickr()
            e.target.style.display='none'
        })
        addGlobalEventListener('click', '#close-new-task-form', e => {
            deleteNewTaskForm()
            let openFormBtn = document.querySelector('#open-new-task-form')
            openFormBtn.style.display='flex'
        })

        function createNewTaskForm() {
            let openFormBtn = document.querySelector('#open-new-task-form')
            let newTaskForm = document.createElement('form')
            newTaskForm.id = 'new-task-form'
            newTaskForm.innerHTML = `
                    <input type="text" placeholder="Task" id="new-task-name" class="text-input">
                    <textarea placeholder="Details" name="" id="new-task-details" class="text-input"></textarea>
                    <div class="set-inputs">
                        <div id="set-list-container" class='set-input-container'>
                            <btn id="new-task-list" class="set-input">
                                <i class="fas fa-folder-open"></i>
                                <span id='selected-new-task-list'>Inbox</span>
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
                                    <button id="set-time-btn" class="disabled">
                                        Set Time
                                    </button>
                                </div>
                                
                                <div id="flatpickr-time" class=".flatpickr"></div>
                            </div>
                        </div>

                        <div id="set-priority-container" class='set-input-container'>
                            <btn id="new-task-priority" class="set-input" data-task-priority="low">Priority</btn>
                            <div id="set-priority-modal" class="modal">
                                <span class="set-priority low-priority"><i class="fas fa-flag low-priority-flag"></i>Low</span>
                                <span class="set-priority medium-priority"><i class="fas fa-flag medium-priority-flag"></i>Medium</span>
                                <span class="set-priority high-priority"><i class="fas fa-flag high-priority-flag"></i>High</span>
                            </div>
                        </div>
                    </div>
                    <div class="add-cancel-btns">
                        <button id="add-new-task">Add task</button>
                        <button id="close-new-task-form">Cancel</button>
                    </div>
            `
            openFormBtn.parentNode.insertBefore(newTaskForm, openFormBtn.nextSibling)
        }

        function deleteNewTaskForm() {
            let form = document.querySelector('#new-task-form')
            console.log(form)
            form.remove()
        }

        addGlobalEventListener('click', '.set-input', e => {
            closeActiveModals()
            toggleOverlay()
            e.target.classList.toggle('active')
        })

        // Set list for new task
        addGlobalEventListener('click', '#new-task-list', e => renderSavedLists())
        
        function renderSavedLists() {
            let listsContainer = document.querySelector('#saved-lists-container')
            listsContainer.innerHTML = ''
            Storage.getTaskList()
            .getLists()
            .forEach(list => {
                if (list.name !== 'Today' && list.name !== 'Upcoming') {
                    let savedList = document.createElement('span')
                    savedList.classList.add('new-task-list')
                    savedList.innerText = list.name
                    if (savedList.innerText == document.querySelector('#selected-new-task-list').innerText) {
                        savedList.classList.add('selected')
                    }
                    listsContainer.append(savedList)
                    }
                })
        }

        addGlobalEventListener('click', '.new-task-list', e => {
            let setListBtn = document.querySelector('#selected-new-task-list')
            setListBtn.innerText = e.target.innerText
            // closeActiveModals()
            renderSavedLists()
        })
        
        addGlobalEventListener('click', '#add-new-task', e => UI.addTask())

        //TASK
        addGlobalEventListener('click', '.task-options', e => {
            e.target.classList.toggle('active')
            toggleOverlay()
        })
        //MODALS
        function closeActiveModals() {
            removeOverlay()
            let activeModals = document.querySelectorAll('.active')
            activeModals.forEach(modal =>modal.classList.remove('active'))
        }

        //OVERLAYS
        function toggleOverlay() {
            let overlay = document.querySelectorAll('.overlay')
            overlay.forEach( overlay => overlay.classList.toggle('active'))
            addGlobalEventListener('click', '.overlay.active', e => closeActiveModals())
        }

        function removeOverlay() {
            let overlay = document.querySelectorAll('.overlay')
            overlay.forEach(overlay => overlay.classList.toggle('active'))
        }

        function toggleEditingOverlay() {
            let overlay = document.querySelectorAll('.editing-overlay')
            overlay.forEach(overlay => overlay.classList.toggle('active'))
        }

        //NEW TASK CREATION
        //NEW TASK DATE AND TIME SELECTOR 
        function initFlatpickr() {
            let selectedDate = document.querySelector('#selected-date')
            let setTimeBtn = document.querySelector('#set-time-btn')
            let selectedTime = document.querySelector('#selected-time')
            let removeSelectedDateBtn = document.querySelector('#remove-selected-date-btn')
            flatpickr('#flatpickr-date', {
                inline: true,
                dateFormat: 'd M Y',
                minDate: 'today',
                enableTime: false,
                onChange: function(dateObject, dateString) {
                    selectedDate.innerHTML = dateString
                    setTimeBtn.classList.remove('disabled')
                    removeSelectedDateBtn.classList.remove('hidden')
                }
            })

            addGlobalEventListener('click', '#set-time-btn', e => {
                if (setTimeBtn.innerText == 'Set Time') {
                    setTimeBtn.innerText = 'Remove Time'
                    setTimeBtn.classList.add('remove')
                    let time = flatpickr('#flatpickr-time', {
                        inline: true,
                        noCalendar: true,
                        enableTime: true,
                        time_24hr: true,
                        defaultHour: '12',
                        onChange: function(timeObject, timeString) {
                            selectedTime.innerText = `(${timeString})`
                        }
                    })
                    selectedTime.innerText = '(12:00)'
                }
                else resetSetTimeBtn()
            })

            function resetSetTimeBtn() {
                setTimeBtn.innerText = 'Set Time'
                setTimeBtn.classList.remove('remove')
                // let flatpickrTime = document.querySelector(".flatpickr-calendar.hasTime.noCalendar.animate.inline")
                // flatpickrTime.innerHTML = ``
                let time = flatpickr('#flatpickr-time', {
                    inline: false,
                    noCalendar: true,
                    enableTime: true,
                    time_24hr: true,
                    defaultHour: '12',
                    onChange: function(timeObject, timeString) {
                        selectedTime.innerText = `(${timeString})`
                    },
                })
                time.clear()
                selectedTime.innerText = ''
            }

            addGlobalEventListener('click', '#remove-selected-date-btn', e => resetDate())
            function resetDate() {
                event.preventDefault()
                closeActiveModals()
                resetSetTimeBtn()
                selectedDate.innerHTML = 'Schedule'
                selectedTime.innerHTML = ''
                setTimeBtn.classList.add('disabled')
                removeSelectedDateBtn.classList.add('hidden')
                let selectedDay = document.querySelector('.flatpickr-day.selected')
                if (selectedDay == null) return 
                else {selectedDay.classList.toggle('selected')}
            }
        }

        //NEW TASK PRIORITY SELECTOR
        addGlobalEventListener('click', '.set-priority', e => setTaskPriority(e))
        function setTaskPriority(e) {
            let selectedPriority = e.target.innerText.toLowerCase()
            let taskPriority = document.querySelector('#new-task-priority')
            taskPriority.dataset.taskPriority = selectedPriority
            closeActiveModals()
        }

        //LIFE QUALITY CHANGES
        addGlobalEventListener('click', 'button', e => e.preventDefault())
        addGlobalEventListener('keydown', 'input', e => {
            if (e.target.value.length === 0 && event.which === 32) { //prevents first input value to be a space
                event.preventDefault();
            }
        });
        addGlobalEventListener('click', 'form', e => { //focus on input when clicking on form
            let input = e.target.children[0]
            input.focus()
        })

        // document.body.addEventListener('click', e => console.log(e.target))
    }
}