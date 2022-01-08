import Storage from './Storage'
import List from './List'
import Task from './Task'
import { format } from 'date-fns'
import flatpickr from "flatpickr";

export default class UI {
    
    static loadHomepage() {
        UI.loadLists()
        // UI.openList('Inbox', document.querySelector('#inbox-list'))
        UI.initUserInputs()
    }

    static loadLists() {
        let userListsContainer = document.querySelector('#user-lists-container')//clears the lists container so that it doesnt render multiple times the same lists
        userListsContainer.innerHTML = '' 
        Storage.getTaskList()
        .getLists()
        .forEach((list) => {
            if (list.name !== 'Inbox' && list.name !== 'Today' && list.name !== 'Upcoming') {
                UI.createListElement(list.name)
            }
        })
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
        <div class="user-list">
            <span class="list-name">${newListName}</span> 
            <div class="list-options">
                <i class="fas fa-ellipsis-h options-icon modal-toggler"></i>
                <div class="list-options-modal modal">
                    <span class="list-edit">Edit</span>
                    <span class="list-delete"> Delete</span>
                </div>
            </div>
        </div>
        `
    }

    //List Options
    static getSelectedList() {
        let selectedList = event.target.closest('.user-list')
        return selectedList
    }

    static deleteList() {
        let selectedList = UI.getSelectedList()
        let selectedListName = selectedList.children[0].innerText
        Storage.deleteList(selectedListName)
        UI.loadLists()
        console.log(selectedList)
    }

    static openListEdit() {
        let selectedList = UI.getSelectedList()
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
                let newListElement = document.createElement('div')
                newListElement.classList.add('user-list')
                newListElement.innerHTML = `
                <span class="list-name">${newListName}</span> 
                <div class="list-options">
                <i class="fas fa-ellipsis-h options-icon modal-toggler"></i>
                <div class="list-options-modal modal">
                <span class="list-edit">Edit</span>
                <span class="list-delete"> Delete</span>
                </div>
                </div>
                `
                editListForm.replaceWith(newListElement)
                UI.closeListEdit()
            }
        }
            
        static closeListEdit() {
            let overlay = document.querySelectorAll('.editing-overlay')
            overlay.forEach(overlay => overlay.classList.remove('active'))
            UI.loadLists()
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

        addGlobalEventListener('DOMContentLoaded', '.active',)

        //List Event Listeners
        addGlobalEventListener('click', '#add-list-btn', e => UI.addList())

        addGlobalEventListener('click', '.list-edit', e => {
            closeActiveModals()
            UI.openListEdit()
            toggleEditingOverlay()
        })
        addGlobalEventListener('click', '.editing-overlay.active', e => {
            toggleEditingOverlay()
            UI.closeListEdit()
        })
            
        addGlobalEventListener('click', '.list-delete', e => UI.deleteList())

        function toggleEditingOverlay() {
            let overlay = document.querySelectorAll('.editing-overlay')
            overlay.forEach(overlay => overlay.classList.toggle('active'))
        }

        //open and close user lists container
        addGlobalEventListener('click', '#user-lists-title', e => e.target.classList.toggle('open'))

        //open and close main add task form
        addGlobalEventListener('click', '#main-add-task-btn', e => {
            toggleNewTaskForm()
            resetDate()
        })
        addGlobalEventListener('click', '#main-form-cancel-btn', e => toggleNewTaskForm())
        function toggleNewTaskForm() {
            let mainAddTaskBtn = document.querySelector('#main-add-task-btn')
            mainAddTaskBtn.classList.toggle('open')
        }

        //open and close modals, add overlay when open, remove when closed
        addGlobalEventListener('click', '.modal-toggler', e => toggleModal())
        function toggleModal() {
            let modal = event.target
            modal.classList.toggle('active')
            addOverlay()
            addGlobalEventListener('mouseover', '.overlay.active', e => {
                removeOverlay()
                closeActiveModals()
            })
            addGlobalEventListener('mouseover', '.set-inputs', e => {
                removeOverlay()
                closeActiveModals()
            })
        }
        
        function addOverlay() {
            let overlay = document.querySelectorAll('.overlay')
            overlay.forEach( overlay => overlay.classList.add('active'))
        }

        function removeOverlay() {
            let overlay = document.querySelectorAll('.overlay')
            overlay.forEach( overlay => overlay.classList.toggle('active'))
        }

        function closeActiveModals() {
            removeOverlay()
            let activeModals = document.querySelectorAll('.active')
            activeModals.forEach(modal =>modal.classList.remove('active'))
        }

        // FLATPICKR CONFIG
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
            let btn = e.target
            if (btn.innerText == 'Set Time') {
                btn.innerText = 'Remove Time'
                btn.classList.add('remove')
                selectedTime.innerText = '(00:00)'
                flatpickr('#flatpickr-time', {
                    inline: true,
                    noCalendar: true,
                    enableTime: true,
                    time_24hr: true,
                    defaultHour: '00',
                    onChange: function(timeObject, timeString) {
                        console.log(timeString)
                        selectedTime.innerText = `(${timeString})`
                    }
                })
            }
            else {
                btn.innerText = 'Set Time'
                btn.classList.remove('remove')
                selectedTime.innerText = ''
                flatpickr('#flatpickr-time', {
                    inline: false,
                })
            }
        })

        addGlobalEventListener('click', '#remove-selected-date-btn', e => resetDate())
        function resetDate() {
            event.preventDefault()
            selectedDate.innerHTML = 'Schedule'
            selectedTime.innerHTML = ''
            removeSelectedDateBtn.classList.add('hidden')
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

        document.addEventListener('click', e => console.log(e.target))
    }
}