import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  dueDate?: Date;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const addTodo = () => {
    if (newTask.trim() === '') return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      task: newTask,
      completed: false,
      dueDate: dueDate,
    };
    
    setTodos([...todos, newTodo]);
    setNewTask('');
    setDueDate(undefined);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="px-2">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={addTodo}>Add</Button>
            </div>
            
            {dueDate && (
              <div className="text-sm text-muted-foreground">
                Due date: {format(dueDate, 'PPP')}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No tasks yet. Add one above!
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    todo.completed ? "bg-muted/50" : "bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                    <Label
                      htmlFor={`todo-${todo.id}`}
                      className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.task}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {todo.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        {format(todo.dueDate, 'MMM d')}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}