<h1 class="avenir">Todos</h1>
<form on:submit="addTask(event)">
	<input bind:value="description" />
</form>

<ul class="list">
	{#each tasks as task}
	<li>
		<input type="checkbox" checked="{task.complete}" on:change="toggleComplete(task.id)" /> {task.description}
		<button on:click="removeTask(task.id)">remove task</button>
	</li>
	{/each}
</ul>
<script>
  import store from './bundles'

  export default {
    data() {
      return {
        tasks: [],
        description: ''
      }
    },
    methods: {
      addTask(event) {
        event.preventDefault()
        // todo add task
        let { description } = this.get()
        store.doAddTask(description)
        this.set({ description: '' })
      },
      removeTask(id) {
        // todo remove task
        if (confirm('are you sure?')) {
          store.doRemoveTask(id)
        }
      },
      toggleComplete(id) {
        // todo mark complete
        store.doToggleComplete(id)
      }
    }
  }
</script>