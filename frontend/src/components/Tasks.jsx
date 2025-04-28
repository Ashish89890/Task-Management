// components/Tasks.jsx

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {
  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [fetchData, { loading }] = useFetch();
  const [filterStatus, setFilterStatus] = useState("all"); // <- Added filter state

  const fetchTasks = useCallback(() => {
    const config = { url: "/tasks", method: "get", headers: { Authorization: authState.token } };
    fetchData(config, { showSuccessToast: false }).then(data => setTasks(data.tasks));
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  const handleDelete = (id) => {
    const config = { url: `/tasks/${id}`, method: "delete", headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  };

  const handleUpdate = (task) => {
    const config = { 
      url: `/tasks/${task._id}`, 
      method: "put", 
      headers: { Authorization: authState.token },
      data: { 
        description: task.description, 
        completed: !task.completed 
      },
    };
    fetchData(config).then(() => fetchTasks());
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === "completed") return task.completed;
    if (filterStatus === "pending") return !task.completed;
    return true; // "all"
  });

  return (
    <>
      <div className="my-2 mx-auto max-w-[700px] py-4">
        {tasks.length !== 0 && (
          <h2 className='my-2 ml-2 md:ml-0 text-xl'>Your tasks ({tasks.length})</h2>
        )}
        
        {/* Filter Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-md ${filterStatus === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-md ${filterStatus === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-md ${filterStatus === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div>
            {filteredTasks.length === 0 ? (
              <div className='w-[600px] h-[300px] flex items-center justify-center gap-4'>
                <span>No tasks found</span>
                <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">
                  + Add new task
                </Link>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task._id} className='bg-white my-4 p-4 text-gray-600 rounded-md shadow-md'>
                  <div className='flex items-center'>
                    <span className='font-medium'>Task #{index + 1}</span>

                    <Tooltip text={"Edit this task"} position={"top"}>
                      <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                    </Tooltip>

                    <Tooltip text={"Delete this task"} position={"top"}>
                      <span className='text-red-500 cursor-pointer mr-2' onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </Tooltip>

                    <Tooltip text={task.completed ? "Mark as Incomplete" : "Mark as Completed"} position={"top"}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleUpdate(task)}
                        className="cursor-pointer"
                      />
                    </Tooltip>
                  </div>

                  <div className={`whitespace-pre mt-2 ${task.completed ? "line-through text-gray-400" : ""}`}>
                    {task.description}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
