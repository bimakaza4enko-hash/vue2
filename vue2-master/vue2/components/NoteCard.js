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
                        :disabled="blocked || note.status === 'done'"
                    >
                    <input
                        type="text"
                        v-model="item.text"
                        @blur="updateItem(index, item.text)"
                        :disabled="blocked || note.status === 'done'"
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
