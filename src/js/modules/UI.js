import Storage from './Storage'
import List from './List'
import Task from './Task'
import { format } from 'date-fns'
import flatpickr from "flatpickr";

export default class UI {

    static loadHomepage() {
        UI.loadLists()
        UI.initUserInputs()
        UI.openList(document.querySelector('#Inbox'))
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
        let newListElement = document.createElement('div')
        newListElement.classList.add('list', 'user-list')
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
        let selectedList = JSON.parse(localStorage.getItem('selectedListId')) || "Inbox"
        let unquotedSelectedList = selectedList.replace(/["]+/g, '')
        if (newListName == unquotedSelectedList) {
            newListElement.classList.add('selected')
        }

        userListsContainer.append(newListElement)
        // userListsContainer.innerHTML += `
        // <div id='${newListName}' class="list user-list">
        //     <span class="list-name">${newListName}</span>
        //     <btn class="list-options">
        //         <i class="fas fa-ellipsis-h options-icon"></i>
        //         <div class="list-options-modal modal">
        //             <btn class="list-edit">Edit</btn>
        //             <btn class="list-delete"> Delete</btn>
        //         </div>
        //     </btn>
        // </div>
        // `
    }

    static openList(listElement) {
        document.querySelector('#tasks-container').innerHTML = ''
        let lists = document.querySelectorAll('.list')
        lists.forEach(list => list.classList.remove('selected'))
        listElement.classList.add('selected')

        let listName = listElement.id
        Storage.saveSelectedList(JSON.stringify(listName))

        let mainHeader = document.querySelector('#list-name-header')
        mainHeader.innerHTML = listName

        let tasks = Storage.getTaskList().getList(listName).getTasks()
        tasks.forEach(task => UI.createTaskElement(task.name, task.details, task.dueDate, task.dueTime, task.priority))
    }

    //List Options
    static getTargetedListElement() {
        let selectedList = event.target.closest('.list')
        return selectedList
    }

    static deleteList() {
        let selectedList = UI.getTargetedListElement()
        Storage.deleteList(selectedList.id)
        let mainHeader = document.querySelector('#list-name-header').textContent
        if (selectedList.id == mainHeader) {UI.openList(document.querySelector('#Inbox'))}
        UI.loadLists()

    }

    static openListEdit() {
        let selectedList = UI.getTargetedListElement()
        let selectedListName = selectedList.id
        let editListForm = document.createElement('form')
        editListForm.innerHTML = `
        <input type='text' placeholder='${selectedListName}' id="edit-list-input" autocomplete="off" maxlength="30"/>
        <button type='submit' id="edit-list-confirm"><i class="fas fa-check"></i></button>
        `
        editListForm.id = 'edit-list-form'
        if (selectedList.matches('.list.selected')) editListForm.classList.add('selected')
        
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
            UI.closeListEdit()
        }
    }

    static closeListEdit() {
        let overlay = document.querySelectorAll('.editing-overlay')
        overlay.forEach(overlay => overlay.classList.remove('active'))
        UI.loadLists()
    }

    //TASKS MANAGING
    static addTask() {
        let name = document.querySelector('#new-task-name').value
        let details = document.querySelector('#new-task-details').value
        let dueDate = document.querySelector('#selected-date').textContent
        let dueTime =document.querySelector('#selected-time').textContent
        let priority = document.querySelector('#new-task-priority').dataset.taskPriority
        let selectedList = document.querySelector('#selected-new-task-list').textContent

        if (name == '') {
            alert('Task name cannot be empty.')
            return
        }
        if (name.length < 4) {
            alert('Task name must be longer than 4 characters')
            return
        }
        if (Storage.getTaskList().getList(selectedList).contains(name)) {
            alert('This task already exists')
            return
        }
        if (dueDate == 'Schedule') {
            dueDate = ''
        }

        Storage.addTask(selectedList, new Task(name, details, dueDate, dueTime, priority))
        UI.createTaskElement(name, details, dueDate, dueTime, priority)
    }

    static createTaskElement(name, details, dueDate, dueTime, priority) {
        let tasksContainer = document.querySelector('#tasks-container')
        tasksContainer.innerHTML += `
        <div class="task">
            <div class="custom-cb task-desc">
                <input type="checkbox" id="${name}" class="checkbox">
                <label for="${name}" data-task-priority='${priority}'></label>
                <span class="task-name">
                    ${name}
                    <span class="due-date-subtext">${dueDate} ${dueTime}</span>
                </span>
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
        addGlobalEventListener('click', '.list', e => {
            if (document.querySelector('#new-task-form')) deleteNewTaskForm()
            UI.openList(e.target)
        })

        addGlobalEventListener('click', '#add-list-btn', e => UI.addList())

        addGlobalEventListener('click', '.list-options', e => {
            e.target.parentElement.classList.toggle('active')
            toggleOverlay()
        })
        addGlobalEventListener('click', '.list-edit', e => {
            closeActiveModals()
            UI.openListEdit()
            toggleEditingOverlay()
            if (document.querySelector('#new-task-form')) deleteNewTaskForm()
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
        })
        addGlobalEventListener('click', '#close-new-task-form', e => {
            deleteNewTaskForm()
        })

        function createNewTaskForm() {
            let openFormBtn = document.querySelector('#open-new-task-form')
            openFormBtn.style.display = 'none'
            let newTaskForm = document.createElement('form')
            newTaskForm.id = 'new-task-form'
            let mainHeader = document.querySelector('#list-name-header').textContent
            if (mainHeader == 'Today' || mainHeader == 'Upcoming') {mainHeader = 'Inbox'}
            newTaskForm.innerHTML = `
                    <input type="text" placeholder="Task" id="new-task-name" class="text-input">
                    <textarea placeholder="Details" name="" id="new-task-details" class="text-input"></textarea>
                    <div class="set-inputs">
                        <div id="set-list-container" class='set-input-container'>
                            <btn id="new-task-list" class="set-input">
                                <i class="fas fa-folder-open"></i>
                                <span id='selected-new-task-list'>${mainHeader}</span>
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
                                <span class="set-priority low-priority selected"><i class="fas fa-flag low-priority-flag"></i>Low</span>
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
            initFlatpickr()
        }

        addGlobalEventListener('click', '#add-new-task', e => {
            UI.addTask()
            deleteNewTaskForm()
            createNewTaskForm()
        })

        function deleteNewTaskForm() {
            let openFormBtn = document.querySelector('#open-new-task-form')
            openFormBtn.style.display='flex'
            let form = document.querySelector('#new-task-form')
            form.remove()
        }

        addGlobalEventListener('click', '.set-input', e => {
            closeActiveModals()
            toggleOverlay()
            e.target.classList.toggle('active')
        })

        // Set list for new task
        addGlobalEventListener('click', '#new-task-list', e => createSetListDropdown())
        
        function createSetListDropdown() {
            let listsContainer = document.querySelector('#saved-lists-container')
            listsContainer.innerHTML = ''
            Storage.getTaskList()
            .getLists()
            .forEach(list => {
                if (list.name !== 'Today' && list.name !== 'Upcoming') {
                    let listCopy = document.createElement('span')
                    listCopy.classList.add('new-task-list')
                    listCopy.textContent = list.name
                    if (listCopy.textContent == document.querySelector('#selected-new-task-list').textContent) {
                        listCopy.classList.add('selected')
                    }
                    listsContainer.append(listCopy)
                    }
                })
        }

        addGlobalEventListener('click', '.new-task-list', e => {
            let setListBtn = document.querySelector('#selected-new-task-list')
            setListBtn.textContent = e.target.textContent
            closeActiveModals()
            createSetListDropdown()
        })
        
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
                    setTimeBtn.textContent = 'Remove Time'
                    setTimeBtn.classList.add('remove')
                    let time = flatpickr('#flatpickr-time', {
                        inline: true,
                        noCalendar: true,
                        enableTime: true,
                        time_24hr: true,
                        defaultHour: '12',
                        onChange: function(timeObject, timeString) {
                            selectedTime.textContent = `(${timeString})`
                        }
                    })
                    selectedTime.textContent = '(12:00)'
                }
                else resetSetTimeBtn()
            })

            function resetSetTimeBtn() {
                setTimeBtn.textContent = 'Set Time'
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
                        selectedTime.textContent = `(${timeString})`
                    },
                })
                time.clear()
                selectedTime.textContent = ''
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
            let selectedPriority = e.target.textContent.toLowerCase()
            let taskPriority = document.querySelector('#new-task-priority')
            taskPriority.dataset.taskPriority = selectedPriority

            let priorityOptions = document.querySelectorAll('.set-priority')
            priorityOptions.forEach(option => option.classList.remove('selected'))
            e.target.classList.add('selected')

            closeActiveModals()
        }

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

        addGlobalEventListener('click', '.set-inputs', e => closeActiveModals())

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

        //LIFE QUALITY CHANGES

        //prevent page reloading
        addGlobalEventListener('click', 'button', e => e.preventDefault())

        //prevents first input value to be a space
        addGlobalEventListener('keydown', 'input', e => {
            if (e.target.value.length === 0 && event.which === 32) { 
                event.preventDefault();
            }
        });

        //prevent multiple spaces between words inside inputs
        addGlobalEventListener('keydown', 'input', e => {
            var input = e.target;
            var val = input.value;
            var end = input.selectionEnd;
            if(e.keyCode == 32 && (val[end - 1] == " " || val[end] == " ")) {
            e.preventDefault();
            return false;
            }      
        });

        //focus on input when clicking on form
        addGlobalEventListener('click', '#new-list-form', e => { 
            let input = e.target.children[0]
            input.focus()
        })

        // document.body.addEventListener('click', e => console.log(e.target.textContent))
    }
}