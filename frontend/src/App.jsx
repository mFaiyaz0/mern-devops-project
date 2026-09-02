import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = async () => {
    const response = await axios.get(`${API_URL}/tasks`);
    setTasks(response.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    await axios.post(`${API_URL}/tasks`, {
      title,
      description,
    });

    setTitle("");
    setDescription("");

    fetchTasks();
  };

  const toggleTask = async (task) => {
    await axios.put(`${API_URL}/tasks/${task._id}`, {
      completed: !task.completed,
    });

    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div className="container">
      <h1>MERN Task Manager</h1>

      <p className="subtitle">
        Docker + Terraform + Ansible DevOps Project
      </p>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>

      <div className="tasks">
        {tasks.map((task) => (
          <div className="task" key={task._id}>
            <div>
              <h3 className={task.completed ? "completed" : ""}>
                {task.title}
              </h3>

              <p>{task.description}</p>
            </div>

            <div className="actions">
              <button onClick={() => toggleTask(task)}>
                {task.completed ? "Undo" : "Complete"}
              </button>

              <button onClick={() => deleteTask(task._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
