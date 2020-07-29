new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data() {
    return {
      isDark: true,
      show: true,
      todoTitle: '',
      todos: []
    }
  },
  created() {
    const query = `
      query {
        getTodos {
          id title done createdAt updatedAt
        }
      }
    `

    fetch("/graphql", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((response) => {
        this.todos = response.data.getTodos
      })
      .catch(e => {
        console.log(e)
      }) 
  },
  methods: {
    addTodo() {
      const title = this.todoTitle.trim();

      if (!title) {
        return
      }

      const query = `
        mutation {
          createTodo(todo: {title: "${title}"}) {
            title createdAt id updatedAt
          }
        }
      `;
      fetch("/graphql", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      })
        .then((res) => res.json())
        .then(response => {
          const todo = response.data.createTodo;
          this.todos.push(todo);
          this.todoTitle = "";
        })
        .catch((e) => {
          console.log(e);
        }); 
    },
    removeTodo(id) {
      const query = `
        mutation {
          deleteTodo(id: "${id}")
        }
      `
      fetch('/graphql', {
        method: 'post',
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      })
        .then(() => {
          this.todos = this.todos.filter(item => item.id !== id);
        })
        .catch(e => console.log(e))
    },
    completeTodo(id) {
      const query = `
      mutation {
        completeTodo(id: "${id}") {
          updatedAt
        }
      }
      `
      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(response => {
          const idx = this.todos.findIndex(t => t.id === id);
          this.todos[idx].updatedAt = response.data.completeTodo.updatedAt;
        })
        .catch(e => {
        console.log(e)
      })
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    date(value, withTime) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      }

      if (withTime) {
        options.hour = '2-digit',
        options.minute = '2-digit',
        options.second = '2-digit'
      }

      return new Intl.DateTimeFormat('en-EN', options).format(new Date(+value))
    }
  }
})