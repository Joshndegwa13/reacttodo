import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { db } from './firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';

function App() {
  const [input, setInput] = useState('');
  const [pendingTodos, setPendingTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);

  useEffect(() => {
    const pendingRef = ref(db, 'todos/pending');
    const completedRef = ref(db, 'todos/completed');

    onValue(pendingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todoList = Object.entries(data).map(([id, text]) => ({ id, text }));
        setPendingTodos(todoList);
      } else {
        setPendingTodos([]);
      }
    });

    onValue(completedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todoList = Object.entries(data).map(([id, text]) => ({ id, text }));
        setCompletedTodos(todoList);
      } else {
        setCompletedTodos([]);
      }
    });
  }, []);

  const addTodo = () => {
    if (input) {
      push(ref(db, 'todos/pending'), input);
      setInput('');
    }
  };

  const completeTodo = (todo) => {
    remove(ref(db, `todos/pending/${todo.id}`));
    push(ref(db, 'todos/completed'), todo.text);
  };

  const undoComplete = (todo) => {
    remove(ref(db, `todos/completed/${todo.id}`));
    push(ref(db, 'todos/pending'), todo.text);
  };

  const deleteTodo = (todo, isCompleted) => {
    const path = isCompleted ? 'completed' : 'pending';
    remove(ref(db, `todos/${path}/${todo.id}`));
  };

  return (
    <div className="min-h-screen bg-black p-4 flex justify-center">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-6 border border-purple-500">
        {/* Header */}
        <div className="flex gap-2 mb-6 justify-center">
          <ListTodo className="text-purple-500" />
          <h1 className="text-2xl text-white">Todo List</h1>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addTodo()}
            placeholder="New task"
            className="w-full p-2 bg-zinc-800 text-white border border-purple-500 rounded-lg"
          />
          <button
            onClick={addTodo}
            className="w-full mt-2 bg-purple-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700"
          >
            <Plus />
            Add
          </button>
        </div>

        {/* Pending Tasks */}
        <div className="mb-6">
          <h2 className="text-purple-500 font-semibold mb-2">Pending Tasks</h2>
          <ul className="space-y-2">
            {pendingTodos.map((todo) => (
              <li key={todo.id} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                <span className="text-white">{todo.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => completeTodo(todo)}
                    className="text-green-400 hover:text-green-500"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo, false)}
                    className="text-purple-400 hover:text-purple-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Completed Tasks */}
        <div>
          <h2 className="text-purple-500 font-semibold mb-2">Completed Tasks</h2>
          <ul className="space-y-2">
            {completedTodos.map((todo) => (
              <li key={todo.id} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg opacity-75">
                <span className="text-white line-through">{todo.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => undoComplete(todo)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <XCircle size={20} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo, true)}
                    className="text-purple-400 hover:text-purple-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;