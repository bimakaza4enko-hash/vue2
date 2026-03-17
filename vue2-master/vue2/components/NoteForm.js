Vue.component('note-form', {
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
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
                <button @click="addItem" :disabled="disabled || items.length >= 5">+ Добавить пункт</button>
                <button @click="submitForm" :disabled="disabled || !isValid">Создать заметку</button>
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
