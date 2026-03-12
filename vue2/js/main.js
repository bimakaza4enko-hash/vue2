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

