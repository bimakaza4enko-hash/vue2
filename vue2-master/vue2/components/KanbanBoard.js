Vue.component('kanban-board', {
    props: {
        notes: Array,
        columnBlocked: Boolean
    },
    template: `
        <div class="board">
            <div class="column">
                <h2>Новые заметки <span class="limit">({{ notesInColumn('new') }}/3)</span></h2>
                <div v-if="columnBlocked" class="blocked-message">
                    Колонка заблокирована (колонка "В работе" заполнена 5/5)
                </div>
                <div class="cards">
                    <note-card
                        v-for="note in notesByStatus('new')"
                        :key="note.id"
                        :note="note"
                        @update="$emit('update', $event)"
                        @delete="$emit('delete', $event)"
                        @move-to-done="$emit('move-to-done', $event)"
                        :blocked="columnBlocked"
                    ></note-card>
                </div>
                <note-form
                    v-if="notesByStatus('new').length < 3"
                    :disabled="columnBlocked"
                    @add-note="$emit('add-note', $event)"
                ></note-form>
            </div>
            <div class="column">
                <h2>В работе <span class="limit">({{ notesInColumn('inProgress') }}/5)</span></h2>
                <div class="cards">
                    <note-card
                        v-for="note in notesByStatus('inProgress')"
                        :key="note.id"
                        :note="note"
                        @update="$emit('update', $event)"
                        @delete="$emit('delete', $event)"
                        @move-to-done="$emit('move-to-done', $event)"
                    ></note-card>
                </div>
            </div>
            <div class="column">
                <h2>Завершённые</h2>
                <div class="cards">
                    <note-card
                        v-for="note in notesByStatus('done')"
                        :key="note.id"
                        :note="note"
                        @delete="$emit('delete', $event)"
                    ></note-card>
                </div>
            </div>
        </div>
    `,
    methods: {
        notesByStatus(status) {
            return this.notes.filter(note => note.status === status);
        },
        notesInColumn(status) {
            return this.notesByStatus(status).length;
        }
    }
});
