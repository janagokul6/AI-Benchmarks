"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AIModel } from "@/lib/models";

interface ModelSelectorProps {
  models: AIModel[];
}

export default function ModelSelector({ models }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize selected models from URL or defaults
  useEffect(() => {
    const modelsParam = searchParams.get("models");
    if (modelsParam) {
      setSelectedModels(modelsParam.split(","));
    } else {
      // Default to first 4 models if none selected
      setSelectedModels(models.slice(0, 4).map((model) => model.id));
    }
  }, [searchParams, models]);

  const toggleModel = (modelId: string) => {
    setSelectedModels((current) => {
      const newSelection = current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId];

      // Update URL with selected models
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("models", newSelection.join(","));
      router.push(`/?${currentParams.toString()}`);

      return newSelection;
    });
  };

  const removeModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModels((current) => {
      const newSelection = current.filter((id) => id !== modelId);

      // Update URL with selected models
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("models", newSelection.join(","));
      router.push(`/?${currentParams.toString()}`);

      return newSelection;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Select AI Models to Compare:
        </label>
        <span className="text-xs text-muted-foreground">
          {selectedModels.length} selected
        </span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-auto min-h-10 py-2"
          >
            <div className="flex flex-wrap gap-1 max-w-full">
              {selectedModels.length > 0 ? (
                selectedModels.map((modelId) => {
                  const model = models.find((m) => m.id === modelId);
                  return model ? (
                    <Badge
                      key={model.id}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      {model.name}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeModel(model.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            removeModel(
                              model.id,
                              e as unknown as React.MouseEvent
                            );
                          }
                        }}
                        className="ml-1 rounded-full hover:bg-muted p-0.5 cursor-pointer"
                      >
                        ×
                      </span>
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-muted-foreground">Select models...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[300px]">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {models.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={() => toggleModel(model.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedModels.includes(model.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.provider}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
