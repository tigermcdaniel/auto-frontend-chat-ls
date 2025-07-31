import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface TodoItem {
  task: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { task: "Complete project proposal", completed: false },
    { task: "Review code changes", completed: true },
    { task: "Schedule team meeting", completed: false },
    { task: "Update documentation", completed: false },
    { task: "Prepare presentation slides", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTodos([...todos, { task: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleCompleted = (index: number) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    setTodos(updatedTodos);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <CardTitle className="text-xl font-bold text-center">Todo List</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex space-x-2 mb-6">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={addTask} size="sm" className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks yet. Add one above!</p>
          ) : (
            todos.map((todo, index) => (
              <div 
                key={index} 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`task-${index}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleCompleted(index)}
                  className="mr-3 data-[state=checked]:bg-purple-600"
                />
                <label
                  htmlFor={`task-${index}`}
                  className={`flex-1 cursor-pointer ${
                    todo.completed ? "line-through text-gray-400" : "text-gray-700"
                  }`}
                >
                  {todo.task}
                </label>
              </div>
            ))
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-6 text-center">
          Here is your todo list with {todos.length} tasks. You can add more tasks, check them off when completed, and manage your day effectively!
        </p>
      </CardContent>
    </Card>
  );
}