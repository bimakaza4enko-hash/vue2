Vue.component('note-card', {
    props: {
        note: Object,
        blocked: Boolean
    },
    template: '#note-card-template',
    data() {
        return {
            localItems: JSON.parse(JSON.stringify(this.note.items))
        };
    },
    computed: {
        completedCount() {
            return this.localItems.filter(item => item.completed).length;
        },
        progressPercent() {
            return Math.round((this.completedCount / this.localItems.length) * 100);
        },
        completed() {
            return this.progressPercent === 100;
        }
    },
    watch: {
        progressPercent(newVal) {
            if (this.note.status !== 'done' && newVal === 100) {
                this.$emit('move-to-done', {
                    id: this.note.id,
                    completedAt: new Date().toISOString()
                });
            }
        }
    },
        methods: {
        toggleItem(index) {
            if (this.note.status === 'done') return;

            this.localItems[index].completed = !this.localItems[index].completed;

            if (this.note.status === 'new') {
                const completedCount = this.localItems.filter(item => item.completed).length;
                const percent = (completedCount / this.localItems.length) * 100;

                if (percent > 50) {
                    this.$emit('update', {
                        id: this.note.id,
                        items: this.localItems,
                        status: 'inProgress'
                    });
                } else {
                    this.$emit('update', {
                        id: this.note.id,
                        items: this.localItems
                    });
                }
            } else {
                this.$emit('update', {
                    id: this.note.id,
                    items: this.localItems
                });
            }
        },
                    updateItem(index, value) {
            if (this.note.status === 'done') return;
            this.localItems[index].text = value;
        },
        saveItem(index) {
            if (this.note.status === 'done') return;
            if (this.localItems[index].text.trim()) {
                this.$emit('update', {
                    id: this.note.id,
                    items: this.localItems
                });
            }
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        }
    }
});

Vue.component('note-form', {
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    template: '#note-form-template',
    data() {
        return {
            title: '',
            items: [
                { text: '', completed: false },
                { text: '', completed: false },
                { text: '', completed: false }
            ]
        };
    },
    computed: {
        isValid() {
            return this.title.trim() && 
                   this.items.every(item => item.text.trim()) &&
                   this.items.length >= 3 &&
                   this.items.length <= 5;
        }
    },
    methods: {
        addItem() {
            if (this.disabled) return;
            if (this.items.length < 5) {
                this.items.push({ text: '', completed: false });
            }
        },
        removeItem(index) {
            if (this.disabled) return;
            if (this.items.length > 3) {
                this.items.splice(index, 1);
            }
        },
        submitForm() {
            if (this.disabled) return;
            if (!this.isValid) return;

            this.$emit('add-note', {
                title: this.title,
                items: this.items.map(item => ({
                    text: item.text,
                    completed: false
                }))
            });
            
            this.title = '';
            this.items = [
                { text: '', completed: false },
                { text: '', completed: false },
                { text: '', completed: false }
            ];
        }
    }
});

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
