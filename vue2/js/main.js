Vue.component('note-card', {
    props: {
        note: Object,
        blocked: Boolean
    },
    template: `
        <div class="card" :class="{ completed: completed }">
            <div class="card-header">
                <h3>{{ note.title }}</h3>
                <button class="delete-btn" @click="$emit('delete', note.id)">✕</button>
            </div>
            
            <div class="todo-list">
                <div v-for="(item, index) in note.items" :key="index" class="todo-item">
                    <input 
                        type="checkbox" 
                        :checked="item.completed"
                        @change="toggleItem(index)"
                        :disabled="note.status === 'done'"
                    >
                    <input 
                        type="text" 
                        :value="item.text"
                        @input="updateItem(index, $event.target.value)"
                        @blur="saveItem(index)"
                        :disabled="note.status === 'done'"
                        placeholder="Пункт задачи"
                    >
                </div>
            </div>

            <div class="card-footer">
                <div class="progress">
                    Прогресс: {{ completedCount }}/{{ note.items.length }}
                    ({{ progressPercent }}%)
                </div>
                <div v-if="note.completedAt" class="completed-date">
                    Завершено: {{ formatDate(note.completedAt) }}
                </div>
            </div>
        </div>
    `,
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
    template: `
        <div class="note-form">
            <input 
                type="text" 
                v-model="title" 
                placeholder="Заголовок заметки"
                class="title-input"
            >
            <div class="items">
                <div v-for="(item, index) in items" :key="index" class="item-input">
                    <input 
                        type="text" 
                        v-model="item.text" 
                        :placeholder="'Пункт ' + (index + 1)"
                    >
                    <button @click="removeItem(index)" v-if="items.length > 3">✕</button>
                </div>
            </div>
            <div class="form-actions">
                <button @click="addItem" :disabled="items.length >= 5">+ Добавить пункт</button>
                <button @click="submitForm" :disabled="!isValid">Создать заметку</button>
            </div>
        </div>
    `,
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
            if (this.items.length < 5) {
                this.items.push({ text: '', completed: false });
            }
        },
        removeItem(index) {
            if (this.items.length > 3) {
                this.items.splice(index, 1);
            }
        },
        submitForm() {
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
