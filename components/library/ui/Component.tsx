import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type AIModel = {
  modelName: string;
  accuracy: number;
  parameters: number;
  useCases: string;
}

// Example data - replace with your actual data
const aiModels: AIModel[] = [
  { modelName: "GPT-4", accuracy: 94, parameters: 1750000000000, useCases: "Text generation, reasoning, creative writing" },
  { modelName: "Claude 2", accuracy: 92, parameters: 137000000000, useCases: "Conversation, document analysis" },
  { modelName: "PaLM", accuracy: 89, parameters: 540000000000, useCases: "Multilingual tasks, code generation" },
  { modelName: "Llama 2", accuracy: 87, parameters: 70000000000, useCases: "Open-source applications, research" },
  { modelName: "BERT", accuracy: 82, parameters: 340000000, useCases: "NLP tasks, sentiment analysis" },
]

// Format large numbers with abbreviations
const formatNumber = (num: number): string => {
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(1) + 'T';
  } else if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function AIModelComparisonChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">AI Model Comparison</CardTitle>
        <CardDescription>
          Comparing key specifications of popular AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Model Name</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Accuracy
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Performance accuracy on benchmark tasks</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Parameters
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of trainable parameters in the model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="min-w-[250px]">Use Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiModels.map((model) => (
                <TableRow key={model.modelName}>
                  <TableCell className="font-medium">{model.modelName}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatNumber(model.parameters)}</span>
                      </div>
                      <Progress 
                        value={Math.log10(model.parameters) / Math.log10(2000000000000) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {model.useCases.split(", ").map((useCase) => (
                        <Badge key={useCase} variant="outline" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Accuracy</h3>
            <p className="text-sm text-muted-foreground">
              Represents the model's performance on standard benchmark tasks. Higher percentages indicate better performance.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Parameters</h3>
            <p className="text-sm text-muted-foreground">
              The number of trainable variables in the model. Generally, more parameters allow for more complex reasoning but require more computational resources.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}