import { composeBundles } from 'redux-bundler'
import uuid from 'uuid'
import { append, reject, propEq, equals, without, map, assoc, not } from 'ramda'

const getStore = composeBundles({
  name: 'tasks',
  reducer: (state = [], action) => {
    const actionIs = equals(action.type)
    if (actionIs('SET_TASKS')) {
      return action.payload
    }
    if (actionIs('ADDED_TASK')) {
      return append(action.payload, state)
    }
    if (actionIs('REMOVED_TASK')) {
      return reject(propEq('id', action.payload), state)
    }
    if (actionIs('TOGGLED_COMPLETE')) {
      return map(task => {
        if (propEq('id', action.payload, task)) {
          return assoc('complete', !task.complete, task)
        }
        return task
      }, state)
    }
    return state
  },
  doFetchTasks: () => ({ dispatch }) => {
    getArchive().then(archive => {
      archive.readdir('/').then(files => {
        Promise.all(
          map(
            fn => archive.readFile(fn),
            without(['dat.json', '.datignore'], files)
          )
        ).then(tasks => {
          dispatch({
            type: 'SET_TASKS',
            payload: map(JSON.parse, tasks)
          })
        })
      })
    })
  },
  doAddTask: description => async ({ dispatch }) => {
    const task = { id: generateId(), description, complete: false }
    const archive = await getArchive()
    await archive.writeFile(task.id + '.json', JSON.stringify(task))
    dispatch({
      type: 'ADDED_TASK',
      payload: task
    })
  },
  doRemoveTask: id => async ({ dispatch }) => {
    const archive = await getArchive()
    await archive.unlink(id + '.json')
    dispatch({
      type: 'REMOVED_TASK',
      payload: id
    })
  },
  doToggleComplete: id => async ({ dispatch }) => {
    const archive = await getArchive()
    const task = await archive.readFile(id + '.json').then(JSON.parse)
    await archive.writeFile(
      id + '.json',
      JSON.stringify(assoc('complete', !task.complete, task))
    )
    dispatch({
      type: 'TOGGLED_COMPLETE',
      payload: id
    })
  }
})

export default getStore()

function generateId() {
  return uuid.v4()
}

function getArchive() {
  if (window.localStorage.getItem('todo-dat')) {
    return window.DatArchive.load(window.localStorage.getItem('todo-dat'))
  }
  return window.DatArchive.create({ title: 'todos' }).then(archive => {
    window.localStorage.setItem('todo-dat', archive.url)
    return archive
  })
}
