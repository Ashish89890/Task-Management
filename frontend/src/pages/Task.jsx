import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '../components/utils/Input';
import Loader from '../components/utils/Loader';
import useFetch from '../hooks/useFetch';
import MainLayout from '../layouts/MainLayout';
import validateManyFields from '../validations';

const Task = () => {
  const authState = useSelector(state => state.authReducer);
  const navigate = useNavigate();
  const [fetchData, { loading }] = useFetch();
  const { taskId } = useParams();

  const mode = taskId === undefined ? "add" : "update";
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    completed: false, // <-- Added completed field
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.title = mode === "add" ? "Add Task" : "Update Task";
  }, [mode]);

  useEffect(() => {
    if (mode === "update") {
      const config = { url: `/tasks/${taskId}`, method: "get", headers: { Authorization: authState.token } };
      fetchData(config, { showSuccessToast: false }).then((data) => {
        setTask(data.task);
        setFormData({
          description: data.task.description,
          completed: data.task.completed, // <-- Load completed status
        });
      });
    }
  }, [mode, authState, taskId, fetchData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value, // <-- Handle checkbox separately
    }));
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (task) {
      setFormData({
        description: task.description,
        completed: task.completed, // <-- Reset completed too
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateManyFields("task", formData);
    setFormErrors({});

    if (errors.length > 0) {
      setFormErrors(errors.reduce((total, ob) => ({ ...total, [ob.field]: ob.err }), {}));
      return;
    }

    const config = {
      url: mode === "add" ? "/tasks" : `/tasks/${taskId}`,
      method: mode === "add" ? "post" : "put",
      data: formData,
      headers: { Authorization: authState.token },
    };

    fetchData(config).then(() => {
      navigate("/");
    });
  };

  const fieldError = (field) => (
    <p className={`mt-1 text-pink-600 text-sm ${formErrors[field] ? "block" : "hidden"}`}>
      <i className='mr-2 fa-solid fa-circle-exclamation'></i>
      {formErrors[field]}
    </p>
  );

  return (
    <>
      <MainLayout>
        <form className='m-auto my-16 max-w-[1000px] bg-white p-8 border-2 shadow-md rounded-md'>
          {loading ? (
            <Loader />
          ) : (
            <>
              <h2 className='text-center mb-4'>{mode === "add" ? "Add New Task" : "Edit Task"}</h2>
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <Textarea
                  type="description"
                  name="description"
                  id="description"
                  value={formData.description}
                  placeholder="Write here.."
                  onChange={handleChange}
                />
                {fieldError("description")}
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="completed"
                  name="completed"
                  checked={formData.completed}
                  onChange={handleChange}
                  className="mr-2 cursor-pointer"
                />
                <label htmlFor="completed" className="cursor-pointer">Completed</label>
              </div>

              <button className='bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark' onClick={handleSubmit}>
                {mode === "add" ? "Add Task" : "Update Task"}
              </button>
              <button className='ml-4 bg-red-500 text-white px-4 py-2 font-medium' onClick={() => navigate("/")}>
                Cancel
              </button>
              {mode === "update" && (
                <button className='ml-4 bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600' onClick={handleReset}>
                  Reset
                </button>
              )}
            </>
          )}
        </form>
      </MainLayout>
    </>
  );
};

export default Task;
