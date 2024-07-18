<template>
  <div>
    <h1>Lista de Supermercado</h1>
    <div class="form-container">
      <input v-model="newItem.name" placeholder="Nome do Produto" />
      <input v-model.number="newItem.quantity" type="number" placeholder="Quantidade" />
      <input v-model.number="newItem.price" type="number" step="0.01" placeholder="Preço" />
      <button @click="addItem">Adicionar</button>
    </div>
    <ul class="items-list">
      <li v-for="(item, index) in items" :key="item.id" class="item">
        <div class="item-details">
          <div class="item-photo-container">
            <img v-if="item.photo" :src="item.photo" alt="Foto do Alimento" class="item-photo" />
          </div>
          <div class="item-info">
            {{ item.name }} - {{ item.quantity }} - {{ (parseFloat(item.price) || 0).toFixed(2) }}
          </div>
        </div>
        <button @click="editItem(index)">Editar</button>
        <button @click="removeItem(item.id)">Remover</button>
      </li>
    </ul>
    <div v-if="editIndex !== -1" class="edit-container">
      <input v-model="editItemText.name" placeholder="Nome do Produto" />
      <input v-model.number="editItemText.quantity" type="number" placeholder="Quantidade" />
      <input v-model.number="editItemText.price" type="number" step="0.01" placeholder="Preço" />
      <button @click="updateItem">Salvar</button>
    </div>
    <h2>Total: {{ total }}</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newItem: { name: '', quantity: 1, price: 0 },
      items: [],
      editIndex: -1,
      editItemText: { name: '', quantity: 1, price: 0 }
    }
  },
  computed: {
    total() {
      return this.items.reduce((acc, item) => acc + (item.quantity * (parseFloat(item.price) || 0)), 0).toFixed(2);
    }
  },
  methods: {
    async fetchItems() {
      try {
        const response = await fetch('http://localhost:3000/items');
        this.items = await response.json();
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    },
    async addItem() {
      if (this.newItem.name.trim() !== '' && this.newItem.quantity > 0 && this.newItem.price >= 0) {
        try {
          const response = await fetch('http://localhost:3000/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.newItem)
          });
          const addedItem = await response.json();
          this.items.push(addedItem);
          this.newItem = { name: '', quantity: 1, price: 0 };
        } catch (error) {
          console.error('Error adding item:', error);
        }
      }
    },
    async removeItem(id) {
      try {
        await fetch(`http://localhost:3000/items/${id}`, { method: 'DELETE' });
        this.items = this.items.filter(item => item.id !== id);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    },
    editItem(index) {
      this.editIndex = index;
      this.editItemText = { ...this.items[index] };
    },
    async updateItem() {
      if (this.editItemText.name.trim() !== '' && this.editItemText.quantity > 0 && this.editItemText.price >= 0) {
        try {
          await fetch(`http://localhost:3000/items/${this.items[this.editIndex].id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.editItemText)
          });
          this.$set(this.items, this.editIndex, this.editItemText);
          this.editIndex = -1;
          this.editItemText = { name: '', quantity: 1, price: 0 };
        } catch (error) {
          console.error('Error updating item:', error);
        }
      }
    }
  },
  created() {
    this.fetchItems();
  }
}
</script>

<style scoped>
h1, h2 {
  color: #333;
  text-align: center;
}

.form-container, .edit-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

input, button {
  margin: 5px;
}

button {
  padding: 5px;
  background-color: #ff5722;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #e64a19;
}

.items-list {
  list-style: none;
  padding: 0;
}

.item {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.item-details {
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-photo-container {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-right: 10px;
}

.item-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
