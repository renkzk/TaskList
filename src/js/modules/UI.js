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
                    alert(`The list name can't be empty.`)
                    UI.closeListEdit()
                    return
                }

                if (Storage.getTaskList().contains(newListName)) {
                    alert(`This list already exists`)
                    UI.closeListEdit()
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
                if (e.target.matches(selector || selector)) callback(e)
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
        addGlobalEventListener('click', '#main-add-task-btn', e => toggleNewTaskForm())
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

        //FLATPICKR CONFIG
        flatpickr('.flatpickr', {
            altInput: true,
            altFormat: "F j, Y",
            // enableTime: true,
            // time_24hr: true,
            minDate: 'today'
        })

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
    }
}