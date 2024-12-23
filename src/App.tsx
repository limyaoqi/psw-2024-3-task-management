import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import "./App.css"; // Make sure to import the CSS file

// Task Interface
interface Task {
  id: string;
  name: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
}

// Reusable Task Card Component
const TaskCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}> = ({ task, onEdit, onDelete }) => (
  <Card className="mb-2 hover:shadow-lg transition-all duration-300">
    <CardContent className="flex justify-between items-center p-3">
      <div>
        <div className="font-medium">{task.name}</div>
        <div className="text-sm text-gray-500">
          Due: {format(new Date(task.dueDate), "PP")}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
          <Edit size={16} color="blue" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
          <Trash2 size={16} color="red" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Main App Component
function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const resetForm = () => {
    setTaskName("");
    setPriority("Medium");
    setDueDate("");
    setEditingTask(null);
  };

  const addOrUpdateTask = () => {
    if (!taskName || !dueDate) return;

    const newTask: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      name: taskName,
      priority,
      dueDate,
    };

    setTasks((prevTasks) =>
      editingTask
        ? prevTasks.map((t) => (t.id === editingTask.id ? newTask : t))
        : [...prevTasks, newTask]
    );

    resetForm();
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setPriority(task.priority);
    setDueDate(task.dueDate);
  };

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.priority]) acc[task.priority] = [];
      acc[task.priority].push(task);
      return acc;
    }, {} as Record<Task["priority"], Task[]>);
  }, [tasks]);

  const priorityOrder = ["High", "Medium", "Low"];

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      {/* Main Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Task Management Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Task Form */}
            <div className="space-y-4 border-r pr-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                {editingTask ? "Edit Task" : "Add New Task"}
              </h2>
              <Input
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="input-styled"
              />

              <Select
                value={priority}
                onValueChange={(val: Task["priority"]) => setPriority(val)}
              >
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {["Low", "Medium", "High"].map((p) => (
                    <SelectItem key={p} value={p} className="select-item">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onFocus={(e) => e.target.showPicker?.()}
                className="input-styled"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={addOrUpdateTask}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? "Update Task" : "Add Task"}
                </Button>
                {editingTask && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Task List */}
            <div className="md:col-span-2">
              {priorityOrder.map(
                (priorityLevel) =>
                  groupedTasks[priorityLevel] && (
                    <div key={priorityLevel} className="mb-6">
                      <h2
                        className={`text-xl font-bold mb-2 ${
                          priorityLevel === "High"
                            ? "text-red-600"
                            : priorityLevel === "Medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {priorityLevel} Priority Tasks
                      </h2>
                      {groupedTasks[priorityLevel].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={editTask}
                          onDelete={deleteTask}
                        />
                      ))}
                    </div>
                  )
              )}
              {!tasks.length && (
                <div className="text-center text-gray-500 p-6 bg-gray-100 rounded-md">
                  No tasks yet. Start by adding a new task!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
