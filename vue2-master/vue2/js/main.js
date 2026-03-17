let app = new Vue({
    el: '#app',
    data: {
        notes: []
    },
    computed: {
        columnBlocked() {
            return this.notesByStatus('inProgress').length >= 5;
        }
    },
    methods: {
        loadFromStorage() {
            const saved = localStorage.getItem('kanban-notes');
            if (saved) {
                this.notes = JSON.parse(saved);
            } else {
                this.notes = [
                    {
                        id: Date.now() - 1000,
                        title: 'Пример задачи 1',
                        items: [
                            { text: 'Изучить Vue.js', completed: false },
                            { text: 'Написать код', completed: false },
                            { text: 'Проверить работу', completed: false }
                        ],
                        status: 'new',
                        completedAt: null
                    },
                    {
                        id: Date.now() - 2000,
                        title: 'Пример задачи 2',
                        items: [
                            { text: 'Создать компоненты', completed: true },
                            { text: 'Настроить обработку событий', completed: true },
                            { text: 'Добавить стили', completed: false }
                        ],
                        status: 'inProgress',
                        completedAt: null
                    }
                ];
            }
        },
        saveToStorage() {
            localStorage.setItem('kanban-notes', JSON.stringify(this.notes));
        },
        notesByStatus(status) {
            return this.notes.filter(note => note.status === status);
        },
        notesInColumn(status) {
            return this.notesByStatus(status).length;
        },
        addNote(noteData) {
            const newNote = {
                id: Date.now(),
                title: noteData.title,
                items: noteData.items,
                status: 'new',
                completedAt: null
            };
            this.notes.push(newNote);
            this.saveToStorage();
        },
        updateNote(updateData) {
            const index = this.notes.findIndex(n => n.id === updateData.id);
            if (index !== -1) {
                this.notes[index].items = updateData.items;
                if (updateData.status) {
                    this.notes[index].status = updateData.status;
                }
                this.saveToStorage();
            }
        },
        deleteNote(id) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveToStorage();
        },
        moveToDone(data) {
            const index = this.notes.findIndex(n => n.id === data.id);
            if (index !== -1) {
                this.notes[index].status = 'done';
                this.notes[index].completedAt = data.completedAt;
                this.saveToStorage();
            }
        }
    },
    mounted() {
        this.loadFromStorage();
    }
});
