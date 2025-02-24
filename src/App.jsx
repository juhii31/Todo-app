import React, { useState, useEffect } from 'react';
import './todo.css';

function App() {
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem('todos');
    return storedTodos ? JSON.parse(storedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('creationDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium'); // low, medium, high
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Check for due dates
  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.dueDate && !todo.completed) {
          const dueDate = new Date(todo.dueDate);
          if (dueDate <= now) {
            showNotificationMessage(`Task "${todo.text}" is due!`);
          }
        }
      });
    };

    const interval = setInterval(checkDueDates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [todos]);

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const addTodo = (text) => {
    if (text.trim() === '') return;
    
    const newTodoItem = {
      text,
      completed: false,
      creationDate: new Date(),
      dueDate: dueDate || null,
      priority,
      id: Date.now(),
    };

    setTodos(prevTodos => [...prevTodos, newTodoItem]);
    showNotificationMessage('Task added successfully!');
  };

  const toggleComplete = (index) => {
    setTodos(prevTodos => {
      const updatedTodos = [...prevTodos];
      updatedTodos[index].completed = !updatedTodos[index].completed;
      showNotificationMessage(updatedTodos[index].completed ? 'Task completed!' : 'Task uncompleted');
      return updatedTodos;
    });
  };

  const deleteTodo = (index) => {
    setTodos(prevTodos => {
      const updatedTodos = [...prevTodos];
      updatedTodos.splice(index, 1);
      showNotificationMessage('Task deleted');
      return updatedTodos;
    });
  };

  const editTodo = (index, newText, newDueDate, newPriority) => {
    if (newText.trim() === '') return;
    
    setTodos(prevTodos => {
      const updatedTodos = [...prevTodos];
      updatedTodos[index] = {
        ...updatedTodos[index],
        text: newText,
        dueDate: newDueDate || updatedTodos[index].dueDate,
        priority: newPriority || updatedTodos[index].priority,
      };
      return updatedTodos;
    });
    
    setEditingIndex(null);
    setEditText('');
    showNotificationMessage('Task updated successfully!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editingIndex !== null) {
        handleSaveEdit();
      } else {
        handleAddTodo();
      }
    }
  };

  const handleAddTodo = () => {
    addTodo(newTodo);
    setNewTodo('');
    setDueDate('');
    setPriority('medium');
  };

  const handleSaveEdit = () => {
    editTodo(editingIndex, editText, dueDate, priority);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffbb33';
      case 'low': return '#00C851';
      default: return '#4285f4';
    }
  };

  const getFilteredAndSortedTodos = () => {
    let filteredTodos = todos;

    // Search filter
    if (searchQuery) {
      filteredTodos = filteredTodos.filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    switch (filterType) {
      case 'active':
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
        break;
      case 'completed':
        filteredTodos = filteredTodos.filter(todo => todo.completed);
        break;
      default:
        break;
    }

    // Sorting
    return [...filteredTodos].sort((a, b) => {
      switch (sortBy) {
        case 'text':
          return a.text.localeCompare(b.text);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return new Date(a.creationDate) - new Date(b.creationDate);
      }
    });
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditText(todos[index].text);
    setDueDate(todos[index].dueDate || '');
    setPriority(todos[index].priority);
  };

  return (
    <div className="App">
      <h1>My To-Do List</h1>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Add Todo Form */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onClick={handleAddTodo}>Add</button>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <button 
          className={filterType === 'all' ? 'active' : ''} 
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button 
          className={filterType === 'active' ? 'active' : ''} 
          onClick={() => setFilterType('active')}
        >
          Active
        </button>
        <button 
          className={filterType === 'completed' ? 'active' : ''} 
          onClick={() => setFilterType('completed')}
        >
          Completed
        </button>
      </div>

      {/* Sort Controls */}
      <div className="sort-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="creationDate">Creation Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="text">Text</option>
        </select>
      </div>

      {/* Todo List */}
      <ul>
        {getFilteredAndSortedTodos().map((todo, index) => (
          <li 
            key={todo.id} 
            className={todo.completed ? 'completed' : ''}
            style={{ borderLeft: `5px solid ${getPriorityColor(todo.priority)}` }}
          >
            {editingIndex === index ? (
              <div className="edit-container">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button onClick={handleSaveEdit}>Save</button>
              </div>
            ) : (
              <div className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(index)}
                />
                <span className="todo-text">{todo.text}</span>
                {todo.dueDate && (
                  <span className="due-date">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
                <div className="todo-actions">
                  <button onClick={() => handleEditClick(index)}>Edit</button>
                  <button onClick={() => deleteTodo(index)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Clear Completed Button */}
      <button 
        onClick={() => {
          setTodos(todos.filter(todo => !todo.completed));
          showNotificationMessage('Completed tasks cleared!');
        }}
        className="clear-completed"
      >
        Clear Completed
      </button>

      {/* Notification */}
      {showNotification && (
        <div className="notification">
          {notificationMessage}
        </div>
      )}
    </div>
  );
}

export default App;