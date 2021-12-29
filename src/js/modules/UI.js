import { format } from 'date-fns'
import Storage from './Storage'
import List from './List'
import Task from './Task'

export default class UI {

    static loadHomepage() {
        UI.initButtons()
        // UI.loadLists()


    }

    static loadLists() {
        Storage.getTaskList()
        .getLists()
        .forEach((list) => {
            if (list.name !== 'Inbox' && list.name !== 'Today' && list.name !== 'Upcoming') {
                UI.createList(list.name)
            }
        })
    }

    static loadTasks(listName) {
        Storage.getTaskList()
        .getList(listName)
        .getTasks()
        .forEach((task) => UI.createTask(task.name, task.dueDate))
    }

    // CREATING CONTENT

    static createList(name) {
        let userListsContainer = document.querySelector('#user-lists-container')
        userListsContainer.innerHTML += `
            <li class="user-list">${name}</li>`
    }

    static createTask(name, dueDate) {
        let tasksContainer = document.querySelector('#tasks-container')
    }



    // BUTTON FUNCTIONS
    static initButtons() {
        //prevent from reloading on all buttons
        let buttons = document.querySelectorAll('button')
        buttons.forEach(button => button.addEventListener('click', e => e.preventDefault()))

        //open and close user lists container
        let userListsToggler = document.querySelector('#user-lists-title')
        userListsToggler.addEventListener('click', () => {
            userListsToggler.classList.toggle('open')
        })

        //open and close main add task form
        let mainAddTaskBtn = document.querySelector('#main-add-task-btn')
        mainAddTaskBtn.addEventListener('click', () => toggleNewTaskForm())
        function toggleNewTaskForm() {
            mainAddTaskBtn.classList.toggle('open')
        }
        let closeMainFormBtn = document.querySelector('#main-form-cancel-btn')
        closeMainFormBtn.addEventListener('click', () => toggleNewTaskForm())

        //open and close modals
        let modals = document.querySelectorAll('.modal-toggler')
        modals.forEach(modal => {
            modal.addEventListener('click', () => toggleActiveClass())
        })

        function toggleActiveClass() {
            let modal = event.target
            modal.classList.toggle('active')
            toggleOverlay()
        }

        function toggleOverlay() {
            overlay = document.getElementById('overlay')
            overlay.classList.toggle('active')
            document.addEventListener('click', e => {
                if (e.target == overlay) {
                    overlay.classList.remove('active')
                    closeActiveModals()
                }
            })
        }

        function closeActiveModals() {
            let activeModals = document.querySelectorAll('.active')
            activeModals.forEach(modal => {
                modal.classList.remove('active')
            })
        }
    }
}